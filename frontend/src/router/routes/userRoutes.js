export default [
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/AccountView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/account/proposer-evenement/:id?',
    name: 'proposer-evenement',
    component: () => import('@/views/CreateOrEditEvent.vue'),
    props: true,
    meta: { requiresAuth: true, roles: ['partenaire', 'admin'] },
  },
  {
    path: '/evenement/:id/reserver',
    name: 'reservationCreate',
    component: () => import('@/views/ReservationCreate.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reservation/:id/modifier',
    name: 'modifierReservation',
    component: () => import('@/views/ReservationEdit.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/partenaires',
    name: 'partenairesCreate',
    component: () => import('@/views/PartenaireEventForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/partenaires/:id',
    name: 'partenairesEdit',
    component: () => import('@/views/PartenaireEventForm.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/event',
    name: 'eventCreate',
    component: () => import('@/views/CreateOrEditEvent.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/event/:id',
    name: 'eventEdit',
    component: () => import('@/views/CreateOrEditEvent.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
]
