import { createRouter, createWebHistory } from 'vue-router'
import { updateHeadForRoute } from './updateHead'

const SITE_NAME = 'AWEAR Lab · GIST'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: {
      title: 'AWEAR Lab · AI-based WEArable Robotics Laboratory, GIST',
      description:
        'AWEAR Lab at the Gwangju Institute of Science and Technology (GIST) develops wearable robots and neural interfaces for rehabilitation, assistive technology, and human-robot interaction.',
    },
  },
  {
    path: '/research',
    name: 'research',
    component: () => import('../pages/ResearchPage.vue'),
    meta: {
      title: `Research | ${SITE_NAME}`,
      description:
        'Research at AWEAR Lab spans BCI and neural interfaces, robotics and prosthetics, and AI and vision for wearable robotic systems.',
    },
  },
  {
    path: '/publication',
    name: 'publications',
    component: () => import('../pages/PublicationsPage.vue'),
    meta: {
      title: `Publications | ${SITE_NAME}`,
      description: 'Peer-reviewed publications from AWEAR Lab on wearable robotics, rehabilitation engineering, and neural interfaces.',
    },
  },
  {
    path: '/member',
    name: 'member',
    component: () => import('../pages/MemberPage.vue'),
    meta: {
      title: `Member | ${SITE_NAME}`,
      description: 'Meet the principal investigator, postdoctoral researchers, graduate students, and alumni of AWEAR Lab.',
    },
  },
  {
    path: '/member/cv',
    name: 'member-cv',
    component: () => import('../pages/CVPage.vue'),
    meta: {
      title: `Curriculum Vitae | ${SITE_NAME}`,
      description: 'Curriculum vitae of the principal investigator of AWEAR Lab at GIST.',
    },
  },
  { path: '/internship', redirect: '/contact#internship' },
  {
    path: '/news',
    name: 'news',
    component: () => import('../pages/NewsPage.vue'),
    meta: {
      title: `News | ${SITE_NAME}`,
      description: 'Latest news, publications, awards, and grants from AWEAR Lab at GIST.',
    },
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('../pages/EquipmentPage.vue'),
    meta: {
      title: `Equipment | ${SITE_NAME}`,
      description: 'Research equipment and lab facilities used by AWEAR Lab at GIST.',
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../pages/ContactPage.vue'),
    meta: {
      title: `Contact | ${SITE_NAME}`,
      description: 'Contact AWEAR Lab at GIST — location, directions, and how to apply for research and internship positions.',
    },
  },

  {
    path: '/admin',
    redirect: '/admin/login',
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../pages/admin/AdminLoginPage.vue'),
    meta: { title: `Admin | ${SITE_NAME}`, robots: 'noindex, nofollow' },
  },
  {
    path: '/admin/stats',
    name: 'admin-stats',
    component: () => import('../pages/admin/AdminStatsPage.vue'),
    meta: { title: `Stats | ${SITE_NAME}`, robots: 'noindex, nofollow' },
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

router.afterEach((to) => {
  updateHeadForRoute(to)
})

export default router
