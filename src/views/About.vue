<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-grid style="height: 100%">
        <ion-row style="height: 100%" class="ion-align-items-center">
          <ion-col size="12" class="ion-align-self-center">
          </ion-col>

          <ion-col size="12" class="ion-align-self-start">
            <ion-card>
               <img src="../../public/assets/logo.svg" />
               <ion-card-header>
                 <ion-card-title>LyricsFinder</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                This app can help you find and practice lyrics of your favorite songs.
                Just type in the name of the artist and title of the song and press
                search button.
              </ion-card-content>
              <ion-card-content>
                <small>
                  &#169;2021 Martin Schneider (somespace)
                </small>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/vue';

export default  {
  name: 'About',
  components: { IonContent, IonPage, IonGrid, IonRow, IonCol }
}
</script>
