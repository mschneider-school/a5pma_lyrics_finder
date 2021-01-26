<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-fab vertical="top" horizontal="start" slot="fixed">
        <ion-fab-button color="light" @click="saveToFavorites">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-fab vertical="top" horizontal="end" slot="fixed">
        <ion-fab-button color="light" @click="speakLyrics">
          <ion-icon :icon="icon"></ion-icon>
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
         IonFabButton, IonText, alertController, isPlatform }
from '@ionic/vue';

import { add, play, stop, sync } from 'ionicons/icons';
import { defineComponent } from 'vue';

import { storage as strg }  from './Search';
const storage = strg;

import { Plugins } from "@capacitor/core";
const { Accessibility } = Plugins;

let audio = null;

export default defineComponent({
  name: 'Lyrics',

  ionViewWillEnter() {
    console.log("event on lyrics tab");
    if (isPlatform("android")) {
      this.$data.icon = play;
    }
    this.loadLyrics();
  },
  ionViewWillLeave() {
    // pause audio on tab switch
    if ( !isPlatform("android") && audio != null
                                && !audio.ended
                                && !audio.paused
                                && audio.currentTime > 0) {
      this.$data.icon = play;
      audio.pause();
    }
  },
  components: { IonContent, IonPage, IonGrid, IonRow, IonCol,
                IonFab, IonFabButton, IonText },
  setup() {
    return {
      add,
      play,
      stop
    }
  },
  data() {
    return {
      artist: '',
      title: '',
      lyrics: [],
      icon: sync
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
            });
            this.lyricsSavedSuccessAlert();
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

    async audioNotReadyAlert() {
      const alert = await alertController
        .create({
          header: 'Audio not ready',
          message: 'Please wait a moment before you try again.',
          buttons: ['OK']
        });
      return alert.present();
    },

    speakLyrics() {
      // as a hack on android use builtin speech synthesis
      // leider kann man nicht das Audio ausschalten
      if (isPlatform("android")) {
        const lyricsText = this.$data.lyrics.join(" ").trim();
        Accessibility.speak({value: lyricsText});
      } else {
        // pwa or another platform
        if (this.$data.icon == play) {
          // if audio is ready show play icon and play it
          this.$data.icon = stop;
          audio.play();
        } else if (this.$data.icon == stop) { // if audio is playing show stop icon
          this.$data.icon = play;
          audio.pause();
        } else {
          this.audioNotReadyAlert();
        }
      }
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
      }).then(() => {
        if (audio == null && !isPlatform("android")) {
          this.loadSpeech();
        }
      });
    },

    loadSpeech() {
      const url = 'http://api.voicerss.org/';
      const key = '?key=e1f86a87c86d412a91161024984f816e';
      const lang = '&hl=en-us';
      const format = '&c=OGG';
      const quality = '&f=16khz_16bit_mono';
      const src = '&src=';

      let lrcs = '';
      const max_chunks = 10;
      let chunks = 0;

      for(let i = 0; i < this.$data.lyrics.length; ++i) {
        if (this.$data.lyrics[i] != '') {
          lrcs += this.$data.lyrics[i];
          lrcs += '\n';
          chunks++;
        }
        if (chunks == max_chunks) {
          break;
        }
      }
      console.log(lrcs);
      // create url
      let URL = url + key + lang + format + quality + src;
      // get audio from max_chunks lyrics
      audio = new Audio(URL + encodeURIComponent(lrcs));
      if (audio != null) {
        audio.addEventListener("canplaythrough", () => {
          this.$data.icon = play;
        });
        audio.addEventListener("ended", () => {
          this.$data.icon = play;
        });
      }
    }
  }
});
</script>
