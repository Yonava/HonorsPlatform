import { createWebHistory, createRouter } from 'vue-router'
import PanelPage from '../views/PanelPage.vue'
import Leaderboard from '../views/LeaderboardPage.vue'
import Auth from '../views/AuthPage.vue'

import { panels, DEFAULT_PANEL } from '@panels'
import type { PanelName } from '@panels'
import { useDocumentCache } from '@store/useDocumentCache'
import { useSheetManager } from '@store/useSheetManager'
import { useSocket } from '@store/useSocket'
import { useAuth, getAuthErrorURL } from '@store/useAuth'

export const PAGES = {
  HOME: {
    name: 'home',
    path: '/'
  },
  PANEL: {
    name: 'panel',
    path: '/panel'
  },
  AUTH: {
    name: 'auth',
    path: '/auth'
  },
  LEADERBOARD: {
    name: 'leaderboard',
    path: '/leaderboard'
  }
} as const

const routes = [
  {
    path: PAGES.HOME.path,
    name: PAGES.HOME.name,
    redirect: '/panel'
  },
  {
    path: PAGES.PANEL.path,
    name: PAGES.PANEL.name,
    component: PanelPage
  },
  {
    path: PAGES.AUTH.path,
    name: PAGES.AUTH.name,
    component: Auth
  },
  {
    path: PAGES.LEADERBOARD.path,
    name: PAGES.LEADERBOARD.name,
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

  if (goingTo === PAGES.PANEL.name && comingFrom !== PAGES.PANEL.name) {
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

  if (name === TITLE || to.name === PAGES.PANEL.name) {
    const { setPanel, panel: currPanel } = useSheetManager()
    const queryPanelNameRaw = typeof to.query.type === 'string' ? to.query.type : ''
    const queryPanelName = queryPanelNameRaw.toUpperCase()
    const onCorrectPanel = queryPanelName === currPanel.panelName
    if (onCorrectPanel) return
    const newActivePanelName = (queryPanelName in panels ? queryPanelName : DEFAULT_PANEL.panelName) as PanelName
    setPanel(newActivePanelName)
    return
  }

  const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)
  document.title = `${capitalize(name)} - ${TITLE}`

})

export default router
