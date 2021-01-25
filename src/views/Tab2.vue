<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-fab vertical="top" horizontal="start" slot="fixed">
        <ion-fab-button color="light" @click="saveToFavorites">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-fab vertical="top" horizontal="end" slot="fixed">
        <ion-fab-button color="light" @click="speakHello">
          <ion-icon :icon="play"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-grid>
        <ion-row style="height: 100%" class="ion-align-items-center">
          <ion-col size="12" class="ion-align-self-center">
            <h1 class="ion-text-center">{{artist}}</h1>
            <ion-text color="medium" class="ion-text-center">
              <h4>{{title}}</h4>
            </ion-text>
          </ion-col>
          <ion-col size="12" class="ion-align-self-center" v-if="lyrics.length">
            <ion-text class="ion-text-center">
              <p v-for="chunk in lyrics" :key="chunk">
                {{ chunk }}
              </p>
            </ion-text>
            <br /><br />
          </ion-col>
          <ion-col size="12" class="ion-align-self-center">
            <br />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonFab,
         IonFabButton, IonText, alertController }
from '@ionic/vue';

import { add, play } from 'ionicons/icons';
import { defineComponent } from 'vue';

// import Storage from '../services/storage';
import { storage as strg }  from './Tab1';
const storage = strg;

import { Plugins } from "@capacitor/core";
const { Accessibility } = Plugins;

let audioChunks = [];

export default defineComponent({
  name: 'Tab2',

  ionViewWillEnter() {
    console.log("event on lyrics tab");
    this.loadLyrics();
  },
  components: { IonContent, IonPage, IonGrid, IonRow, IonCol,
                IonFab, IonFabButton, IonText },
  setup() {
    return {
      add,
      play
    }
  },
  data() {
    return {
      artist: '',
      title: '',
      lyrics: []
    }
  },
  methods: {
    saveToFavorites() {
      console.log("saved to favorites");

      var song = {
        artist: this.$data.artist,
        title: this.$data.title,
        lyrics: this.$data.lyrics
      };

      let enableFavorites = true;
      // get favorites
      storage.get("favorites").then((value) => {
        // on first insertion to key "favorites"
        if (value === null) {
          let favArray = [];
          favArray.push(song);// save stringified json object
          storage.set("favorites", JSON.stringify(favArray));
        } else {
          var storedFavsObj = JSON.parse(value);
          let songStored = storedFavsObj.some(s => s.artist == song.artist && s.title == song.title);

          if (!songStored && song.title != '') {
            storedFavsObj.push(song); // add song

            // stringify and store updated favorites object
            var favJSONstring = JSON.stringify(storedFavsObj);
            // clear old record
            storage.remove("favorites");
            // save new favorites with added song
            storage.set("favorites", favJSONstring).then(() => {
              console.log("favorites added song");
              this.lyricsSavedSuccessAlert();
            });
          } else {
            this.lyricsSavedFailureAlert();
            enableFavorites = false;
          }
        }
      }).then(() => {
        if (enableFavorites) {
          this.eventBus.emit("enable-favorite");
        }
      });
    },

    async lyricsSavedSuccessAlert() {
      const alert = await alertController
        .create({
          header: 'Lyrics were saved',
          message: 'You can find them in Favorites section',
          buttons: ['OK']
        });

      return alert.present();
    },

    async lyricsSavedFailureAlert() {
      const alert = await alertController
        .create({
          header: 'Lyrics were not saved',
          message: 'You have already saved this song.',
          buttons: ['OK']
        });

      return alert.present();
    },
    speakHello() {
      const lyricsText = this.$data.lyrics.join(" ").trim();
      Accessibility.speak({value: lyricsText});
      /*
      let currentDuration = 0;
      for (let audio in audioChunks) {
        let duration = audioChunks[audio].duration;
        console.log(duration);
        currentDuration += duration;
        setTimeout(() => { audioChunks[audio].play(); }, currentDuration * 1000);
      }*/
    },

    loadLyrics() {
       // clear previous lyric chunks from view
      // storage must be updated, because new data (lyrics, artist, title)
      // were inserted before emitting this event
      console.log("event load lyrics ocurred");
      this.$data.lyrics = [];

      storage.get("currentSong").then((value) => {
        console.log("lyrics to view retrieved");
        var songObj = JSON.parse(value);
        this.$data.artist = songObj.artist;
        this.$data.title = songObj.title;
        this.$data.lyrics = songObj.lyrics;
      });// .then(() => { this.loadSpeech(); });
    },

    loadSpeech() {
      const url = 'http://api.voicerss.org/';
      const key = '?key=e1f86a87c86d412a91161024984f816e';
      const lang = '&hl=en-us';
      const format = '&c=OGG';
      const quality = '&f=16khz_16bit_mono';
      const src = '&src=';

      let URL = url + key + lang + format + quality + src;

      const audioChunkSize = 5;
      let chunksInAudioPart = 0;

      let multichunk = '';

      for (let chunk in this.$data.lyrics) {
        if (this.$data.lyrics[chunk] != '') {
          chunksInAudioPart += 1;
          multichunk += this.$data.lyrics[chunk] + ' ';
          if (chunksInAudioPart == audioChunkSize || chunk == this.$data.lyrics.length - 1) {
            audioChunks.push(new Audio(URL + encodeURIComponent(multichunk)));
            multichunk = '';
          }
        }
      }
    },
  }
});
</script>
