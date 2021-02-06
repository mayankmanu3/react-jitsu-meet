import './App.css';
import React, { useState } from 'react';
import { Jutsu } from 'react-jutsu';

var recorder, stream, soundRecorder, soundStream;

function App() {
  const [srcVideo, setSrcVideo] = useState('');
  const [srcAudio, setSrcAudio] = useState('');
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
    soundStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    soundRecorder = new MediaRecorder(soundStream);
    const audioChunks = [];
    soundRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    soundRecorder.onstop = async (e) => {
      const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type });
      await setSrcAudio(URL.createObjectURL(audioBlob));
    };

    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
      audio: true,
    });
    recorder = new MediaRecorder(stream);

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async (e) => {
      const completeBlob = new Blob(chunks, { type: chunks[0].type });
      await setSrcVideo(URL.createObjectURL(completeBlob));
    };
    recorder.start();
    soundRecorder.start();
  };
  const stopRec = () => {
    soundRecorder.stop();
    recorder.stop();
    stream.getVideoTracks()[0].stop();
  };
  return srcVideo !== '' && srcAudio !== '' ? (
    <center>
      <video
        onSeeking={(e) => console.log(e)}
        src={srcVideo}
        width={720}
        autoPlay
        controls
      />
      <br />
      <audio src={srcAudio} autoPlay controls />
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
