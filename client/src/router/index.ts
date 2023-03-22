import { createWebHistory, createRouter } from 'vue-router'
import StudentPage from '../views/StudentPage.vue'
import Points from '../views/PointsPage.vue'
import Auth from '../views/AuthPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/panel'
  },
  {
    path: '/panel',
    name: 'panel',
    component: StudentPage
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth
  },
  {
    path: '/points',
    name: 'points',
    component: Points
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes
})

router.beforeEach(async (to, from) => {
  if (to.name === 'auth') return
  const token = localStorage.getItem('token') ?? ''
  const res = await fetch(`/api/auth/${encodeURIComponent(token)}`)
  const data = await res.json()
  if (data.url) location.replace(data.url)
})

export default router
