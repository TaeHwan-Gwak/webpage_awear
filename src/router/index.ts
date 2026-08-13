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

  // /admin — nav에 링크는 없고 URL로만 접근. 로그인 페이지만 공개, 나머지는 전부 비밀번호 확인 후 접근.
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
      // /admin 기본 화면. 이후 /admin/news, /admin/publications 등은
      // 여기 children 배열에 항목만 추가하면 됩니다.
      { path: '', name: 'admin-dashboard', component: () => import('../pages/admin/AdminDashboardPage.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
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
