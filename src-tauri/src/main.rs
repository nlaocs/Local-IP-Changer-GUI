 // Import the `event` module from the `tauri` crate
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::WindowBuilder;
use tauri::Manager;
use serde::{Serialize, Deserialize};

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn testfn(ip: String, mac: String, gateway: String, ssid: String) {
    println!("SSID: {}", ssid);
    println!("IP: {}", ip);
    println!("MAC: {}", mac);
    println!("Gateway: {}", gateway);
}

/*#[tauri::command]
async fn create_window(app: tauri::AppHandle) {
    println!("create_window called");
    let window = WindowBuilder::new(
        &app,
        "tauri",
        tauri::WindowUrl::App("settings.html".into()),
    )
    .resizable(false)
    .title("Settings".to_string())
    .focused(true)

    .build();
}*/

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![testfn])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
