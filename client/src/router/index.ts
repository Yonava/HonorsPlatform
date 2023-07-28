import { createWebHistory, createRouter } from 'vue-router'
import Panel from '../views/PanelPage.vue'
import Leaderboard from '../views/LeaderboardPage.vue'
import Auth from '../views/AuthPage.vue'
import Registrar from '../views/BuildRegistrarList.vue'
import Email from '../views/ComposeMassEmail.vue'
import AuthRedirect from '../views/AuthRedirect.vue'

import { useDocumentCache } from '../store/useDocumentCache'
import { useAuth } from '../store/useAuth'

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
    path: '/auth-redirect',
    name: 'auth-redirect',
    component: AuthRedirect
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
] as const

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes
})

router.beforeEach(async (to, from) => {
  const defaultTitle = 'Honors Program'
  const name = to.name as string ?? defaultTitle
  const goingTo = to.name as typeof routes[number]['name']
  const routesWithData: typeof routes[number]['name'][] = ['panel', 'registrar', 'email']

  if (routesWithData.includes(goingTo)) {
    useDocumentCache().getAllDocuments()
    useAuth().createSocketConnection()
  }

  if (name === defaultTitle || to.name === 'panel') {
    return
  }
  document.title = `${name[0].toUpperCase()}${name.slice(1)} - Honors Program`
})

export default router
