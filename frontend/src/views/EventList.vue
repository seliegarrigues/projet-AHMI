<!-- src/views/EventList.vue -->
<template>
  <MainLayout>
    <!-- Barre de recherche -->
    <SearchBarComponent @update:search="updateSearch" />

    <!-- Titre avec options de tri et filtre -->
    <TitleComponent
      title="Liste des événements"
      :sort-type="sortType"
      @change-sort="changeSort"
      @filter="openFilterModal"
      @filter-category="(cat) => (selectedCategory.value = cat)"
    />

    <!-- Indicateur de chargement -->
    <output v-if="loading" class="text-center py-4">Chargement des événements...</output>

    <!-- Liste des événements -->
    <section
      v-else
      aria-label="Liste des événements approuvés"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 max-w-screen-xl mx-auto"
    >
      <div v-for="event in filteredEvenements" :key="event._id">
        <CardComponent :evenement="event" />
      </div>
    </section>

    <!-- Aucun événement -->
    <div
      v-if="filteredEvenements.length === 0"
      class="text-center mt-4 text-ahmi-text-secondary"
      role="alert"
    >
      Aucun événement appouvé trouvé.
    </div>

    <!-- Résumé du nombre -->
    <div
      v-if="filteredEvenements.length > 0"
      class="text-center text-sm text-gray-500 mt-2"
      aria-live="polite"
    >
      {{ filteredEvenements.length }} évènement(s) trouvé(s)
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useEvenementsStore } from '@/stores/evenements'
import CardComponent from '@/components/base/CardComponent.vue'
import MainLayout from '@/layout/MainLayout.vue'
import SearchBarComponent from '@/components/base/SearchBarComponent.vue'
import TitleComponent from '@/components/base/TitleComponent.vue'

// Store Pinia
const store = useEvenementsStore()

// Données réactives
const loading = ref(true)
const searchQuery = ref('')
const sortAsc = ref(false)
const filterCriteria = ref({ date: null, lieu: '' })
const sortType = ref('date') // valeurs possibles : "date", "dayNight", "category"
const selectedCategory = ref('')

// Simulation dev (désactive si auth présente)

const isDev = true

// Liste brute des événements (filtrés selon statut si non admin)
const evenements = computed(() =>
  isDev ? store.allEvenements : store.allEvenements.filter((e) => e.statut === 'approuve')
)
console.info('Événements (bruts) :', evenements.value)
// Récupération initiale
onMounted(async () => {
  await store.fetchEvenements()
  console.info('Événements à afficher :', filteredEvenements.value)

  loading.value = false
})

const evenementsApprouves = computed(() => store.evenementsApprouvesValides)
console.info('Événements approuvés :', evenementsApprouves.value)
// Liste finale filtrée et triée

const filteredEvenements = computed(() => {
  let filtered = evenementsApprouves.value

  // 🔍 Filtre par catégorie sélectionnée
  if (selectedCategory.value) {
    filtered = filtered.filter(
      (e) => (e.categorie || '').toLowerCase() === selectedCategory.value.toLowerCase()
    )
  }

  // 🔎 Recherche textuelle
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter((e) =>
      [e?.titre, e?.description, e?.lieu?.adresse].some((f) => (f || '').toLowerCase().includes(q))
    )
  }

  // 📆 Filtre par date
  if (filterCriteria.value.date) {
    filtered = filtered.filter(
      (e) =>
        new Date(e.dateDebut).toDateString() === new Date(filterCriteria.value.date).toDateString()
    )
  }

  // 📍 Filtre par lieu
  if (filterCriteria.value.lieu) {
    filtered = filtered.filter((e) =>
      e?.lieu?.adresse?.toLowerCase().includes(filterCriteria.value.lieu.toLowerCase())
    )
  }

  // 🔀 Tri dynamique
  if (sortType.value === 'date') {
    return filtered.sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))
  }

  if (sortType.value === 'dayNight') {
    return filtered.sort((a, b) => {
      const heureA = new Date(a.dateDebut).getHours()
      const heureB = new Date(b.dateDebut).getHours()
      const isJour = (h) => h >= 8 && h < 19
      return isJour(heureB) - isJour(heureA)
    })
  }

  if (sortType.value === 'category') {
    return filtered.sort((a, b) => {
      const catA = a.categorie?.toLowerCase() || ''
      const catB = b.categorie?.toLowerCase() || ''
      return catA.localeCompare(catB)
    })
  }

  return filtered.sort((a, b) => {
    const dateA = new Date(a.dateDebut)
    const dateB = new Date(b.dateDebut)
    return sortAsc.value ? dateA - dateB : dateB - dateA
  })
})

// Méthodes d’interaction
function updateSearch(query) {
  searchQuery.value = query
}
// eslint-disable-next-line no-unused-vars
function toggleSortOrder() {
  sortAsc.value = !sortAsc.value
}

function openFilterModal() {
  const date = prompt('Filtrer par date (AAAA-MM-JJ) :')
  const lieu = prompt('Filtrer par lieu :')
  filterCriteria.value = { date, lieu }
}

function changeSort(type) {
  sortType.value = type
}
</script>
