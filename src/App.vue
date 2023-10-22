<script setup>
import { ref } from 'vue';
import { useAVLine } from 'vue-audio-visual';

const player = ref(null);
const canvas = ref(null);
let mySource = ref(null);
let action = ref('');
let output = ref('');

useAVLine(player, canvas, { src: mySource, canvHeight: 300, canvWidth: 1000, lineColor: 'orange' });

const runSpeechRecognition = () => {
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();

  recognition.onstart = () => {
    action.value = "I'm Listening";
  };

  recognition.onspeechend = () => {
    action.value = 'Done';
    recognition.stop();
  };

  recognition.onresult = async (event) => {
    var transcript = event.results[0][0].transcript;
    output.value = transcript;

    try {
      const baseURL = import.meta.env.VITE_BASE_SERVER_URL || 'http://localhost:3001'
      const response = await fetch(`${baseURL}/api/TTS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: event.results[0][0].transcript,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data) {
            mySource.value = `${import.meta.env.VITE_BASE_URL}/audio/${data}.mp3`;
            player.value.oncanplaythrough = () => {
                player.value.play();
            };
        }
        } else {
        console.log('Request failed with status:', response.status);
      }
    } catch (err) {
      console.log(err);
    }
  };
  recognition.start();
};
</script>

<template>
  <div class="show">
    <div class="action" v-if="action">{{ action }}</div>
    <div class="synthesizedSpeech" v-if="output"><b>Question</b>: {{ output }}</div>
  </div>

  <div class="audio-wrapper">
    <audio id="player" ref="player" :src="mySource" type="audio/mp3" controls hidden >
        <source :src="mySource" type="audio/mp3" />
        <source :src="mySource" type="audio/mpeg">
        This audio is not supported in your browser
    </audio>
    <canvas ref="canvas" />
    <div class="button-section">
    <button type="button" @click="runSpeechRecognition()">Ask Me Anything</button>
  </div>
  </div>
</template>

<style>
body {
  background-color: rgb(23, 23, 23);
}

.audio-wrapper{
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

canvas {
  display: block;
  width: 800px;
}

.button-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

button {
  padding: 8px 13px;
  border-radius: 5px;
  background-color: orange;
  color: white;
  font-weight: 700;
  font-size: 18px;
  border: none;
  cursor: pointer;
}

.show {
  width: 100%;
  text-align: center;
  color: white;
}

.action {
  margin-top: 10px;
  margin-bottom: 10px;
}

.synthesizedSpeech {
  max-width: 500px;
  padding: 20px;
  border-radius: 10px;
  display: inline-block;
  background: #313131;
  font-weight: bold;
}
</style>
