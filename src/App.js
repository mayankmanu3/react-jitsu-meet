import './App.css';
import React, { useState } from 'react';
import { Jutsu } from 'react-jutsu';
import Timer from 'react-compound-timer';
import moment from 'moment';

var recorder, stream, soundRecorder, soundStream;

function App() {
  const [srcVideo, setSrcVideo] = useState('');
  const [srcAudio, setSrcAudio] = useState('');
  const [seek, setSeek] = useState(0);
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [call, setCall] = useState(false);
  const [password, setPassword] = useState('');
  const [currently, setCurrently] = useState('rec');
  const [initTime, setInitTime] = useState(null);
  const [markers, setMarkers] = useState([]);

  const handleClick = async (event) => {
    event.preventDefault();
    if (room && name) {
      setCall(true);
      startRec();
      setInitTime(moment(new Date()));
      setCurrently('rec');
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
    setCurrently('play');
  };
  return srcVideo !== '' && srcAudio !== '' ? (
    <center>
      <video
        id="vid"
        src={srcVideo}
        currentTime={seek}
        onSeeking={(e) => setSeek(e.target.currentTime)}
        width={720}
        controls
      />
      <br />
      <audio
        id="aud"
        onSeeking={(e) => setSeek(e.target.currentTime)}
        currentTime={seek}
        src={srcAudio}
        controls
      />
      <div style={{ marginTop: 50 }}>
        {currently === 'play'
          ? markers.map((mark, i) => {
              return (
                <button
                  key={i}
                  onClick={() => {
                    var video = document.getElementById('vid');
                    var audio = document.getElementById('aud');
                    video.currentTime = mark.time;
                    audio.currentTime = mark.time;
                    video.play();
                    audio.play();
                  }}
                >
                  {mark.name} : {(mark.time / 60).toFixed(2)}
                </button>
              );
            })
          : null}
      </div>
    </center>
  ) : call ? (
    <Timer
      onPause={() =>
        setMarkers(
          markers.concat([
            {
              name: 'abcd',
              time: moment(new Date()).diff(initTime, 'millisecond') / 1000,
            },
          ])
        )
      }
    >
      {({ pause, resume }) => {
        return (
          <center>
            <Jutsu
              roomName={room}
              displayName={name}
              password={password}
              onMeetingEnd={() => stopRec()}
              loadingComponent={<p>loading ...</p>}
              errorComponent={<p>Oops, something went wrong</p>}
            />
            <Timer.Hours /> <Timer.Minutes /> <Timer.Seconds />
            <br />
            {currently === 'rec' ? (
              <button
                onClick={() => {
                  pause();
                  resume();
                }}
              >
                Mark
              </button>
            ) : null}
          </center>
        );
      }}
    </Timer>
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
