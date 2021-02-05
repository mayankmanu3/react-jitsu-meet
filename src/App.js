import './App.css';
import React, { useState } from 'react';
import { Jutsu } from 'react-jutsu';

var recorder, stream;

function App() {
  const [src, setSrc] = useState({
    audio: null,
    video: null,
  });
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [call, setCall] = useState(false);
  const [password, setPassword] = useState('');

  const handleClick = async (event) => {
    event.preventDefault();
    if (room && name) {
      setCall(true);
      startRec();
    }
  };
  const startRec = async () => {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
      audio: true,
    });
    recorder = new MediaRecorder(stream);

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = (e) => {
      const completeBlob = new Blob(chunks, { type: chunks[0].type });
      setSrc({
        ...src,
        video: URL.createObjectURL(completeBlob),
      });
    };
    recorder.start();
  };
  const stopRec = () => {
    recorder.stop();
    stream.getVideoTracks()[0].stop();
  };
  return src.video !== null ? (
    <center>
      <video src={src.video} width={720} autoPlay controls />
      {/* <audio src={src.audio} autoPlay controls /> */}
    </center>
  ) : call ? (
    <center>
      <Jutsu
        roomName={room}
        displayName={name}
        password={password}
        onMeetingEnd={() => stopRec()}
        loadingComponent={<p>loading ...</p>}
        errorComponent={<p>Oops, something went wrong</p>}
      />
    </center>
  ) : (
    <center>
      <form>
        <input
          id="room"
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <input
          id="name"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <input
          id="password"
          type="text"
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={handleClick} type="submit">
          Start / Join
        </button>
      </form>
    </center>
  );
}

export default App;
