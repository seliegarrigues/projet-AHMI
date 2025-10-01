import { createRouter, createWebHistory } from 'vue-router'

import publicRoutes from './routes/publicRoutes'
import userRoutes from './routes/userRoutes'
import adminRoutes from './routes/adminRoutes'

import { useUtilisateurStore } from '@/stores/utilisateur'

const routes = [
  ...publicRoutes,
  ...userRoutes,
  ...adminRoutes,

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
// --- Garde globale basée sur meta.requiresAuth / meta.requiresAdmin / meta.roles ---
router.beforeEach((to, from, next) => {
  // Récup auth (store OU localStorage), sans casser si le store n’est pas dispo ici
  let token = null
  let role = ''

  try {
    const store = useUtilisateurStore?.() // si le store existe déjà
    token = store?.token || null
    role = (store?.role || store?.utilisateur?.role || '').toLowerCase()
  } catch {
    /* pas de store */
  }

  // fallback localStorage
  token = token || localStorage.getItem('token') || localStorage.getItem('auth_token') || null

  try {
    if (!role) {
      const u = JSON.parse(localStorage.getItem('auth_user') || 'null')
      role = (u?.role || '').toLowerCase()
    }
  } catch {
    /* ignore */
  }

  // 1) Pages strictement admin
  if (to.meta?.requiresAdmin) {
    if (!token) return next(`/connexion?redirect=${encodeURIComponent(to.fullPath)}`)
    if (role !== 'admin') return next('/403')
    return next()
  }

  // 2) Pages avec liste de rôles autorisés (ex: ['partenaire','admin'])
  if (Array.isArray(to.meta?.roles) && to.meta.roles.length) {
    if (!token) return next(`/connexion?redirect=${encodeURIComponent(to.fullPath)}`)
    const allowed = to.meta.roles.map((r) => String(r).toLowerCase())
    return allowed.includes(role) ? next() : next('/403')
  }

  // 3) Pages simplement protégées par login
  if (to.meta?.requiresAuth && !token) {
    return next(`/connexion?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // 4) Par défaut, on laisse passer
  return next()
})

export default router
