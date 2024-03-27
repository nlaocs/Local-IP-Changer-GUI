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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';


function clickDisplayAlert() {
  console.log("ボタンがクリックされました！");
}

async function get_device_list(): Promise<number[]> {
  const getDeviceList: string = await invoke("t_get_device_list");
  const deviceList: number[] = JSON.parse(getDeviceList);
  console.log(deviceList);
  return deviceList;
}


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
  const wifisettingbutton = (device: string) => {
    setSettingIsOpen(false);
    console.log(device);
    invoke('testfn2', { test: device });
  };
  const settingaddbutton = () => {
    setIsOpen(false);
  };
  

  // からのdevicelistを作ってpush_settings_buttonの中で定義したい
  const [deviceList, setDeviceList] = React.useState<number[]>([]);
  const push_settings_button = () => {
    setSettingIsOpen(true);
    get_device_list().then((deviceList) => {
      setDeviceList(deviceList);
    });
  }

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
          <div className="addbox" onClick={() => setIsOpen(true)}>
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
                color: '#AAAAAA', // 通常時のラベル色 
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
                sx={{
                  color: '#FF0000',
                }}
              >
                <FormControlLabel value="dhcp" control={<Radio />} label="自動" className="wifitypeselect" />
                <FormControlLabel value="manual" control={<Radio />} label="手動" className="wifitypeselect" />
              </RadioGroup>
            </FormControl>
            <TextField className="outlined-basic" label="名前" variant="outlined" defaultValue="" />
            <TextField className="outlined-basic" label="IP" variant="outlined" defaultValue="192.168." />
            <TextField className="outlined-basic" label="サブネットマスク" variant="outlined" defaultValue="255.255.255.0" />
            <TextField className="outlined-basic" label="ゲートウェイ" variant="outlined" defaultValue="192.168."/>
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
                    <MenuItem value={10}>test1</MenuItem>
                    <MenuItem value={20}>test2</MenuItem>
                    <MenuItem value={30}>test3</MenuItem>
                    <MenuItem value={40}>test4</MenuItem>
                    <MenuItem value={50}>test5</MenuItem>
                    
                  </Select>
                </FormControl>
              </Box>
            </div>
          </Box>
          {/*<p className="addmenuclosebutton">
            <ReactiveButton
              className="settingmenuaddbutton"
              size="large"
              buttonState={state}
              idleText={
                <span>
                  追加
                </span>
              }
              loadingText={
                <span>
                  追加中...
                </span>
              }
              color="blue"
              successText={
                <span>
                  追加完了 <CheckIcon sx={{ fontSize: 15}} id="checkicon"/>
                </span>
              }
              onClick={() => {
                setState('loading');
                setTimeout(() => {
                  setState('success');
                }, 2000);
              }}
            />
          </p>*/}
          <div className="addmenubutton" onClick={settingaddbutton}>
            追加
          </div>
        </Modal>
      </div>
      </div>
  );
}

export default App;

//追加ボタンをデカくする