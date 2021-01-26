<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row style="height: 100%" class="ion-align-items-center">
          <ion-col size="12" class="ion-align-self-center">
            <h1 class="ion-text-center">Favorite Songs</h1>
          </ion-col>
          <ion-col size="12" class="ion-align-self-start">
            <ion-list>
              <ion-item v-for="song in favSongs" :key="song">
                <ion-label>
                  <h2>{{ song.artist }}</h2>
                  <h3>{{ song.title }} </h3>
                </ion-label>
                <ion-buttons>
                  <ion-button size="small" color="primary" @click="showSongLyrics">
                    <ion-icon :icon="eye"></ion-icon>
                  </ion-button>
                  <ion-button size="small" color="danger" @click="deleteAlertConfirm">
                    <ion-icon :icon="trash"></ion-icon>
                  </ion-button>
                </ion-buttons>
              </ion-item>
            </ion-list>
          </ion-col>
          <ion-col size="12" class="ion-align-self-start">
            <br />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { trash, eye } from 'ionicons/icons';
import { storage as strg } from './Search';

const storage = strg;

export default  {
  name: 'Favorite',

  ionViewWillEnter() {
    this.loadFavoriteSongs();
  },
  components: { IonContent, IonPage, IonList, IonLabel, IonItem },
  data() {
    return {
      favSongs: []
    }
  },
  setup() {
    return { trash, eye }
  },
  methods: {
    // helpers
    getSelectedArtist(event) {
      let clicked = event.target;
      let labels = clicked.parentNode.previousSibling;
      let artist = labels.childNodes[0].innerHTML;

      return artist;
    },

    getSelectedTitle(event) {
      let clicked = event.target;
      let labels = clicked.parentNode.previousSibling;
      let title = labels.childNodes[1].innerHTML;

      return title;
    },

    showSongLyrics(event) {
      let artist = this.getSelectedArtist(event);
      let title = this.getSelectedTitle(event);

      storage.get("currentSong").then((value) => {
        let selectedSong = this.$data.favSongs.find(song =>
            song.artist == artist && song.title == title);

        if (value !== null) {
          storage.remove("currentSong");
        }
        storage.set("currentSong", JSON.stringify(selectedSong)).then(() => {
          this.$router.push("lyrics");
        });
        this.eventBus.emit("enable-lyrics");
      });
    },

    loadFavoriteSongs() {
      console.log("favorites tab will enter");
      storage.get("favorites").then( (value) => {
        var songsObj = JSON.parse(value);
        this.$data.favSongs = songsObj;
      });
    },

    deleteSong(event) {
      let artist = this.getSelectedArtist(event);
      let title = this.getSelectedTitle(event);

      // get new favSongs without the deleted song
      this.$data.favSongs =
        this.$data.favSongs.filter(
          song => song.artist != artist && song.title != title
        );
      // updated favorites in database
      storage.set("favorites", JSON.stringify(this.$data.favSongs));
      if (this.$data.favSongs.length == 0) {
        this.$router.push("search");
      }
    },

    async deleteAlertConfirm(event) {
      const alert = await alertController
        .create({
          header: 'Delete song',
          message: 'Do you really want to delete this song from Favorites?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Yes',
              handler: () => {
                this.deleteSong(event);
              },
            },
          ],
        });
      return alert.present();
    }
    // end methods
  }
}
</script>
