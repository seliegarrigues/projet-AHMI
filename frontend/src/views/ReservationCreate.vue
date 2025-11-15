<!-- frontend/src/views/ReservationCreate.vue -->
<template>
  <MainLayout>
    <div class="max-w-2xl mx-auto py-10 px-4">
      <h1 class="text-h2 font-bold text-ahmi-text-brand mb-4">Réserver une place</h1>

      <div v-if="loading" class="text-center py-8">Chargement...</div>
      <div v-else-if="error" class="text-red-600 text-center">{{ error }}</div>
      <div v-else class="bg-white rounded-xl shadow p-6 space-y-6">
        <!-- Détails de l’événement -->
        <div>
          <h2 class="text-lg font-semibold mb-2">{{ evenement.titre }}</h2>
          <p class="text-sm text-gray-600 mb-1">{{ formatDate(evenement.dateDebut) }}</p>
          <p class="text-sm">{{ evenement.lieu?.adresse }}</p>
        </div>

        <div class="text-sm">
          <p>
            💶 Prix par personne : <strong>{{ evenement.prix || 0 }} €</strong>
          </p>
          <p>
            🎟️ Places restantes : <strong>{{ placesDisponibles }}</strong>
          </p>
        </div>

        <!-- Sélection du nombre de places -->
        <div class="flex items-center gap-4">
          <label class="font-medium" for="places-input">Nombre de places :</label>
          <CounterInput id="places-input" v-model="places" :max="placesDisponibles" :min="1" />
        </div>
        <p v-if="placesDisponibles <= 0" class="text-red-600">Cet événement est complet.</p>

        <BaseButton
          variant="primary"
          size="lg"
          class="w-full"
          :disabled="places < 1 || places > placesDisponibles || placesDisponibles <= 0"
          @click="validerReservation"
        >
          Valider ma réservation
        </BaseButton>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { useToast } from 'vue-toastification'
import MainLayout from '@/layout/MainLayout.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import CounterInput from '@/components/base/CounterInput.vue'
import { createBooking } from '@/services/bookingService'
import { getEventById } from '@/services/eventService'
import useAuth from '@/hooks/utiliserAuth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
// eslint-disable-next-line no-unused-vars
const { utilisateur } = useAuth()

const evenement = ref(null)
const loading = ref(true)
const error = ref(null)
const sending = ref(false)
const places = ref(1)

const placesDisponibles = computed(() => {
  if (!evenement.value) return 0
  const total = evenement.value.capaciteMax || 0
  const reservees = evenement.value.placesReservees || 0
  return total - reservees
})

onMounted(async () => {
  try {
    const res = await getEventById(route.params.id)
    evenement.value = res.data
  } catch (e) {
    error.value = "Impossible de charger l'événement."
    console.error(e)
  } finally {
    loading.value = false
  }
})

const formatDate = (d) => {
  if (!d) return '—'
  try {
    return format(new Date(d), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return d
  }
}

const validerReservation = async () => {
  console.info('DATA ENVOYÉE POUR RÉSERVATION:', {
    evenement: evenement.value._id,
    nombrePlaces: places.value,
  })

  if (!evenement.value?._id || places.value < 1) {
    toast.error('Événement ou nombre de places invalide.')
    return
  }
  console.info('typeof evenement.value._id =', typeof evenement.value._id)
  console.info('evenement.value._id =', evenement.value._id)
  console.info('longueur =', evenement.value._id?.length)

  sending.value = true
  try {
    await createBooking({
      evenement: evenement.value._id,
      nombrePlaces: places.value,
    })
    toast.success('Réservation enregistrée')
    router.push('/account')
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erreur lors de la réservation')
    console.error('Erreur complète Axios:', e)
    console.error('Détails Joi si dispo:', e?.response?.data?.details)
  } finally {
    sending.value = false
  }
}
</script>
