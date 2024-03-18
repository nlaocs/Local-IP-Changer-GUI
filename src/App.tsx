import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window';
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Stack from '@mui/material/Stack';
import ReactiveButton from 'reactive-button';
import IconButton from '@mui/material/IconButton';
import Modal from "react-modal";
import { DoneOutlinedIcon } from "@xpadev-net/material-icons";
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.85)"
  },
  content: {
    position: "absolute",
    top: "5rem",
    left: "5rem",
    right: "5rem",
    bottom: "5rem",
    backgroundColor: "paleturquoise",
    borderRadius: "1rem",
    padding: "1.5rem"
  }
};

function clickDisplayAlert() {
  console.log("ボタンがクリックされました！");
}

function open_addmenu() {
  console.log("ボタンがクリックされました！");
}


function App() {
  const [state, setState] = useState('idle');
  const [modalIsOpen, setIsOpen] = useState(false);

  const onClickHandler = () => {
    setState('loading');

    // send an HTTP request
    setTimeout(() => {
      setState('success');
      //setIsOpen(false); console.log("aaa");
    }, 2000);
  };



  document.addEventListener('contextmenu', event => event.preventDefault());
  return (
    <div className="App">
      <div className="Appname">
        <h1>Local IP Changer GUI</h1>
      </div>
      <div className="container">
        {Array(10).fill(0).map((_, index) => (
          <div key={index} className="box">
            ここにブロック状の設定が来る予定<hr />
            <div>自動設定</div><div className="wifiname">(wifi-test1)</div>
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
        <div className="addbox" onClick={() => setIsOpen(true)}>
          <AddCircleOutlineIcon id="addicon"/>
        </div>
        <Modal isOpen={modalIsOpen} ariaHideApp={false} className="addmenu" overlayClassName="addmenuoverlay">
          <h2 id="modalh2">Modal Content</h2>
          <button onClick={() => { setIsOpen(false); console.log("aaa"); }}>close</button>
          <Box
            component="form"
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
            <TextField className="outlined-basic" label="IP" variant="outlined" />
            <TextField className="outlined-basic" label="サブネットマスク" variant="outlined" />
            <TextField className="outlined-basic" label="ゲートウェイ" variant="outlined" />
          </Box>
          <p className="addmenuclosebutton">
            <ReactiveButton
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
                  追加完了 <CheckIcon sx={{ fontSize: 15}}/>
                </span>
              }
          

              onClick={onClickHandler}
            />
          </p>
          <IconButton aria-label="close" onClick={() => { setIsOpen(false); console.log("aaa"); }}>
            <CloseIcon className="closeIcon" fontSize="large" />
          </IconButton>
        </Modal>
      </div>
      </div>
  );
}

export default App;

//追加ボタンをデカくする