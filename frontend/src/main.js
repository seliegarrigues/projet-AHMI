import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

//  Toastification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Styles globaux
import '@/assets/main.css'
import './assets/styles/design-variables.css'

const app = createApp(App)

//  Options Toastification
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
}

// Plugins
app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

// Mount app
app.mount('#app')

// Debug backend URL
console.info('➡️ BACKEND_URL =', import.meta.env.VITE_API_URL)
