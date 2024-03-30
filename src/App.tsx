import * as React from 'react';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Modal from "react-modal";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Radio, FormControlLabel } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import { styled } from '@mui/system';
import { dialog } from "@tauri-apps/api";

interface Data {
  order: number;
  ip: string;
  mac: string;
  gateway: string;
  ssid: string;
}

function clickDisplayAlert() {
  console.log("ボタンがクリックされました！");
}

async function get_device_list(): Promise<string[]> {
  const getDeviceList: string = await invoke("t_get_device_list");
  const deviceList: string[] = JSON.parse(getDeviceList);
  return deviceList;
}

async function get_ssid(): Promise<string[]> {
  const getSSID: string = await invoke("t_get_ssid");
  const ssid: string[] = JSON.parse(getSSID);
  return ssid;
}

async function get_config_device(): Promise<string> {
  const getConfigDevice: string = await invoke("t_get_config_device");
  return getConfigDevice;
}

async function get_data_list(): Promise<string[]> {
  const getConfigData: string = await invoke("t_get_data_list");
  const configData: string[] = JSON.parse(getConfigData);
  return configData;
}

async function get_config_data(name: string): Promise<Data> {
  const getConfigData: string = await invoke("t_get_config_data", { name });
  const configData: Data = JSON.parse(getConfigData);
  return configData;
}

const GreenRadio = styled(Radio)({
  color: '#cccccc',
  '&.Mui-checked': {
    color: '#9ec3ff',
  },
});

function ip_regex(ip: string): boolean {
  const ip_pattern = new RegExp('^192\\.168\\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$');
  return ip_pattern.test(ip);
}

function subnetmask_regex(subnetmask: string): boolean {
  const subnetmask_pattern = new RegExp('^(([0-9]|[0-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$');
  return subnetmask_pattern.test(subnetmask);
}

function gateway_regex(gateway: string): boolean {
  const gateway_pattern = new RegExp('^192\.168(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){2}$');
  return gateway_pattern.test(gateway);
}

const get_config_data_Data = async (name: string) => {
  const configData: Data = await get_config_data(name);
  return configData;
}

function App() {
  useEffect(() => {
    get_config_data_string();
  }, []);

  function DataItem({ name }: { name: string }) {
    const [data, setData] = useState<Data | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        const result = await get_config_data_Data(name);
        setData(result);
      };
  
      fetchData();
    }, [name]);
    if (data === null) {
      return null;
    }
    
    const ipSetting = (data: Data) => {
      if (data.ip === 'dhcp') {
        return (
          <div>自動</div>
        );
      } else {
        return (
          <div>マニュアル</div>
        );
      }
    }
  
    if (data === null) {
      return;
    }
  
    return (
      <div className="box">
        {name}<hr />
        <div>{ipSetting(data)}</div>
        <div className="wifiname">{data.ssid}</div>
        <div className="icon">
          <IconButton aria-label="delete" onClick={() => push_remove_button(name)}>
            <DeleteIcon className="deleteIcon" fontSize="large" />
          </IconButton>
          <IconButton aria-label="edit" onClick={() => {setEditIsOpen(true); push_edit_button(name);}}>
            <EditIcon className="editIcon" fontSize="large" />
          </IconButton>
          <IconButton aria-label="play" onClick={clickDisplayAlert}>
            <PlayArrowIcon className="playIcon" fontSize="large" />
          </IconButton>
        </div>
      </div>
    );
  }

  
  async function push_remove_button(name: string) {
    const result = await dialog.ask('本当に' + name + 'を削除しますか？', { title: "Local IP Changer GUI", type: "warning"});
    if (result) { // yes
      invoke('t_remove_config_data', {name: name});
      get_config_data_string();
    } else { // no
      
    }
  }

  const [modalIsOpen, setIsOpen] = useState(false);
  const [settingmodalIsOpen, setSettingIsOpen] = useState(false);
  const [editmodalIsOpen, setEditIsOpen] = useState(false);
  const [ssid, setSSID] = React.useState('');
  const handleChange = (event: SelectChangeEvent) => {
    setSSID(event.target.value as string);
  };
  const [wifi, setWifi] = React.useState('');
  const handleChange2 = (event: SelectChangeEvent) => {
    setWifi(event.target.value as string);
  };
  const settingaddbutton = () => {
    if (selectedValue === 'manual') {
      if (input_name === '') {
        dialog.message('名前が入力されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (input_name.length >= 15) {
        dialog.message('15文字以内にしてください', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (!ip_regex(input_ip)) {
        dialog.message('IPアドレスが正しい形式ではありません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (!subnetmask_regex(input_subnetmask)) {
        dialog.message('サブネットマスクが正しい形式ではありません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (!gateway_regex(input_gateway)) {
        dialog.message('ゲートウェイが正しい形式ではありません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (ssid === '') {
        dialog.message('SSIDが選択されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (check_have_data(input_name)) {
        dialog.message('同じ名前の設定が既に存在します', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      setIsOpen(false);
      add_config_data(input_name, input_ip, input_subnetmask, input_gateway, ssid);
    }
    if (selectedValue === 'dhcp') {
      if (input_name === '') {
        dialog.message('名前が入力されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (ssid === '') {
        dialog.message('SSIDが選択されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (check_have_data(input_name)) {
        dialog.message('同じ名前の設定が既に存在します', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      setIsOpen(false);
      add_config_data(input_name, 'dhcp', '', '', ssid);
    }
    reset_input_value();
    get_config_data_string();
  };

  const settingeditbutton = () => {
    if (edittingSelectedValue === 'manual') {
      if (edittingName === '') {
        dialog.message('名前が入力されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (edittingName.length >= 15) {
        dialog.message('15文字以内にしてください', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (!ip_regex(edittingIP)) {
        dialog.message('IPアドレスが正しい形式ではありません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (!subnetmask_regex(edittingSubnetmask)) {
        dialog.message('サブネットマスクが正しい形式ではありません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (!gateway_regex(edittingGateway)) {
        dialog.message('ゲートウェイが正しい形式ではありません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (edittingSSID === '') {
        dialog.message('SSIDが選択されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      setEditIsOpen(false);
      edit_config_data(edittingName, edittingIP, edittingSubnetmask, edittingGateway, edittingSSID);
    }
    if (edittingSelectedValue === 'dhcp') {
      if (edittingName === '') {
        dialog.message('名前が入力されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      if (edittingSSID === '') {
        dialog.message('SSIDが選択されていません', { title: "Local IP Changer GUI", type: "error"});
        return;
      }
      setEditIsOpen(false);
      edit_config_data(edittingName, 'dhcp', '', '', edittingSSID);
    }
  }

  const [selectedValue, setSelectedValue] = useState('dhcp');
  const handleChangeadd = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue((event.target as HTMLInputElement).value);
  };

  const [input_name, setInputName] = React.useState('');
  const handleInputNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const [input_ip, setInputIP] = React.useState('192.168.');
  const handleInputIPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputIP(event.target.value);
  };

  const [input_subnetmask, setInputSubnetmask] = React.useState('255.255.255.0');
  const handleInputSubnetmaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSubnetmask(event.target.value);
  };

  const [input_gateway, setInputGateway] = React.useState('192.168.');
  const handleInputGatewayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputGateway(event.target.value);
  };

  const [edittingSelectedValue, setEdittingSelectedValue] = useState('');
  const handleChangeEdittingSelectValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdittingSelectedValue((event.target as HTMLInputElement).value);
  };

  const [edittingName, setEdittingName] = React.useState('');
  const handleEdittingNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdittingName(event.target.value);
  };
  
  const [edittingIP, setEdittingIP] = React.useState('');
  const handleEdittingIPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdittingIP(event.target.value);
  };
  
  const [edittingSubnetmask, setEdittingSubnetmask] = React.useState('');
  const handleEdittingSubnetmaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdittingSubnetmask(event.target.value);
  };

  const [edittingGateway, setEdittingGateway] = React.useState('');
  const handleEdittingGatewayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdittingGateway(event.target.value);
  };

  const [edittingSSID, setEdittingSSID] = React.useState('');
  const handleEdittingSSIDChange = (event: SelectChangeEvent) => {
    setEdittingSSID(event.target.value as string);
  };
  

  const reset_input_value = () => {
    setSelectedValue('dhcp');
    setInputName('');
    setInputIP('192.168.');
    setInputSubnetmask('255.255.255.0');
    setInputGateway('192.168.');
    setSSID('');
  }

  const reset_editting_value = () => {
    setEdittingSelectedValue('');
    setEdittingName('');
    setEdittingIP('');
    setEdittingSubnetmask('');
    setEdittingGateway('');
    setEdittingSSID('');
  }

  const check_have_data = (name: string): boolean => {
    return configData.some((configName) => configName === name);
  }

  // {configData.map((name) => <DataItem key={name} name={name} />)}

  

  // tauri--------------------------------------------------------
  const [deviceList, setDeviceList] = React.useState<string[]>([]);
  const push_settings_button = () => {
    setSettingIsOpen(true);
    get_device_list().then((deviceList) => {
      setDeviceList(deviceList);
    });
    get_config_device_string();
  }

  const [ssidList, setSSIDList] = React.useState<string[]>([]);
  const push_add_button = () => {
    setIsOpen(true);
    get_ssid().then((ssidList) => {
      setSSIDList(ssidList);
    });
  }

  const push_edit_button = async (name: string) => {
    get_ssid().then((ssidList) => {
      setSSIDList(ssidList);
    });
    setEdittingName(name);
    try {
      const data = await get_config_data_Data(name);
      if (data === null) {
        return console.log("data is null");
      }
      setEdittingSSID(data.ssid);
      if (data.ip === 'dhcp') {
        setEdittingSelectedValue('dhcp');
        setEdittingIP('');
        setEdittingSubnetmask('');
        setEdittingGateway('');
      }
      else {
        setEdittingSelectedValue('manual');
        setEdittingIP(data.ip);
        setEdittingSubnetmask(data.mac);
        setEdittingGateway(data.gateway);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  const wifisettingbutton = (device: string) => {
    setSettingIsOpen(false);
    invoke('t_set_config_device', {device: device});
  };
  
  const get_config_device_string = async () => {
    const deviceName: string = await get_config_device();
    setWifi(deviceName);
  }

  const add_config_data = (name: string, ip: string, subnetmask: string, gateway: string, ssid: string) => {
    invoke('t_add_config_data', {name: name, ip: ip, subnetmask: subnetmask, gateway: gateway, ssid: ssid});
  }

  

  const [configData, setConfigData] = React.useState<string[]>([]);
  const get_config_data_string = async () => {
    const configData: string[] = await get_data_list();
    setConfigData(configData);
  }

  const edit_config_data = (name: string, ip: string, mac: string, gateway: string, ssid: string) => {
    invoke('t_edit_config_data', {name: name, ip: ip, mac: mac, gateway: gateway, ssid: ssid});
    get_config_data_string();
  }
  

  async function nameToOrder(name: string): Promise<number> {
    const configData = await get_config_data(name);
    return configData.order;
  }

  const [sortedConfigData, setSortedConfigData] = useState<string[]>([]);
  
  useEffect(() => {
    const sortConfigData = async () => {
      const orders = await Promise.all(configData.map(name => nameToOrder(name)));
      const sorted = [...configData].sort((a, b) => orders[configData.indexOf(a)] - orders[configData.indexOf(b)]);
      setSortedConfigData(sorted);
    };
    sortConfigData();
  }, [configData]);
  // -------------------------------------------------------------

  document.addEventListener('contextmenu', event => event.preventDefault());
  return (
    <div className="App">
      <div className="Appname">
        <h1>Local IP Changer GUI</h1>
      </div>
      <div className="container">

      {
        sortedConfigData.map((name) => <DataItem key={name} name={name} />)
      }
      
        <div className="settings-container">
          <div className="settingbutton" onClick={push_settings_button}>
            <SettingsIcon id="settingsicon"/>
          </div>
          <div className="addbox" onClick={push_add_button}>
            <AddIcon id="addicon"/>
          </div>
        </div>

        <Modal isOpen={editmodalIsOpen} ariaHideApp={false} className="addmenu" closeTimeoutMS={300} overlayClassName="addmenuoverlay">
          <IconButton aria-label="close" onClick={() => { setEditIsOpen(false); reset_editting_value();}}>
              <CloseIcon className="closeIcon" fontSize="large" />
            </IconButton>
            
            <h2 id="modalh2">設定編集</h2>
            <Box
              component="form"
              className="settings-input-field"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
                '& .MuiInputBase-input': {
                  color: '#FFFFFF',    // 入力文字の色
                },
                '& label': {
                  color: '#d6d6d6', // 通常時のラベル色 
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#CCCCCC', // 通常時のボーダー色
                },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                  borderBottomColor: '#DDDDDD',  // ホバー時のボーダー色
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#CCCCCC',    // 通常時のボーダー色(アウトライン)
                  },
                  '&:hover fieldset': {
                    borderColor: '#DDDDDD',    // ホバー時のボーダー色(アウトライン)
                  },
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#858585",
                  backgroundColor: "#2b2b2b",
                  borderColor: "#858585",
                  '& fieldset': {
                    borderColor: '#CCCCCC',    // 通常時のボーダー色(アウトライン)
                  },
                  '&:hover fieldset': {
                    borderColor: '#DDDDDD',    // ホバー時のボーダー色(アウトライン)
                  },
                },
              }}
              noValidate
              autoComplete="off"
            >
              <FormControl >
                <FormLabel id="demo-row-radio-buttons-group-label">タイプ</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  defaultValue={edittingSelectedValue}
                  onChange={handleChangeEdittingSelectValue}
                  value={edittingSelectedValue}
                >
                  <FormControlLabel value="dhcp" control={<GreenRadio />} label="自動" />
                  <FormControlLabel value="manual" control={<GreenRadio />} label="手動" />
                </RadioGroup>
              </FormControl>
              <TextField 
                className="outlined-basic" 
                label="名前" 
                variant="outlined"
                inputProps={{ maxLength: 15 }}
                value={edittingName}
                onChange={handleEdittingNameChange}
                disabled={true}
              />
              <TextField 
                className="outlined-basic" 
                label="IP" 
                variant="outlined" 
                value={edittingIP}
                onChange={handleEdittingIPChange}
                disabled={edittingSelectedValue === 'dhcp'}
                />
              <TextField 
                className="outlined-basic" 
                label="サブネットマスク" 
                variant="outlined"
                value={edittingSubnetmask}
                onChange={handleEdittingSubnetmaskChange}
                disabled={edittingSelectedValue === 'dhcp'}
              />
              <TextField 
                className="outlined-basic" 
                label="ゲートウェイ"
                variant="outlined" 
                value={edittingGateway}
                onChange={handleEdittingGatewayChange}
                disabled={edittingSelectedValue === 'dhcp'}
              />
              <div className="ssidbox">
                <Box sx={{ minWidth: 120 }}>
                  <FormControl fullWidth>
                    <InputLabel id="ssidlabel">SSID</InputLabel>
                    <Select
                      MenuProps={{
                        sx: {
                          "&& .Mui-selected": {
                            backgroundColor: "#83aaff"
                          }
                        }
                      }}
                      labelId="ssidlabel"
                      id="ssidselect"
                      value={edittingSSID}
                      label="ssid"
                      onChange={handleEdittingSSIDChange}
                    >
                      {ssidList.map((ssid) => (
                        <MenuItem value={ssid}>{ssid}</MenuItem>
                      ))}
                      <MenuItem value={edittingSSID}>{edittingSSID}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </div>
            </Box>
            <div className="addmenubutton" onClick={settingeditbutton}>
              適用
            </div>
        </Modal>

        <Modal isOpen={settingmodalIsOpen} ariaHideApp={false} className="settingmenu" closeTimeoutMS={300} overlayClassName="settingmenuoverlay">
          <IconButton aria-label="close" onClick={() => { setSettingIsOpen(false);}}>
            <CloseIcon className="closeIcon" fontSize="large" />
          </IconButton>
          <h2 id="modalh2">環境設定</h2>
          <div className="wifidevice">
          </div>
          <div className="select">
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="wifilabel">WiFiデバイス</InputLabel>
                <Select
                  MenuProps={{
                    sx: {
                      "&& .Mui-selected": {
                        backgroundColor: "#83aaff"
                      }
                    }
                  }}
                  labelId="wifilabel"
                  id="wifiselect"
                  value={wifi}
                  label="wifiselect"
                  onChange={handleChange2}
                >
                  {deviceList.map((device) => (
                    <MenuItem value={device}>{device}</MenuItem>
                    
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className="wifidevicebutton" onClick={() => wifisettingbutton(wifi)}>
            完了
          </div>
        </Modal>

        <Modal isOpen={modalIsOpen} ariaHideApp={false} className="addmenu" closeTimeoutMS={300} overlayClassName="addmenuoverlay">
          <IconButton aria-label="close" onClick={() => { setIsOpen(false); reset_input_value()}}>
            <CloseIcon className="closeIcon" fontSize="large" />
          </IconButton>
          
          <h2 id="modalh2">設定追加</h2>
          <Box
            component="form"
            className="settings-input-field"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
              '& .MuiInputBase-input': {
                color: '#FFFFFF',    // 入力文字の色
              },
              '& label': {
                color: '#d6d6d6', // 通常時のラベル色 
              },
              '& .MuiInput-underline:before': {
                borderBottomColor: '#CCCCCC', // 通常時のボーダー色
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottomColor: '#DDDDDD',  // ホバー時のボーダー色
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#CCCCCC',    // 通常時のボーダー色(アウトライン)
                },
                '&:hover fieldset': {
                  borderColor: '#DDDDDD',    // ホバー時のボーダー色(アウトライン)
                },
              },
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#858585",
                backgroundColor: "#2b2b2b",
                borderColor: "#858585",
                '& fieldset': {
                  borderColor: '#CCCCCC',    // 通常時のボーダー色(アウトライン)
                },
                '&:hover fieldset': {
                  borderColor: '#DDDDDD',    // ホバー時のボーダー色(アウトライン)
                },
              },
            }}
            noValidate
            autoComplete="off"
          >
            <FormControl >
              <FormLabel id="demo-row-radio-buttons-group-label">タイプ</FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                defaultValue="dhcp"
                onChange={handleChangeadd}
              >
                <FormControlLabel value="dhcp" control={<GreenRadio />} label="自動" />
                <FormControlLabel value="manual" control={<GreenRadio />} label="手動" />
              </RadioGroup>
            </FormControl>
            <TextField 
              className="outlined-basic" 
              label="名前" 
              variant="outlined"
              inputProps={{ maxLength: 15 }}
              value={input_name}
              onChange={handleInputNameChange}
              defaultValue="" 
            />
            <TextField 
              className="outlined-basic" 
              label="IP" 
              variant="outlined" 
              value={input_ip}
              onChange={handleInputIPChange}
              disabled={selectedValue === 'dhcp'} 
            />
            <TextField 
              className="outlined-basic" 
              label="サブネットマスク" 
              variant="outlined"
              value={input_subnetmask}
              onChange={handleInputSubnetmaskChange}
              disabled={selectedValue === 'dhcp'}
            />
            <TextField 
              className="outlined-basic" 
              label="ゲートウェイ"
              variant="outlined" 
              value={input_gateway}
              onChange={handleInputGatewayChange}
              disabled={selectedValue === 'dhcp'}
            />
            <div className="ssidbox">
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <InputLabel id="ssidlabel">SSID</InputLabel>
                  <Select
                    MenuProps={{
                      sx: {
                        "&& .Mui-selected": {
                          backgroundColor: "#83aaff"
                        }
                      }
                    }}
                    labelId="ssidlabel"
                    id="ssidselect"
                    value={ssid}
                    label="ssid"
                    onChange={handleChange}
                  >
                    {ssidList.map((ssid) => (
                      <MenuItem value={ssid}>{ssid}</MenuItem>
                    ))}
                    
                  </Select>
                </FormControl>
              </Box>
            </div>
          </Box>
          <div className="addmenubutton" onClick={settingaddbutton}>
            追加
          </div>
        </Modal>
      </div>
      </div>
  );
}

export default App;