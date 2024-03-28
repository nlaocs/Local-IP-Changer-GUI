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


function clickDisplayAlert() {
  console.log("ボタンがクリックされました！");
}

async function get_device_list(): Promise<number[]> {
  const getDeviceList: string = await invoke("t_get_device_list");
  const deviceList: number[] = JSON.parse(getDeviceList);
  console.log(deviceList);
  return deviceList;
}

async function get_ssid(): Promise<number[]> {
  const getSSID: string = await invoke("t_get_ssid");
  const ssid: number[] = JSON.parse(getSSID);
  console.log(ssid);
  return ssid;
}

async function get_config_device(): Promise<string> {
  const getConfigDevice: string = await invoke("t_get_config_device");
  console.log(getConfigDevice);
  return getConfigDevice;
}

const GreenRadio = styled(Radio)({
  color: '#cccccc',
  '&.Mui-checked': {
    color: '#9ec3ff',
  },
});

function App() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [settingmodalIsOpen, setSettingIsOpen] = useState(false);
  const [ssid, setSSID] = React.useState('');
  const handleChange = (event: SelectChangeEvent) => {
    setSSID(event.target.value as string);
  };
  const [wifi, setWifi] = React.useState('');
  const handleChange2 = (event: SelectChangeEvent) => {
    setWifi(event.target.value as string);
  };
  const settingaddbutton = () => {
    setIsOpen(false);
  };

  const [selectedValue, setSelectedValue] = useState('dhcp');
  const handleChangeadd = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue((event.target as HTMLInputElement).value);
  };

  const [input_name, setInputName] = React.useState('');
  const handleInputNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const [input_ip, setInputIP] = React.useState('');
  const handleInputIPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputIP(event.target.value);
  };

  const [input_subnetmask, setInputSubnetmask] = React.useState('');
  const handleInputSubnetmaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSubnetmask(event.target.value);
  };

  const [input_gateway, setInputGateway] = React.useState('');
  const handleInputGatewayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputGateway(event.target.value);
  };

  // tauri--------------------------------------------------------
  const [deviceList, setDeviceList] = React.useState<number[]>([]);
  const push_settings_button = () => {
    setSettingIsOpen(true);
    get_device_list().then((deviceList) => {
      setDeviceList(deviceList);
      get_config_device_string();
    });
  }

  const [ssidList, setSSIDList] = React.useState<number[]>([]);
  const push_add_button = () => {
    setIsOpen(true);
    get_ssid().then((ssidList) => {
      setSSIDList(ssidList);
    });
  }

  const wifisettingbutton = (device: string) => {
    setSettingIsOpen(false);
    console.log(device);
    invoke('t_set_config_device', {device: device});
  };
  
  const get_config_device_string = async () => {
    const deviceName: string = await get_config_device();
    setWifi(deviceName);
  }


  // -------------------------------------------------------------

  document.addEventListener('contextmenu', event => event.preventDefault());
  useEffect(() => {
    
  }, []);
  return (
    <div className="App">
      <div className="Appname">
        <h1>Local IP Changer GUI</h1>
      </div>
      <div className="container">
        {Array(10).fill(0).map((_, index) => (
          <div key={index} className="box">
            ここにブロック状の設定が来る予定<hr />
            <div>自動設定</div><div className="wifiname">(wifi-test{index})</div>
            <div className="icon">
              <IconButton aria-label="delete" onClick={clickDisplayAlert}>
                <DeleteIcon className="deleteIcon" fontSize="large" />
              </IconButton>
              <IconButton aria-label="edit" onClick={clickDisplayAlert}>
                <EditIcon className="editIcon" fontSize="large" />
              </IconButton>
              <IconButton aria-label="play" onClick={clickDisplayAlert}>
                <PlayArrowIcon className="playIcon" fontSize="large" />
              </IconButton>
            </div>
          </div>
        ))}
        <div className="settings-container">
          <div className="settingbutton" onClick={push_settings_button}>
              <SettingsIcon id="settingsicon"/>
          </div>
          <div className="addbox" onClick={push_add_button}>
              <AddIcon id="addicon"/>
          </div>
        </div>
        <Modal isOpen={settingmodalIsOpen} ariaHideApp={false} className="settingmenu" closeTimeoutMS={300} overlayClassName="settingmenuoverlay">
          <IconButton aria-label="close" onClick={() => { setSettingIsOpen(false); console.log("aaa"); }}>
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
          <IconButton aria-label="close" onClick={() => { setIsOpen(false); console.log("aaa"); }}>
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
              defaultValue="192.168." 
              disabled={selectedValue === 'dhcp'} 
            />
            <TextField 
              className="outlined-basic" 
              label="サブネットマスク" 
              variant="outlined"
              value={input_subnetmask}
              onChange={handleInputSubnetmaskChange}
              defaultValue="255.255.255.0"
              disabled={selectedValue === 'dhcp'}
            />
            <TextField 
              className="outlined-basic" 
              label="ゲートウェイ"
              variant="outlined" 
              value={input_gateway}
              onChange={handleInputGatewayChange}
              defaultValue="192.168." 
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