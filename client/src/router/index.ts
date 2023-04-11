import { createWebHistory, createRouter } from 'vue-router'
import Panel from '../views/PanelPage.vue'
import Leaderboard from '../views/LeaderboardPage.vue'
import Auth from '../views/AuthPage.vue'
import Registrar from '../views/BuildRegistrarList.vue'
import Email from '../views/ComposeMassEmail.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/panel'
  },
  {
    path: '/panel',
    name: 'panel',
    component: Panel
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth
  },
  {
    path: '/registrar',
    name: 'registrar',
    component: Registrar
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: Leaderboard
  },
  {
    path: '/email',
    name: 'email',
    component: Email
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes
})

router.beforeEach(async (to, from) => {
  const defaultTitle = 'Honors Program'
  const name = to.name as string ?? defaultTitle
  if (name === defaultTitle) return
  document.title = `${name[0].toUpperCase()}${name.slice(1)} - Honors Program`
})

export default router
