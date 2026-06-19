// منطق Tauri لتطبيق "Prompt Iterator Desktop"
// يوفّر أوامر لحفظ مفاتيح API في الـ OS Keychain واختبار الاتصال بالمزوّد.

use keyring::Entry;

// اسم الخدمة المستخدَم في الـ Keychain
const SERVICE_NAME: &str = "prompt-iterator-desktop";

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

/// تهيئة وتشغيل تطبيق Tauri وتسجيل الأوامر الخمسة
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_api_key,
            get_api_key,
            delete_api_key,
            has_api_key,
            test_api_connection
        ])
        .run(tauri::generate_context!())
        .expect("خطأ أثناء تشغيل تطبيق Tauri");
}
