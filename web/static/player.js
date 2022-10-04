document.addEventListener("DOMContentLoaded", async function(event) {
  window.sounds = {};
  window.plots = {allowed:[],blocked:[],prompted:[]};
    await connectToSocket();
    await initSocket();
    //await doVisuals();
});

async function connectToSocket() {
  window.socket = await io('', {
    query: {
        source: "web-official-1.0.0"
    }
});
}

async function doVisuals() {
  Howler.mute(false);
  let wave = new Wave();
let dest = Howler.ctx.createMediaStreamDestination();

Howler.masterGain.disconnect();
Howler.masterGain.connect(dest);

    wave.fromStream(
        dest.stream,
        "visual",
        {
            type: "bars",
            /*
            let typeMap = {
            "bars": drawBars,
            "bars blocks": drawBarsBlocks,
            "big bars": drawBigBars,
            "cubes": drawCubes,
            "dualbars": drawDualbars,
            "dualbars blocks": drawDualbarsBlocks,
            "fireworks": drawFireworks,
            "flower": drawFlower,
            "flower blocks": drawFlowerBlocks,
            "orbs": drawOrbs,
            "ring": drawRing,
            "rings": drawRings,
            "round layers": drawRoundLayers,
            "round wave": drawRoundWave,
            "shine": drawShine,
            "shine rings": drawShineRings,
            "shockwave": drawShockwave,
            "star": drawStar,
            "static": drawStatic,
            "stitches": drawStitches,
            "wave": drawWave,
            "web": drawWeb
        };
        */
            connectDestination: false
        }
        );
    setInterval(()=>{
        //document.body.style.backgroundSize = "contain";
        document.body.style.background = 'url(' + document.getElementById("visual").toDataURL() + ')';
        document.getElementById("visual").height = window.innerHeight;
        document.getElementById("visual").width = window.innerWidth;
    },25);
};

async function initSocket() {
  window.socket.on("keepalive", (data) => {
  window.socket.emit("keepalive", data);
});

window.socket.on("linked", (username) => {
  setStatus(`Linked`);
  document.getElementById("in-game-name").innerHTML = username;
});

window.socket.on("unlinked", (username) => {
  setStatus(`Unlinked`);
  document.getElementById("in-game-name").innerHTML = "there";
});

window.socket.on("play", async (data) => {
  if(!await plotCanPlayAudio(data.plot)) return;
  playAudio(data);
});
window.socket.on("load", async (data) => {
  if(!await plotCanPlayAudio(data.plot)) return;
  loadAudio(data);
});
window.socket.on("simpleplay", async (data) => {
  if(!await plotCanPlayAudio(data.plot)) return;
  playAudioSimple(data);
});
window.socket.on("stop", async (data) => {
  if(!await plotCanPlayAudio(data.plot)) return;
    if(typeof data.track !== "undefined") {
  if(data.track.includes("all")) {
       Object.entries(window.sounds).filter(x => x[0].includes(data.plot.identifier)).forEach(x => stopAudio({id:x[0]}));
  }
  if(data.track.includes("music")) {
   Object.entries(window.sounds).filter(x => x[1].track === "music").filter(x => x[0].includes(data.plot.identifier)).forEach(x => stopAudio({id:x[0]}));
  }
        if(data.track.includes("sfx")) {
    Object.entries(window.sounds).filter(x => x[1].track === "sfx").filter(x => x[0].includes(data.plot.identifier)).forEach(x => stopAudio({id:x[0]}));
  }
    } else {
  stopAudio(data);
    }
});
};

function playAudio(data) {
  console.log(data);
  if(typeof data.time !== "undefined") {
  const time = new Date().getTime();
  const packetTime = new Date(data.time).getTime();
  if(packetTime > time) {
    setTimeout(()=>{playAudio(data)}, packetTime - time);
    return;
  }
  }
    if(typeof window.sounds[data.id] !== "undefined") {
        window.sounds[data.id].play();
    } else {
        console.log("sound doesnt exist???");
    }
};

function stopAudio(data) {
    if(!Object.keys(window.sounds).includes(data.id)) return;
    window.sounds[data.id].stop();
    delete window.sounds[data.id];
};

function loadAudio(data) {
  console.log(data);
  if(typeof window.sounds[data.id] !== "undefined") delete window.sounds[data.id];
    var soundHowl = new Howl({
        src: [data.url],
        autoplay: false,
        loop: data.looping,
        html5: data.track !== "music",
        volume: 0
    });
    soundHowl.track = data.track;
    window.sounds[data.id] = soundHowl;
};

function playAudioSimple(data) {
  console.log("simple play");
  loadAudio(data);
  playAudio(data);
};

function setVolume(track,volume) {
  switch(track) {
    case "sfx":
      document.getElementById("sfx-volume-disp").innerHTML = "Sound Effects - " + volume + "%";
      Object.values(window.sounds).filter(x => x.track === "sfx").forEach(x => x.volume(volume/100));
      break;
    case "music":
      document.getElementById("music-volume-disp").innerHTML = "Music - " + volume + "%";
      Object.values(window.sounds).filter(x => x.track === "music").forEach(x => x.volume(volume/100));
      break;
  }
}

function setStatus(status) {
  document.getElementById("status").innerHTML = status;
}

function doLink() {
  const code = document.getElementById("linking").value;
  setStatus("Attempting to link");
  window.socket.emit("link",code);
}

async function promptAuth(plot) {
  return new Promise((resolve, reject) => {
      if(plot.trusted) {
          GrowlNotification.notify({
            description: `${plot.id} by ${plot.author} was allowed to play audio`,
            position: "bottom-right",
            closeWith: [],
            closeTimeout: 3000,
              type: "info",
            animation: "slide",
          });
          window.plots.allowed.push(plot.identifier);
          resolve(true);
          return;
      }
  GrowlNotification.notify({
            description: `${plot.id} by ${plot.author} wants to play audio`,
            position: "bottom-right",
            closeWith: [],
            closeTimeout: false,
            animation: "slide",
            showButtons: true,
            buttons: {
                action: {
                  text: "Allow",
                    callback: function (notification) {
                        window.plots.allowed.push(plot.identifier);
                        resolve(true);
                    }
                },
                cancel: {
                  text: "Block future requests",
                    callback: function (notification) {
                        window.plots.blocked.push(plot.identifier);
                        resolve(false);
                    }
                }
            },
        });
  });
}

async function plotCanPlayAudio(plot) {
  if(window.plots.allowed.includes(plot.identifier)) return true;
  if(window.plots.blocked.includes(plot.identifier)) return false;
  if(Object.keys(window.plots.prompted).includes(plot.identifier)) return window.plots.prompted[plot.identifier];
  const authPrompt = promptAuth(plot);
  window.plots.prompted[plot.identifier] = authPrompt;
  const result = await authPrompt;
  delete window.plots.prompted[plot.identifier];
  return result;
}

document.addEventListener('DOMContentLoaded', () => {
        (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
          const $notification = $delete.parentNode;

          $delete.addEventListener('click', () => {
            $notification.parentNode.removeChild($notification);
          });
        });
      });
      setInterval(() => {
        setVolume("sfx",document.getElementById("sfx-volume-slider").value);
        setVolume("music",document.getElementById("music-volume-slider").value);
      },100);

function onKonamiCode(cb) {
  var input = '';
  var key = '38384040373937396665';
  document.addEventListener('keydown', function (e) {
    input += ("" + e.keyCode);
    if (input === key) {
      return cb();
    }
    if (!key.indexOf(input)) return;
    input = ("" + e.keyCode);
  });
}

onKonamiCode(doVisuals);