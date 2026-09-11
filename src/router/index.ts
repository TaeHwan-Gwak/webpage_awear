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
  { path: '/member/cv', name: 'member-cv', component: () => import('../pages/CVPage.vue') },
  { path: '/internship', redirect: '/contact#internship' },
  { path: '/news', name: 'news', component: () => import('../pages/NewsPage.vue') },
  { path: '/equipment', name: 'equipment', component: () => import('../pages/EquipmentPage.vue') },
  { path: '/contact', name: 'contact', component: () => import('../pages/ContactPage.vue') },

  {
    path: '/admin',
    redirect: '/admin/login',
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../pages/admin/AdminLoginPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 122, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
