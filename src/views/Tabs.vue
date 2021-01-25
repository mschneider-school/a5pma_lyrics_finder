<template>
  <ion-page ref="ionTabs">
    <ion-tabs @ionTabsWillChange="beforeTabChange">
      <ion-tab-bar>
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon :icon="searchOutline" />
          <ion-label>Search</ion-label>
        </ion-tab-button>
        <!--  bounding :disabled to lyricsTabDisabled data -->
        <ion-tab-button ref="lyricsTab" tab="tab2" :disabled="lyricsTabDisabled" href="/tabs/tab2">
          <ion-icon :icon="musicalNotesOutline" />
          <ion-label>Lyrics</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" :disabled="favoriteTabDisabled" href="/tabs/tab3">
          <ion-icon :icon="starOutline" />
          <ion-label>Favorite</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab4">
          <ion-icon :icon="informationCircleOutline" />
          <ion-label>About</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage } from '@ionic/vue';
import { searchOutline, musicalNotesOutline, starOutline, informationCircleOutline } from 'ionicons/icons';

import { storage as strg }  from './Tab1';
const storage = strg;


export default defineComponent ({
  name: 'Tabs',

  ionViewWillEnter() {
    this.checkFavoritesDatabase();
    this.checkCurrentLyrics();
  },

  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage },
  setup() {
    return {
      searchOutline,
      musicalNotesOutline,
      starOutline,
      informationCircleOutline,
      ref
    }
  },
  data() {
    return {
      lyricsTabDisabled: "true",
      favoriteTabDisabled: "true"
    }
  },
  methods: {
    // on event fired the lyrics tab will be enabled -- reacts to bound data variable
    enableLyrics() {
      this.$data.lyricsTabDisabled = "false";
    },
    enableFavorite() {
      this.$data.favoriteTabDisabled = "false";
    },
    checkFavoritesDatabase() {
      storage.get("favorites").then( (value) => {
        if (value === null || value === "[]") {
          this.$data.favoriteTabDisabled = "true";
        } else {
          this.$data.favoriteTabDisabled = "false";
        }
      });
    },
    checkCurrentLyrics() {
      storage.get("currentSong").then( (value) => {
        if (value === null || value === '') {
          this.$data.lyricsTabDisabled = "true";
        } else {
          this.$data.lyricsTabDisabled = "false"
        }
      });
    },
    beforeTabChange() {
      console.log("tab will change, db will checked");
      this.checkFavoritesDatabase();
    }
  },
  mounted() {
    this.eventBus.on("enable-lyrics", this.enableLyrics);
    this.eventBus.on("enable-favorite", this.enableFavorite);
  },
});
</script>
