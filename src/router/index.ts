import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import { isAdminAuthenticated } from '../composables/useAdminAuth'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/research', name: 'research', component: () => import('../pages/ResearchPage.vue') },
  {
    path: '/publications',
    name: 'publications',
    component: () => import('../pages/PublicationsPage.vue'),
  },
  { path: '/member', name: 'member', component: () => import('../pages/MemberPage.vue') },
  { path: '/internship', redirect: '/contact#internship' },
  { path: '/news', name: 'news', component: () => import('../pages/NewsPage.vue') },
  { path: '/contact', name: 'contact', component: () => import('../pages/ContactPage.vue') },

  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../pages/admin/AdminLoginPage.vue'),
  },
  {
    path: '/admin',
    component: () => import('../pages/admin/AdminLayout.vue'),
    meta: { requiresAdminAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../pages/admin/AdminDashboardPage.vue') },
    ],
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
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const needsAuth = to.matched.some((record) => record.meta.requiresAdminAuth)
  if (needsAuth && !isAdminAuthenticated()) {
    return { path: '/admin/login', query: { redirect: to.fullPath } }
  }
})

export default router
