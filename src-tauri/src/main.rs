 // Import the `event` module from the `tauri` crate
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, fs::OpenOptions, io::{Read, Write}, process::Command};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::clone::Clone;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Data {
    order: u32,
    ip: String,
    mac: String,
    gateway: String,
    ssid: String,
}

impl Data {
    fn get_ip(&self) -> &str {
        &self.ip
    }
    fn get_mac(&self) -> &str {
        &self.mac
    }
    fn get_gateway(&self) -> &str {
        &self.gateway
    }
    fn get_ssid(&self) -> &str {
        &self.ssid
    }
    fn set_data(self, name: &str) {
        let mut config = get_config();

        config.data.insert(name.to_string(), self);

        config.write_config();
        set_count(config.get_data_count());
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Config {
    devicename: String,
    count: u32,
    confignow: u32,
    data: HashMap<String, Data>,
}

impl Config {
    fn get_device_name(&self) -> &String {
        &self.devicename
    }
    fn get_config_count(&self) -> u32 {
        self.count
    }
    fn get_config_now(&self) -> u32 {
        self.confignow
    }
    fn get_config_data(&self, name: &str) -> Data {
        self.data.get(name).unwrap().clone()
    }
    fn get_data_name(&self) -> Vec<String> {
        let data: Value = serde_json::to_value(self).unwrap();
        let object = data["data"].as_object().unwrap();
        object.keys().map(|key| key.to_string()).collect()
    }
    fn get_data_count(&self) -> u32 {
        self.data.len() as u32
    }
    fn write_config(&self) {
        let serialized = serde_json::to_string_pretty(&self).unwrap();
        let mut file = OpenOptions::new()
            .write(true)
            .truncate(true)
            .open("config/config.json")
            .unwrap();
        file.write_all(serialized.as_bytes()).unwrap();
    }
}

fn get_config() -> Config {
    let file = OpenOptions::new()
        .read(true)
        .open("config/config.json");
    match file {
        Ok(mut file) => {
            let mut contents = String::new();
            file.read_to_string(&mut contents).unwrap();
            let json: Config = serde_json::from_str(&contents).unwrap();
            json
        },
        Err(_) => {
            config_create();
            get_config()
        }
    }
}

fn check_config_file() -> bool {
    let file = OpenOptions::new()
        .read(true)
        .open("config/config.json");
    println!("{:?}", file.is_ok());
    file.is_ok()
}

fn config_create() {
    let config = Config {
        devicename: String::from(""),
        count: 0,
        confignow: 0,
        data: HashMap::new(),
    };
    let serialized = serde_json::to_string_pretty(&config).unwrap();
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open("config/config.json")
        .unwrap();
    file.write_all(serialized.as_bytes()).unwrap();
}

fn set_count(count: u32) {
    let mut config = get_config();

    config.count = count;

    config.write_config();
}


fn config_remove_data(name: &str) {
    let mut config = get_config();

    config.data.remove(name);

    config.write_config();
    set_count(config.get_data_count());
}

fn get_interface_names() -> Vec<String> {
    let mut interface_names = vec![];
    let network_interfaces = default_net::get_interfaces();

    for interface in network_interfaces {
        if let Some(name) = interface.friendly_name {
            interface_names.push(name);
        } else {
            println!("Interface not found");
        }
    }

    interface_names
}

// -------------------------------------------- ここからはipchengerからの移植
fn get_device_id() -> Vec<String> {
    let output = Command::new("powershell")
        .args(&["-Command", "$result = Get-WmiObject Win32_NetworkAdapter | Select-Object -ExpandProperty NetConnectionID; [Console]::OutputEncoding = [Text.Encoding]::UTF8; $result"])
        .output()
        .expect("failed to execute process");
    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout);
        result.split('\n').map(|s| s.to_string()).collect()
    } else {
        let result = String::from_utf8_lossy(&output.stderr);
        println!("エラーが発生しました: {}", result);
        Vec::new()
    }
}
// ------------------------------------------------------------------------
// ここからtauriのコマンド

#[tauri::command]
fn t_get_device_list() -> String {
    let mut interface_names = get_interface_names();
    json!(interface_names).to_string()
    
}

// ------------------------------------------------------------------------

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

#[tauri::command]
fn testfn2(test: String) {
    println!("debug: {}", test);
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![testfn, testfn2, greet, t_get_device_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
