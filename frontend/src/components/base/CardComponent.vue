<!-- src/components/base/CardComponent.vue -->
<template>
  <div
    class="bg-ahmi-bg rounded-minimal shadow-md p-4 md:p-6 flex flex-col space-y-6 mb-4 h-full overflow-hidden"
  >
    <!-- Bloc 1 - Image -->
    <div class="w-full h-64 md:h-96">
      <img
        v-if="evenement.imageUrl"
        :src="evenement.imageUrl"
        :alt="evenement.titre"
        class="w-full h-full object-cover rounded-minimal"
      />
    </div>

    <!-- Bloc 2 - Titre & Date -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
      <h2 class="text-ahmi-primary-title font-montserratAlt font-h1-bold-weight text-h2">
        {{ evenement.titre }}
      </h2>
      <div class="flex items-center">
        <CalendarIcon class="h-6 w-6 text-ahmi-secondary" />
        <span class="text-ahmi-text-secondary font-openSans text-caption ml-2">
          {{ formatDate(evenement.dateDebut) }}
        </span>
      </div>
    </div>

    <!-- Bloc 3 - Description -->
    <div>
      <p class="text-ahmi-text-primary font-openSans text-body line-clamp-2">
        {{ evenement.description }}
      </p>
    </div>

    <!-- Bloc 4 - Infos complémentaires -->
    <div
      v-if="
        evenement.lieu?.adresse ||
        evenement.organisateur?.email ||
        evenement.lienSiteInternet ||
        evenement.lienInstagram
      "
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <!-- Adresse -->
      <div class="flex items-center">
        <LocationMarkerIcon class="h-6 w-6 text-ahmi-secondary" />
        <span class="ml-2 text-caption text-ahmi-text-primary">
          {{
            [evenement?.lieu?.rue, evenement?.lieu?.codePostal, evenement?.lieu?.commune]
              .filter(Boolean)
              .join(', ') || 'Adresse non renseignée'
          }}
        </span>
      </div>

      <!-- Email organisateur -->
      <div class="flex items-center">
        <MailIcon class="h-6 w-6 text-ahmi-secondary" />
        <span class="ml-2 text-caption text-ahmi-text-primary">
          {{ evenement?.organisateur?.email || 'Email non fourni' }}
        </span>
      </div>

      <!-- Site Internet -->
      <div class="flex items-center" v-if="evenement.lienSiteInternet">
        <GlobeAltIcon class="h-6 w-6 text-ahmi-secondary" />
        <a
          :href="evenement.lienSiteInternet"
          class="ml-2 text-caption text-ahmi-text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ evenement.lienSiteInternet }}
        </a>
      </div>

      <!-- Instagram -->
      <div class="flex items-center" v-if="evenement.lienInstagram">
        <PhotographIcon class="h-6 w-6 text-ahmi-secondary" />
        <a
          :href="evenement.lienInstagram"
          class="ml-2 text-caption text-ahmi-text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ evenement.lienInstagram }}
        </a>
      </div>
    </div>

    <!-- Bloc 5 - Actions -->
    <div class="flex items-center justify-between md:justify-end gap-4">
      <button
        :aria-disabled="!utilisateur"
        v-if="!isExpired"
        @click="handleReservation"
        class="bg-ahmi-primary text-ahmi-text-invert px-6 py-2 rounded-xl font-semibold hover:bg-ahmi-secondary transition"
      >
        Réserver
      </button>

      <div class="flex items-center cursor-pointer" @click="goToEventDetails">
        <PlusIcon class="h-6 w-6 text-ahmi-secondary" />
        <span class="text-ahmi-text-secondary font-openSans text-caption ml-2"> Détails </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  CalendarIcon,
  LocationMarkerIcon,
  MailIcon,
  GlobeAltIcon,
  PhotographIcon,
  PlusIcon,
} from '@heroicons/vue/outline'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { useRouter } from 'vue-router'
//import useAuth from '@/hooks/utiliserAuth'
import { useToast } from 'vue-toastification'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  evenement: {
    type: Object,
    required: true,
  },
})

const evenement = props.evenement
console.info('Événement reçu :', evenement)
const authStore = useAuthStore()
const utilisateur = computed(() => authStore.utilisateur)
const toast = useToast()

const router = useRouter()

const formatDate = (date) => {
  if (!date) return 'Date inconnue'
  try {
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return date
  }
}
//eslint-disable-next-line no-unused-vars
const truncateDescription = (desc) => {
  if (!desc) return ''
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
}

const goToEventDetails = () => {
  if (evenement?._id) {
    router.push(`/evenement/${evenement._id}`)
  }
}

function handleReservation() {
  const target = `/evenement/${evenement._id}/reserver`
  if (!utilisateur.value) {
    toast.warning('Vous devez être connecté pour réserver.')
    const redirect = encodeURIComponent(target)
    return router.push(`/connexion?redirect=${redirect}`)
  }
  router.push(target)
}
const isExpired = computed(() => {
  return new Date(evenement.dateFin) < new Date()
})
</script>

<style scoped>
/* Ajoute ici des styles spécifiques si besoin */
</style>
