# 📋 الخطوات المتبقّية — Prompt Iterator Desktop

هذا الملف يوثّق الخطوات التي تعذّر تنفيذها من بيئة التطوير السحابية (Linux/headless،
وGitHub Actions معطّل، وشبكة تحجب خوادم Microsoft). نفّذها عبر Codex أو يدوياً.

## ✅ المُنجَز (مرجع)
- تحويل Next.js → Tauri v2 (static export)
- حفظ مفاتيح API في الـ OS Keychain (موصول)
- تنظيف أمني/لغوي كامل (لا مفاتيح مسرّبة، لا صينية، لا آثار المستودع الأصلي)
- حزم Linux مبنيّة فعلياً: `.deb` / `.rpm` / `.AppImage`
- CI على كل PR (`ci.yml`) + بناء متعدّد المنصّات (`build-desktop.yml`)
- ميزات v1.1: أيقونة System Tray + اختصار عام `Ctrl+Shift+K`

---

## 1️⃣ تفعيل GitHub Actions (الأولوية القصوى)
السبب الجذري لكل فشل CI ولتعذّر بناء Windows/macOS تلقائياً.
- **Settings → Actions → General** → فعّل **Allow all actions and reusable workflows**.
- **Settings → Billing and licensing** → تأكّد من توفّر دقائق Actions (المستودعات الخاصة تستهلك من الحصّة).
- بعدها تعمل `ci.yml` و`build-desktop.yml` تلقائياً.

## 2️⃣ إصدار رسمي متعدّد المنصّات (`.msi`/`.exe` + `.dmg` + Linux)
```bash
git checkout master && git pull
git tag v0.1.0
git push origin v0.1.0
```
→ يشغّل `build-desktop.yml` على الأنظمة الثلاثة وينشئ **Release مسودة** بكل المثبّتات. راجعها ثم انشرها.
بديل: تبويب **Actions → Build Desktop → Run workflow**.

## 3️⃣ بناء يدوي لـ Windows / macOS (بديل)
**Windows** (يتطلّب Rust عبر rustup، Node 20، Visual Studio Build Tools/MSVC، WebView2):
```bash
npm install
npm run tauri build
# الناتج: src-tauri\target\release\bundle\msi\*.msi  و  nsis\*-setup.exe
```
**macOS** (يتطلّب Xcode CLT، Rust، Node 20):
```bash
npm install
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run tauri build -- --target universal-apple-darwin
# الناتج: src-tauri/target/release/bundle/dmg/*.dmg
```

## 4️⃣ التحديث التلقائي (auto-update) — آخر بند v1.1
**أ. ولّد مفتاح التوقيع (مرّة واحدة):**
```bash
npm run tauri signer generate -- -w ~/.tauri/muharrir.key
```
**ب. أضف Secrets** (Settings → Secrets and variables → Actions):
- `TAURI_SIGNING_PRIVATE_KEY` = محتوى `~/.tauri/muharrir.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = كلمة المرور

**ج. `src-tauri/Cargo.toml`:**
```toml
tauri-plugin-updater = "2"
```
**د. `src-tauri/src/lib.rs`** — داخل `.setup(...)` للسطح المكتبي:
```rust
#[cfg(desktop)]
{
    setup_global_shortcut(app)?;
    app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
}
```
**هـ. `src-tauri/tauri.conf.json`:**
```json
"bundle": { "createUpdaterArtifacts": true },
"plugins": {
  "updater": {
    "endpoints": ["https://github.com/3ssiri/muharrir/releases/latest/download/latest.json"],
    "pubkey": "<المفتاح_العام_من_الخطوة_أ>"
  }
}
```
**و. `src-tauri/capabilities/default.json`:**
```json
"permissions": ["core:default", "updater:default"]
```
**ز. الواجهة:**
```bash
npm install @tauri-apps/plugin-updater @tauri-apps/plugin-process
```
في `src/app/[locale]/page.tsx` (مع حارس `isTauriApp`):
```ts
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
const update = await check();
if (update) { await update.downloadAndInstall(); await relaunch(); }
```
**ح. `.github/workflows/build-desktop.yml`** — أضف للأسرار في بيئة خطوة `tauri-action`:
```yaml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

## 5️⃣ اختبار تشغيل فعلي (smoke test) على جهاز حقيقي
- [ ] فتح النافذة + واجهة عربية RTL سليمة
- [ ] الـ tray يظهر؛ نقر أيسر يبدّل النافذة؛ قائمة اليمين (إظهار/إخفاء/خروج)؛ X يُخفي للشريط
- [ ] `Ctrl+Shift+K` يستدعي/يُخفي النافذة من أي مكان
- [ ] الإعدادات → إدخال مفتاح API → يُحفظ في Keychain النظام
- [ ] إعادة الفتح → المفتاح يُحمَّل تلقائياً من الـ Keychain
- [ ] محادثة حقيقية مع مزوّد تعمل

## 6️⃣ اختياري
- ثغرات npm المتبقّية (6): `npm audit fix --force` يرقّي Next.js إلى 16 (مكسور) — لا يُنصح إلا بترحيل مدروس.
- مفاتيح API المسرّبة: خارج كل الفروع بعد ضغط التاريخ؛ أي بقايا في مراجع GitHub الداخلية تُطهَّر عبر دعم GitHub فقط (تجميلي).
