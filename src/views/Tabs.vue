<template>
  <ion-page ref="ionTabs">
    <ion-tabs @ionTabsWillChange="beforeTabChange">
      <ion-tab-bar>
        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon :icon="searchOutline" />
          <ion-label>Search</ion-label>
        </ion-tab-button>
        <!--  bounding :disabled to lyricsTabDisabled data -->
        <ion-tab-button ref="lyricsTab" tab="lyrics" :disabled="lyricsTabDisabled" href="/tabs/lyrics">
          <ion-icon :icon="musicalNotesOutline" />
          <ion-label>Lyrics</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="favorite" :disabled="favoriteTabDisabled" href="/tabs/favorite">
          <ion-icon :icon="starOutline" />
          <ion-label>Favorite</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="about" href="/tabs/about">
          <ion-icon :icon="informationCircleOutline" />
          <ion-label>About</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { searchOutline, musicalNotesOutline, starOutline, informationCircleOutline } from 'ionicons/icons';

import { storage as strg }  from './Search';
const storage = strg;

export default defineComponent ({
  name: 'Tabs',

  ionViewWillEnter() {
    this.checkFavoritesDatabase();
    this.checkCurrentLyrics();
  },

  components: {
    IonPage, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
  },

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
