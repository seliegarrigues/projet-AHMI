<!-- src/components/FormulaireConnexion.vue -->
<template>
  <BaseFormWrapper
    title="Connexion"
    description="Connectez-vous à votre compte"
    @submit="handleLogin"
  >
    <!-- BANNERS -->
    <AlertBanner v-if="banner.message" :type="banner.type" :message="banner.message" />

    <!-- Email -->
    <BaseInput
      label="Email"
      type="email"
      v-model="email"
      required
      autocomplete="email"
      :error="auth.erreur && auth.erreurChamp === 'email' ? auth.erreur : ''"
    />

    <!-- Mot de passe -->
    <BaseInput
      label="Mot de passe"
      :type="showPassword ? 'text' : 'password'"
      v-model="password"
      required
      autocomplete="current-password"
      :error="auth.erreur && auth.erreurChamp === 'motDePasse' ? auth.erreur : ''"
    >
      <template #icon>
        <MdiEyeOutline class="cursor-pointer" @click="showPassword = !showPassword" />
      </template>
    </BaseInput>

    <!-- Lien mot de passe oublié -->
    <div class="text-right mb-2">
      <RouterLink to="/mot-de-passe-oublie" class="text-ahmi-secondary underline text-sm">
        Mot de passe oublié ?
      </RouterLink>
    </div>

    <!-- Message d'erreur global store (fallback accessibilité) -->
    <div v-if="auth.erreur" class="text-ahmi-error font-bold mt-2" aria-live="polite">
      {{ auth.erreur }}
    </div>

    <!-- Footer : inscription + retour home -->
    <template #footer>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
        <p class="text-sm">
          Pas encore inscrit ?
          <RouterLink to="/inscription" class="underline text-ahmi-secondary">
            Créez votre compte
          </RouterLink>
        </p>
        <RouterLink to="/" class="flex items-center gap-1 text-sm hover:text-ahmi-secondary">
          <HomeIcon class="h-5 w-5" /> Retour à l'accueil
        </RouterLink>
      </div>
    </template>
  </BaseFormWrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseFormWrapper from '@/components/base/BaseFormWrapper.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import AlertBanner from '@/components/ui/AlertBanner.vue'
import MdiEyeOutline from '@/components/icons/MdiEyeOutline.vue'
import { HomeIcon } from '@heroicons/vue/outline'
import { useToast } from 'vue-toastification'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const banner = ref({ type: 'info', message: '' })

function clearQuery(keys = []) {
  const q = { ...route.query }
  keys.forEach((k) => delete q[k])
  router.replace({ query: q }).catch(() => {})
}

onMounted(() => {
  // Bannières explicites selon le contexte
  if (route.query.reset === 'ok') {
    banner.value = {
      type: 'success',
      message: 'Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.',
    }
    clearQuery(['reset'])
  } else if (route.query.reset === 'invalid') {
    banner.value = {
      type: 'error',
      message: 'Lien de réinitialisation invalide ou expiré. Veuillez refaire la procédure.',
    }
    clearQuery(['reset'])
  }

  if (route.query.activation === 'ok') {
    banner.value = {
      type: 'success',
      message: 'Votre compte a été activé avec succès.',
    }
    clearQuery(['activation'])
  }
})

async function handleLogin() {
  banner.value = { type: 'info', message: '' } // reset local banner

  // Appelle le store d'auth
  const ok = await auth.connexion({
    email: email.value,
    motDePasse: password.value,
  })

  // Si le store a détecté une erreur (identifiants, etc.)
  if (!ok) {
    // on affiche l'erreur globale renvoyée par l'API
    toast.error(auth.erreur || 'Erreur de connexion')
    return
  }

  // Ici la connexion est OK (200, token + utilisateur en store)
  toast.success('Connexion réussie !')

  // Gestion des query ?redirect=/...
  const q = route.query.redirect
  let redirect = typeof q === 'string' && q.startsWith('/') ? q : '/account'

  if (redirect === '/connexion') {
    redirect = '/account'
  }

  return router.replace(redirect)
}
</script>

<style scoped>
/* style personnalisé si nécessaire */
</style>
