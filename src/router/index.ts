import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/research', name: 'research', component: () => import('../pages/ResearchPage.vue') },
  {
    path: '/publications',
    name: 'publications',
    component: () => import('../pages/PublicationsPage.vue'),
  },
  { path: '/member', name: 'member', component: () => import('../pages/MemberPage.vue') },
  { path: '/news', name: 'news', component: () => import('../pages/NewsPage.vue') },
  { path: '/contact', name: 'contact', component: () => import('../pages/ContactPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
