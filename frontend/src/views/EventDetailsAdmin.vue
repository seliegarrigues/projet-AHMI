<!-- frontend/src/views/EventDetailsAdmin.vue -->
<template>
  <MainLayout>
    <output v-if="loading" class="text-center py-8">Chargement de l'événement...</output>
    <div v-else-if="error" class="text-red-600 text-center py-8" role="alert">{{ error }}</div>
    <section
      v-else
      class="max-w-4xl mx-auto bg-ahmi-bg p-6 rounded-2xl shadow-md"
      aria-label="Détails administrateur de l'événement"
    >
      <!-- Image -->
      <img
        v-if="evenement.imageUrl"
        :src="evenement.imageUrl"
        :alt="evenement.titre"
        class="w-full h-64 object-cover rounded-2xl mb-6"
      />
      <div>
        <label for="image" class="block font-semibold mb-1">Image</label>
        <input
          id="image"
          v-model="evenement.imageUrl"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <!-- Titre & Dates -->
      <h1 class="text-h1 font-h1-bold-family mb-2">{{ evenement.titre }}</h1>
      <div>
        <label for="titre" class="block font-semibold mb-1">Titre</label>
        <input
          id="titre"
          v-model="evenement.titre"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label for="dateDebut" class="block font-semibold mb-1">Date de début</label>
          <input
            id="dateDebut"
            type="datetime-local"
            v-model="dateDebut"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p class="text-sm text-gray-500 mt-1">Actuelle : {{ formatDate(evenement.dateDebut) }}</p>
        </div>
        <div>
          <label for="dateFin" class="block font-semibold mb-1">Date de fin</label>
          <input
            id="dateFin"
            type="datetime-local"
            v-model="dateFin"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p class="text-sm text-gray-500 mt-1">Actuelle : {{ formatDate(evenement.dateFin) }}</p>
        </div>
      </div>

      <!-- Description -->

      <div>
        <label for="description" class="block font-semibold mb-1">Description</label>
        <textarea
          id="description"
          v-model="evenement.description"
          rows="4"
          class="w-full border border-gray-300 rounded px-3 py-2"
        ></textarea>
      </div>

      <!-- Adresse structurée -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label for="rue" class="block font-semibold mb-1">Rue</label>
          <input
            id="rue"
            v-model="adresseRue"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label for="codePostal" class="block font-semibold mb-1">Code postal</label>
          <input
            id="codePostal"
            v-model="codePostal"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label for="commune" class="block font-semibold mb-1">Commune</label>
          <input
            id="commune"
            v-model="commune"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      <!-- Capacités & infos complémentaires -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label for="capaciteMax" class="block font-semibold mb-1">Capacité max</label>
          <input
            id="capaciteMax"
            v-model="evenement.capaciteMax"
            type="number"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label for="participation" class="block font-semibold mb-1"
            >Participation financière (€)</label
          >
          <input
            id="participation"
            v-model="evenement.participationFinanciere"
            type="number"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      <!-- Liens -->
      <div class="mb-6">
        <label for="site" class="block font-semibold mb-1">Site web</label>
        <input
          id="site"
          v-model="evenement.lienSiteInternet"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div class="mb-6">
        <label for="instagram" class="block font-semibold mb-1">Instagram</label>
        <input
          id="instagram"
          v-model="evenement.lienInstagram"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <!-- Catégories -->
      <div class="mb-6">
        <label for="categories" class="block font-semibold mb-1">Catégories</label>
        <select
          id="categories"
          v-model="evenement.categories"
          multiple
          class="w-full border border-gray-300 rounded px-2 py-1"
        >
          <option v-for="cat in allCategories" :key="cat._id" :value="cat._id">
            {{ cat.nom }}
          </option>
        </select>
      </div>

      <!-- Résumé -->

      <div class="mt-8 bg-gray-50 p-4 rounded-lg border">
        <h2 class="text-lg font-bold mb-2">📊 Réservations</h2>
        <p class="text-sm text-gray-700">
          Réservées :
          <strong>{{ evenement.placesReservees || 0 }}</strong> /
          <strong>{{ evenement.capaciteMax || 'illimité' }}</strong>
        </p>
        <p class="text-sm text-gray-700">
          Places restantes :
          <strong class="text-green-700">
            {{
              evenement.placesDisponibles === Infinity
                ? 'illimité'
                : evenement.placesDisponibles + ' place(s)'
            }}
          </strong>
        </p>
      </div>

      <p
        v-if="confirmationMessage"
        :class="[
          'text-sm text-center font-medium px-4 py-2 rounded mb-4 border',
          confirmationType === 'error'
            ? 'bg-red-50 text-red-700 border-red-300'
            : confirmationType === 'info'
            ? 'bg-blue-50 text-blue-700 border-blue-300'
            : 'bg-green-50 text-green-700 border-green-300',
        ]"
      >
        {{ confirmationMessage }}
      </p>

      <!-- Boutons -->
      <div class="flex justify-between items-center gap-4 mt-8">
        <BaseButton variant="ghost" @click="router.push('/events')">← Retour</BaseButton>
        <div class="flex gap-2 flex-wrap">
          <BaseButton variant="ghost" @click="rejeter">Rejeter</BaseButton>
          <BaseButton variant="primary" @click="valider">Valider</BaseButton>
          <BaseButton variant="secondary" @click="sauvegarderCategories"
            >Enregistrer les catégories</BaseButton
          >
          <BaseButton variant="primary" @click="sauvegarderModifications"
            >Enregistrer les modifications</BaseButton
          >
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/base/BaseButton.vue'
import MainLayout from '@/layout/MainLayout.vue'
import {
  getEventById,
  updateEventStatus,
  getCategories,
  updateEvent,
} from '@/services/eventService'
import { formatDateForInput, toISOStringFromInput } from '@/utils/date'
import { useEvenementsStore } from '@/stores/evenements'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useEvenementsStore()

const evenement = ref(null)
const loading = ref(true)
const error = ref(null)
const allCategories = ref([])

const adresseRue = ref('')
const codePostal = ref('')
const commune = ref('')
const dateDebut = ref('')
const dateFin = ref('')
const modificationEffectuee = ref(false)

const confirmationMessage = ref('')
const confirmationType = ref('') // 'success' | 'error' | 'info'

const valider = async () => {
  try {
    await updateEventStatus(evenement.value._id, 'approuve')
    await store.refreshEvenement(evenement.value._id)

    toast.success('Événement validé.')
    showConfirmation('✅ Événement validé avec succès.')
    router.push('/events')
  } catch (e) {
    toast.error('Erreur lors de la validation.')
    console.error(e)
  }
}

const rejeter = async () => {
  try {
    await updateEventStatus(evenement.value._id, 'rejete')
    await store.refreshEvenement(evenement.value._id)

    toast.success('Événement rejeté.')
    showConfirmation(' Événement rejeté.')
    router.push('/account')
  } catch (e) {
    toast.error('Erreur lors du rejet.')
    console.error(e)
  }
}

const sauvegarderCategories = async () => {
  try {
    await updateEvent(evenement.value._id, { categories: evenement.value.categories })
    toast.success('Catégories enregistrées.')
    showConfirmation('📁 Catégories enregistrées.')
  } catch (e) {
    toast.error('Erreur lors de l’enregistrement des catégories.')
    console.error(e)
  }
}

const sauvegarderModifications = async () => {
  try {
    const lieu = {
      rue: adresseRue.value.trim(),
      codePostal: codePostal.value.trim(),
      commune: commune.value.trim(),
    }

    const payload = {
      titre: evenement.value.titre?.trim(),
      description: evenement.value.description?.trim(),
      imageUrl: evenement.value.imageUrl?.trim(),
      capaciteMax: Number(evenement.value.capaciteMax),
      participationFinanciere: Number(evenement.value.participationFinanciere),
      lienSiteInternet: evenement.value.lienSiteInternet?.trim(),
      lienInstagram: evenement.value.lienInstagram?.trim(),
      categories: (evenement.value.categories || []).map((cat) =>
        typeof cat === 'string' ? cat : cat._id
      ),
      dateDebut: toISOStringFromInput(dateDebut.value),
      dateFin: toISOStringFromInput(dateFin.value),
      lieu,
    }

    await updateEvent(evenement.value._id, payload)
    store.updateEvenementLocal(evenement.value._id, payload)
    await store.refreshEvenement(evenement.value._id)

    Object.assign(evenement.value, {
      dateDebut: dateDebut.value,
      dateFin: dateFin.value,
      lieu,
    })

    modificationEffectuee.value = true
    toast.success('Modifications enregistrées.')
    showConfirmation('✅ Modifications enregistrées.')
  } catch (e) {
    toast.error("Erreur lors de l'enregistrement.")
    console.error(e)
  }
}

const formatDate = (d) => {
  if (!d) return '—'
  try {
    const parsed = new Date(d)
    return isNaN(parsed) ? d : format(parsed, "dd MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return d
  }
}
const showConfirmation = (message, type = 'success') => {
  confirmationMessage.value = message
  confirmationType.value = type
  setTimeout(() => {
    confirmationMessage.value = ''
    confirmationType.value = ''
  }, 3000)
}

onMounted(async () => {
  try {
    const catRes = await getCategories()
    allCategories.value = catRes.data.data || catRes.data
    const id = route.params?.id
    if (!id) {
      error.value = 'ID manquant'
      return
    }
    const res = await getEventById(id, { __noRedirect403: true })
    const ev = res.data?.data || res.data

    // ⚠️ v-model sur <select multiple> → tableau d’IDs requis
    const cats = Array.isArray(ev?.categories)
      ? ev.categories.map((c) => (typeof c === 'string' ? c : c?._id)).filter(Boolean)
      : []
    evenement.value = { ...ev, categories: cats }

    adresseRue.value = evenement.value?.lieu?.rue || ''
    codePostal.value = evenement.value?.lieu?.codePostal || ''
    commune.value = evenement.value?.lieu?.commune || ''

    dateDebut.value = formatDateForInput(ev?.dateDebut) || ''
    dateFin.value = formatDateForInput(ev?.dateFin) || ''
  } catch (e) {
    error.value = "Impossible de charger l'événement."
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Styles supplémentaires si besoin */
</style>
