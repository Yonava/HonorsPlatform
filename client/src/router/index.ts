import { createWebHistory, createRouter } from 'vue-router'
import Panel from '../views/PanelPage.vue'
import Leaderboard from '../views/LeaderboardPage.vue'
import Auth from '../views/AuthPage.vue'
import Registrar from '../views/BuildRegistrarList.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  // scrollBehavior: () => ({ left: 0, top: 0 }),
  routes
})

const sensitiveRoutes = [
  'panel', 
  'registrar'
]

router.beforeEach(async (to, from) => {
  const name = to.name as string ?? 'Honors Program'
  document.title = `${name[0].toUpperCase()}${name.slice(1)} - Honors Program`
  if (!sensitiveRoutes.includes(name)) return
  const token = localStorage.getItem('token') ?? 'null'
  try {
    const res = await fetch(`/api/auth/${encodeURIComponent(token)}`)
    const data = await res.json()
    if (data.url) location.replace(data.url)
  } catch {
    console.error('Failed to verify token')
    router.push({
      name: 'auth',
      query: { 
        hold: 'no_token'
      }
    })
  }
})

export default router
