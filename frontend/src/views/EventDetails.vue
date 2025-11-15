<!-- src/views/EventDetails.vue -->
<template>
  <MainLayout>
    <div v-if="loading" class="text-center py-8">Chargement de l'événement...</div>
    <div v-else-if="error" class="text-red-600 text-center py-8">{{ error }}</div>
    <div
      v-else
      class="max-w-4xl mx-auto bg-ahmi-bg p-6 rounded-2xl shadow-md aria-label='Détails de l'événement'"
    >
      <!-- Image -->
      <img
        v-if="evenement.imageUrl"
        :src="evenement.imageUrl"
        :alt="evenement.titre"
        class="w-full h-64 object-cover rounded-2xl mb-6"
      />

      <!-- Titre & dates -->
      <h1 class="text-h1 font-h1-bold-family mb-2">{{ evenement.titre }}</h1>
      <p class="text-caption text-ahmi-text-secondary mb-6">
        Du {{ formatDate(evenement.dateDebut) }} au {{ formatDate(evenement.dateFin) }}
      </p>

      <!-- Description complète -->
      <p class="text-body mb-6 whitespace-pre-line">{{ evenement.description }}</p>

      <!-- Détails supplémentaires en grille -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="font-semibold">Adresse</h3>
          <p>
            {{ evenement.lieu?.rue || '' }},
            {{ evenement.lieu?.codePostal || '' }}
            {{ evenement.lieu?.commune || '' }}
          </p>
        </div>
        <div>
          <h3 class="font-semibold">Organisateur</h3>
          <p>
            {{ evenement.organisateur?.nom || '—' }}<br />
            <a
              v-if="evenement.organisateur?.email"
              :href="`mailto:${evenement.organisateur.email}`"
              class="underline"
            >
              {{ evenement.organisateur.email }}
            </a>
            <span v-else>Non fourni</span>
          </p>
        </div>
        <div>
          <h3 class="font-semibold">Capacité maximum</h3>
          <p>{{ evenement.capaciteMax || '—' }} personnes</p>
        </div>
        <p>
          {{
            evenement.placesDisponibles === Infinity
              ? 'illimité'
              : evenement.placesDisponibles + ' place(s) restante(s)'
          }}
        </p>

        <div>
          <h3 class="font-semibold">Prix</h3>
          <p>{{ evenement.prix != null ? evenement.prix + ' €' : '—' }}</p>
        </div>
        <div>
          <h3 class="font-semibold">Participation financière</h3>
          <p>{{ evenement.participationFinanciere || 'Non renseignée' }}</p>
        </div>
        <div v-if="evenement.categories?.length">
          <h3 class="font-semibold">Catégories</h3>
          <ul class="list-disc list-inside">
            <li v-for="cat in evenement.categories" :key="cat._id">{{ cat.nom }}</li>
          </ul>
        </div>
        <div v-if="evenement.lienSiteInternet">
          <h3 class="font-semibold">Site web</h3>
          <a
            :href="evenement.lienSiteInternet"
            target="_blank"
            rel="noopener noreferrer"
            class="underline"
          >
            {{ evenement.lienSiteInternet }}
          </a>
        </div>
        <div v-if="evenement.lienInstagram">
          <h3 class="font-semibold">Instagram</h3>
          <a
            :href="evenement.lienInstagram"
            target="_blank"
            rel="noopener noreferrer"
            class="underline"
          >
            {{ evenement.lienInstagram }}
          </a>
        </div>
      </div>

      <!-- Bouton de réservation -->
      <div class="flex justify-end">
        <button
          :aria-disabled="!utilisateur"
          v-if="!isExpired"
          @click="handleReservation"
          class="bg-ahmi-primary text-ahmi-text-invert px-6 py-2 rounded-xl font-semibold hover:bg-ahmi-secondary transition"
        >
          Réserver
        </button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// eslint-disable-next-line no-unused-vars
import axios from 'axios'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import MainLayout from '@/layout/MainLayout.vue'
import useAuth from '@/hooks/utiliserAuth'
import { useToast } from 'vue-toastification'
import { useEvenementsStore } from '@/stores/evenements'
const store = useEvenementsStore()

const route = useRoute()
const router = useRouter()
const { utilisateur } = useAuth()
const toast = useToast()

const evenement = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    await store.fetchEvenementById(route.params.id)
    const eventActuel = store.evenementActuel
    evenement.value = JSON.parse(JSON.stringify(eventActuel)) // copie propre
  } catch (e) {
    error.value = "Impossible de charger l'événement."
    console.error(e)
  } finally {
    loading.value = false
  }
})
//watch(evenement, (val) => {
// console.info('🔍 Catégories dans EventDetails.vue :', val?.categories)
//})

const formatDate = (d) => {
  if (!d) return '—'
  try {
    const parsed = new Date(d)
    return isNaN(parsed) ? d : format(parsed, "dd MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return d
  }
}

function handleReservation() {
  const target = `/evenement/${route.params.id}/reserver`
  if (!utilisateur.value) {
    toast.warning('Vous devez être connecté pour réserver.')
    const redirect = encodeURIComponent(target)
    return router.push(`/connexion?redirect=${redirect}`)
  }
  router.push(target)
}
const isExpired = computed(() => {
  return new Date(evenement.value?.dateFin) < new Date()
})
</script>

<style scoped>
/* Styles supplémentaires si besoin */
</style>
