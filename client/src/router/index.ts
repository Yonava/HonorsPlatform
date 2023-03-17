import { createWebHistory, createRouter } from 'vue-router'
import StudentPage from '../views/StudentPage.vue'
import AboutUs from '../views/AboutUs.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: StudentPage
  },
  {
    path: '/about',
    name: 'about',
    component: AboutUs
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
