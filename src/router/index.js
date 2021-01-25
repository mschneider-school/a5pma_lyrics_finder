import { createRouter, createWebHistory } from '@ionic/vue-router';
import Tabs from '../views/Tabs.vue'

const routes = [
  {
    path: '/',
    redirect: '/tabs/Search'
  },
  {
    path: '/tabs/',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: '/tabs/search'
      },
      {
        path: 'search',
        component: () => import('@/views/Search.vue')
      },
      {
        path: 'lyrics',
        component: () => import('@/views/Lyrics.vue')
      },
      {
        path: 'favorite',
        component: () => import('@/views/Favorite.vue')
      },
      {
        path: 'about',
        component: () => import('@/views/About.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
