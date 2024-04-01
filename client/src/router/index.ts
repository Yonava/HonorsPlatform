import { createWebHistory, createRouter } from 'vue-router'
import Panel from '../views/PanelPage.vue'
import Leaderboard from '../views/LeaderboardPage.vue'
import Auth from '../views/AuthPage.vue'

import { useDocumentCache } from '@store/useDocumentCache'
import { useSocket } from '@store/useSocket'
import { useAuth, getAuthErrorURL, type ServerError } from '@store/useAuth'

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
    path: '/leaderboard',
    name: 'leaderboard',
    component: Leaderboard
  }
] as const

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes
})

router.beforeEach(async (to, from) => {
  const TITLE = 'Honors Program'
  const name = to.name as string ?? TITLE
  const goingTo = to.name as typeof routes[number]['name']
  const comingFrom = from.name as typeof routes[number]['name']

  if (goingTo === 'panel' && comingFrom !== 'panel') {
    const { getAllDocuments } = useDocumentCache()
    const { connect } = useSocket()
    const { authorizeSession, user } = useAuth()
    if (!user) {
      const error = await authorizeSession()
      if (error) location.replace(getAuthErrorURL(error))
    }
    await getAllDocuments()
    await connect()
  }

  if (name === TITLE || to.name === 'panel') return
  document.title = `${name[0].toUpperCase()}${name.slice(1)} - ${TITLE}`
})

export default router
