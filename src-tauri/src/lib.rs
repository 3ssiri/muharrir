// منطق Tauri لتطبيق Muharrir Desktop
// يوفّر أوامر لحفظ مفاتيح API في الـ OS Keychain واختبار الاتصال بالمزوّد.

use keyring::Entry;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

// اسم الخدمة المستخدَم في الـ Keychain
const SERVICE_NAME: &str = "muharrir-desktop";

/// حفظ مفتاح API في الـ OS Keychain
/// Windows: Credential Manager | macOS: Keychain | Linux: Secret Service
#[tauri::command]
fn save_api_key(provider: String, api_key: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &provider).map_err(|e| e.to_string())?;
    entry.set_password(&api_key).map_err(|e| e.to_string())
}

/// جلب مفتاح API المحفوظ لمزوّد معيّن
#[tauri::command]
fn get_api_key(provider: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(password) => Ok(password),
        Err(keyring::Error::NoEntry) => Err(format!("لا يوجد مفتاح محفوظ للمزوّد: {}", provider)),
        Err(e) => Err(e.to_string()),
    }
}

/// حذف مفتاح API المحفوظ من النظام
#[tauri::command]
fn delete_api_key(provider: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &provider).map_err(|e| e.to_string())?;
    match entry.delete_password() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()), // غير موجود أصلاً = نجاح
        Err(e) => Err(e.to_string()),
    }
}

/// التحقّق ممّا إذا كان هناك مفتاح محفوظ لمزوّد معيّن
#[tauri::command]
fn has_api_key(provider: String) -> Result<bool, String> {
    let entry = Entry::new(SERVICE_NAME, &provider).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(_) => Ok(true),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(e) => Err(e.to_string()),
    }
}

/// اختبار الاتصال بالمزوّد عبر GET إلى {base_url}/models
/// يعيد true إذا كانت الاستجابة 2xx | مهلة 10 ثوانٍ
#[tauri::command]
async fn test_api_connection(base_url: String, api_key: String) -> Result<bool, String> {
    let url = format!("{}/models", base_url.trim_end_matches('/'));
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.status().is_success())
}

/// إظهار النافذة الرئيسية وإعطاؤها التركيز
fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// تبديل ظهور النافذة الرئيسية: إخفاؤها إن كانت ظاهرة، وإلا إظهارها وتركيزها
fn toggle_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            show_main_window(app);
        }
    }
}

/// بناء أيقونة شريط النظام (System Tray) مع قائمة: إظهار / إخفاء / خروج
fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItem::with_id(app, "show", "إظهار", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "إخفاء", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "خروج", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &hide, &quit])?;

    TrayIconBuilder::with_id("main-tray")
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Muharrir")
        .menu(&menu)
        .show_menu_on_left_click(false) // القائمة باليمين فقط
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => show_main_window(app),
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            // النقر الأيسر يبدّل ظهور النافذة (إظهار/إخفاء)
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_main_window(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

/// تسجيل اختصار عام على مستوى النظام (Ctrl+Shift+K) لتبديل ظهور النافذة
#[cfg(desktop)]
fn setup_global_shortcut(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

    let toggle = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyK);
    app.handle().plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_shortcut(toggle)?
            .with_handler(move |app, shortcut, event| {
                if shortcut == &toggle && event.state() == ShortcutState::Pressed {
                    toggle_main_window(app);
                }
            })
            .build(),
    )?;
    Ok(())
}

/// تهيئة وتشغيل تطبيق Tauri وتسجيل الأوامر الخمسة
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // فتح الروابط الخارجية (قسم «حول») في متصفّح/تطبيق النظام
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_api_key,
            get_api_key,
            delete_api_key,
            has_api_key,
            test_api_connection
        ])
        .setup(|app| {
            setup_tray(app)?;
            #[cfg(desktop)]
            {
                setup_global_shortcut(app)?;
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
                app.handle().plugin(tauri_plugin_process::init())?;
            }
            Ok(())
        })
        // إغلاق النافذة (X) يُخفيها إلى شريط النظام بدل إنهاء التطبيق
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("خطأ أثناء تشغيل تطبيق Tauri");
}
