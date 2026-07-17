// منع ظهور نافذة الطرفية على Windows في وضع الإصدار
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    muharrir_lib::run();
}
