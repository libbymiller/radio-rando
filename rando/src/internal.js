const appName = window.location.pathname.replace(/\//g, '');
const websocket = createWebsocket();

let storedVolume = null;
let lastEncoderVolume = null;
let currentSongId = null;

function stopStream(){
    console.log("stopping stream");
    let a = document.querySelector('#audio');
    a.pause();
    a.removeAttribute('src')
}

function randomStream(){
    console.log("starting stream",Math.floor(Math.random() * filenames.length));
    let randint = Math.floor(Math.random() * filenames.length);
    currentSongId = randint;
    const randomAudioFile = filenames[randint];
    const randomAudioFileLength = filelengths[randint];
    console.log("stream name is ",randomAudioFile,"length is ",randomAudioFileLength);
    if(randomAudioFileLength && randomAudioFileLength > 5){
       const randTimeToJumpTo = Math.floor(Math.random() * randomAudioFileLength);
       console.log("jumping to point",randTimeToJumpTo);
       playSomething("assets/audio/"+randomAudioFile, randTimeToJumpTo);
    }else{
       playSomething("assets/audio/"+randomAudioFile);
    }
}

function playSomething(filepath, jump_to){
    stopStream();
    console.log("%%%playing something",filepath,"jump to",jump_to);
    var a = document.querySelector("#audio");
    a.setAttribute("src", filepath);
    a.volume = parseInt(storedVolume)*0.1;
    a.setAttribute("autoplay", "autoplay");

    if(jump_to){
       console.log("setting jump_to",jump_to*60);
       a.currentTime = jump_to*60;
    }else{
       console.log("setting jump_to 0");
       a.currentTime = 0;
    }
}


function playHello(){
    playSomething("assets/reserved/hello.ogg");
}

function setVolume(volume){
    console.log("setting volume",parseInt(volume));
    let a = document.querySelector("#audio");
    a.volume = parseInt(volume)*0.1;
    storedVolume = volume;
    localStorage.setItem("storedVolume", storedVolume);
}


// runs as soon as js is available
const main = async () => {
  websocket.ready.then(() => {
    console.log('Websocket connected');

    websocket.publish({
      topic: `${appName}/event/ready`,
      payload: { msg: 'Internal app ready!' }
    });
  });

  websocket.subscribe(new RegExp(`${appName}/.*`), ({ topic, payload }) => {
      console.log('Recieved message', topic, payload);
      if (topic.includes("toggle")) {
        toggleStream();
      }
      if (topic.includes("start")) {
        randomStream();
      }
      if (topic.includes("stop")) {
        stopStream();
      }
      if (topic.includes("ready")) {
        playHello();
      }
      if (topic.includes("volume")) {
        setVolume(payload.volume);
      }
  });

  websocket.subscribe('physical/event/button-start-press', ({ topic, payload }) => {
      console.log('Recieved button start message', topic, payload);
      randomStream();
  });

  websocket.subscribe('physical/event/button-stop-press', ({ topic, payload }) => {
      console.log('Recieved button stop message', topic, payload);
      stopStream();
  });

  websocket.subscribe('physical/event/encoder-volume-turn', ({ topic, payload }) => {
      console.log('Recieved encoder message', topic, payload);
      let enc_vol = parseInt(payload.value);
      console.log("enc_vol",enc_vol);
      if(lastEncoderVolume == null){
        lastEncoderVolume = enc_vol;
      }else{
        if(enc_vol > lastEncoderVolume){
           console.log("vol going up!");
           if(storedVolume == null){
             storedVolume = 1;
           }
           if(storedVolume < 9){
             setVolume(storedVolume+1);
           }
        }else{
           if(storedVolume == null){
             storedVolume = 3;
           }
           console.log("vol going down!");
           if(storedVolume > 1){
             setVolume(storedVolume-1);
           }
        }
        lastEncoderVolume = enc_vol;
      }
  });

  console.log('Internal app loaded');
};

// runs when html document is finished loading
function onDocumentReady(){

    // check for stored volume and set it low if there isn't any
    storedVolume = localStorage.storedVolume;

    if(storedVolume==null || storedVolume==""){
        storedVolume = 2;
        localStorage.setItem("storedVolume", storedVolume);
    }

    console.log("storedVolume[1]",storedVolume);

    //filenames and filelengths are loaded from a js file via internal.html

    console.log("filenames",filenames);
    console.log("filelengths",filelengths);

}

// plain js version of document.onload */
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout( onDocumentReady, 1);
} else {
  document.addEventListener("DOMContentLoaded", onDocumentReady);
}

// go go go!
main();
