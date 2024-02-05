import { createWebHistory, createRouter } from 'vue-router'
import Panel from '../views/PanelPage.vue'
import Leaderboard from '../views/LeaderboardPage.vue'
import Auth from '../views/AuthPage.vue'

import { useDocumentCache } from '../store/useDocumentCache'
import { useSocket } from '../store/useSocket'
import { useAuth } from '../store/useAuth'
import { populateCache } from '@utils/sheetItemCaching'

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
  const defaultTitle = 'Honors Program'
  const name = to.name as string ?? defaultTitle
  const goingTo = to.name as typeof routes[number]['name']
  const comingFrom = from.name as typeof routes[number]['name']

  if (goingTo === 'panel' && comingFrom !== 'panel') {
    const { connect } = useSocket()
    const { authorizeSession } = useAuth()
    await authorizeSession()
    await connect()

    await populateCache()
  }

  if (name === defaultTitle || to.name === 'panel') return
  document.title = `${name[0].toUpperCase()}${name.slice(1)} - Honors Program`
})

export default router
