 // Import the `event` module from the `tauri` crate
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, fs::{self, File, OpenOptions}, io::{Read, Write}};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::clone::Clone;
use lib::{wifiscan, WiFi, WifiInterface};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Data {
    order: u32,
    ip: String,
    mac: String,
    gateway: String,
    ssid: String,
}

impl Data {
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
        self.count
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
    // ファイルが存在しないときだけ新規作成
    if !check_config_file() {
        let config = Config {
            devicename: String::from(""),
            count: 0,
            confignow: 0,
            data: HashMap::new(),
        };
        let serialized = serde_json::to_string_pretty(&config).unwrap();
        fs::create_dir_all("config").unwrap();
        let mut file = File::create("config/config.json").unwrap();
        file.write_all(serialized.as_bytes()).unwrap();
    }
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

fn get_ssid() -> Vec<String> {
    let mut ssid_vec: Vec<String> = vec![];
    let config = get_config();
    let interfaces_get = config.get_device_name();
    let interfaces: WiFi = WiFi::new(interfaces_get);
    let ssid = wifiscan::WiFi::visible_ssid(&interfaces);
    match ssid {
        Ok(ssid) => {
            for i in ssid {
                ssid_vec.push(i);
            }
        }
        Err(e) => {
            println!("{:?}", e);
        }
    };
    ssid_vec
}

fn set_config_device(device: String) {
    let mut config = get_config();

    config.devicename = device;

    config.write_config();
}

fn get_config_device() -> String {
    let config = get_config();
    config.get_device_name().to_string()
}

fn add_config_data(name: String, ip: String, mac: String, gateway: String, ssid: String) {
    let config = get_config();
    let data_count = config.get_data_count();
    let order = data_count + 1;
    let test_data: Data = Data {
        order,
        ip,
        mac,
        gateway,
        ssid
    };
    set_count(order);
    test_data.set_data(&name);
}

fn edit_config_data(name: String, ip: String, mac: String, gateway: String, ssid: String) {
    let config = get_config();
    let data = config.get_config_data(&name);
    let order = data.order;
    let test_data: Data = Data {
        order,
        ip,
        mac,
        gateway,
        ssid
    };
    test_data.set_data(&name);
}

fn check_have_data(name: &str) -> bool {
    let config = get_config();
    let data_name = config.get_data_name();
    data_name.iter().any(|n| n == name)
}

fn get_config_data_list() -> Vec<String> {
    let config = get_config();
    config.get_data_name()
}

fn get_config_data(name: &str) -> Data {
    let config = get_config();
    config.get_config_data(name)
}

// -------------------------------------------- ここからはipchengerからの移植

fn execute_command(iptype: String, devicename: String, ip: String, mac: String, gateway: String) {
    let netcommand = match iptype.as_str() {
        "static" => format!("netsh int ip set addr name=\"{}\" static {} {} {}", devicename, ip, mac, gateway),
        "dhcp" => format!("netsh int ip set addr name=\"{}\" dhcp", devicename),
        _ => panic!("不明なiptype: {}", iptype),
    };
    let output = tauri::api::process::Command::new_sidecar("netsh")
        .args(["/C", &netcommand])
        .output()
        .expect("IP設定: 実行されませんでした: 不明なエラー");
    if output.status.success() {
        println!("IP設定: 設定が完了しました。");
    } else {
        let result = String::from_utf8_lossy(&output.stderr);
        eprintln!("IP設定: 実行されませんでした: {}", result);
    }
}

fn connect_wifi(ssid: String) {
    let now_connecting_wifi = get_connecting_wifi_name();
    if now_connecting_wifi == ssid {
        println!("WiFi設定: すでに接続されています。");
    } else {
        let netcommand = format!("netsh wlan connect name=\"{}\"", ssid);
        let output = Command::new("cmd")
            .args(["/C", &netcommand])
            .output();
        match output {
            Ok(output) => {
                if output.status.success() {
                    println!("WiFi設定: 設定が完了しました。");
                } else {
                    let result = String::from_utf8_lossy(&output.stderr);
                    eprintln!("実行されませんでした: {}", result);
                }
            },
            Err(e) => {
                eprintln!("コマンドの実行中にエラーが発生しました: {}", e);
            }
        }
    }
}

fn get_connecting_wifi_name() -> String {
    let config = get_config();
    let device_name = config.get_device_name();
    let command = format!(r#"$result = (Get-NetConnectionProfile -InterfaceAlias '{}').Name; [Console]::OutputEncoding = [Text.Encoding]::UTF8; $result"#, device_name);
    let output = Command::new("powershell")
        .args(["-Command", &command])
        .output()
        .expect("failed to execute process");
    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout);
        result.to_string()
    } else {
        let result = String::from_utf8_lossy(&output.stderr);
        println!("エラーが発生しました: {}", result);
        "error".to_string()
    }    
}

// ------------------------------------------------------------------------
// ここからtauriのコマンド
#[tauri::command]
fn t_get_device_list() -> String {
    let interface_names = get_interface_names();
    json!(interface_names).to_string()
}

#[tauri::command]
fn t_get_ssid() -> String {
    let ssid_vec = get_ssid();
    json!(ssid_vec).to_string()
}

#[tauri::command]
fn t_set_config_device(device: String) {
    set_config_device(device);
}

#[tauri::command]
fn t_get_config_device() -> String {
    let device = get_config_device();
    println!("{}", device);
    device
}

#[tauri::command]
fn t_add_config_data(name: String, ip: String, subnetmask: String, gateway: String, ssid: String) {
    println!("name: {}, ip: {}, mac: {}, subnetmask: {}, ssid: {}", name, ip, subnetmask, gateway, ssid);
    add_config_data(name, ip, subnetmask, gateway, ssid);
}

#[tauri::command]
fn t_check_have_data(name: String) -> bool {
    check_have_data(&name)
}

#[tauri::command]
fn t_get_data_list() -> String {
    let data_list = get_config_data_list();
    json!(data_list).to_string()
}

#[tauri::command]
fn t_get_config_data(name: String) -> String {
    let data = get_config_data(&name);
    json!(data).to_string()
}

#[tauri::command]
fn t_remove_config_data(name: String) {
    config_remove_data(&name);
}

#[tauri::command]
fn t_edit_config_data(name: String, ip: String, mac: String, gateway: String, ssid: String) {
    edit_config_data(name, ip, mac, gateway, ssid);
}

#[tauri::command]
fn t_get_now_config() -> i64 {
    let config = get_config();
    let now = config.get_config_now();
    json!(now).as_i64().unwrap()
}

#[tauri::command]
fn t_run_config_data(name: &str) {
    println!("run_config_data: {}", name);
    let config = get_config();
    let data = config.get_config_data(name);
    if data.ip == "dhcp" {
        //execute_command("dhcp".to_string(), config.get_device_name().to_string(), Default::default(), Default::default(), Default::default());
        let netcommand = match iptype.as_str() {
            "static" => format!("netsh int ip set addr name=\"{}\" static {} {} {}", devicename, ip, mac, gateway),
            "dhcp" => format!("netsh int ip set addr name=\"{}\" dhcp", devicename),
            _ => panic!("不明なiptype: {}", iptype),
        };
        let output = tauri::api::process::Command::new_sidecar("netsh")
            .args(["/C", &netcommand])
            .output()
            .expect("IP設定: 実行されませんでした: 不明なエラー");
        if output.status.success() {
            println!("IP設定: 設定が完了しました。");
        } else {
            let result = String::from_utf8_lossy(&output.stderr);
            eprintln!("IP設定: 実行されませんでした: {}", result);
        }
    } else {
        execute_command("static".to_string(), config.get_device_name().to_string(), data.ip, data.mac, data.gateway);
    }
    connect_wifi(data.ssid);
}

// ------------------------------------------------------------------------

#[tauri::command]
fn testfn2(test: String) {
    println!("debug: {}", test);
}


fn main() {
    config_create();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            testfn2, 
            t_get_device_list, 
            t_get_ssid, 
            t_set_config_device,
            t_get_config_device,
            t_add_config_data,
            t_check_have_data,
            t_get_data_list,
            t_get_config_data,
            t_remove_config_data,
            t_edit_config_data,
            t_get_now_config,
            t_run_config_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
