import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/landing',
    name: 'Landing',
    component: () => import('../pages/LandingPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('../pages/CollectionsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const token = sessionStorage.getItem('sm_access_token')

  if (to.meta.requiresAuth && !token) {
    return '/landing'
  } else if (to.meta.guestOnly && token) {
    return '/'
  }
  return true
})

export default router
