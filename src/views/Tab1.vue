<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-grid style="height: 100%">
        <ion-row style="height: 100%" class="ion-align-items-center">
          <ion-col size="12" class="ion-align-self-center">
            <h1 class="ion-text-center">Find Lyrics</h1>
          </ion-col>
          <ion-col size="12" class="ion-align-self-center">
            <ion-item>
              <ion-label>Artist</ion-label>
              <ion-input name="artist" id="artist" v-model="artist"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label> Title</ion-label>
              <ion-input name="title" id="title" v-model="title"></ion-input>
            </ion-item>
              <ion-text v-if="errors.length">
                <ion-chip color="danger" :key="error" :value="error" v-for="error in errors">
                  <ion-label>{{ error }}</ion-label>
                </ion-chip>
              </ion-text>
          </ion-col>
          <ion-col size="12" class="ion-align-self-start">
            <ion-button @click="validateInput" expand="block">
              Search lyrics
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonItem, IonLabel, IonInput,
         IonRow, IonCol, IonButton, IonChip, IonGrid, alertController } from '@ionic/vue';

// import storage service to store lyrics
import Storage from '../services/storage';
const storage = new Storage();
export { storage };

export default {
  name: 'Tab1',

  ionViewWillEnter() {
    this.$data.artist = '';
    this.$data.title = '';
  },
  components: {
    IonContent, IonPage, IonItem, IonLabel, IonGrid,
    IonInput, IonRow, IonCol, IonButton, IonChip
  },
  data() {
    return {
      artist: '',
      title: '',
      loading: true,
      errors: []
    }
  },
  methods: {
    validateInput() {

      this.$data.errors = [];

      if (this.$data.artist == '') {
        this.$data.errors.push('Artist is required!');
      }

      if (this.$data.title == '') {
        this.$data.errors.push('Title is required!');
      }

      if (this.$data.errors.length == 0) {
        this.searchForLyrics();
      }
    },

    async searchForLyrics() {
      const artistText = this.$data.artist;
      const titleText = this.$data.title;

      const apiRequest = "https://api.lyrics.ovh/v1/" + artistText + "/" + titleText;
      const response = await fetch(apiRequest)
                              .then(res => res.json())
                              .catch(error => console.log(error));

      // if no lyrics were found, lyrics is empty string
      if (response.lyrics === '') {
        this.presentFailureAlert();
      } else {

        var song = {
          artist: artistText,
          title: titleText,
          lyrics: response.lyrics.split('\n')
        };

        var songJSONString = JSON.stringify(song);

        storage.set('currentSong', songJSONString);

        this.eventBus.emit('enable-lyrics');
        this.presentSuccessAlert();
      }
    },

    async presentSuccessAlert() {
      const alert = await alertController
        .create({
          header: 'Lyrics were found!',
          message: 'You can find them in Lyrics section.',
          buttons: ['OK'],
        });

      return alert.present();
    },

    async presentFailureAlert() {
      const alert = await alertController
        .create({
          header: 'Lyrics were not found!',
          message: 'Please try it with another artist or title.',
          buttons: ['OK'],
        });

      return alert.present();
    }
  }
}
</script>
