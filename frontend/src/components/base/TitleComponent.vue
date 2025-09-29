<!-- src/components/base/TitleComponent.vue -->
<template>
  <div
    class="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-ahmi-bg space-y-4 md:space-y-0"
  >
    <!-- Titre -->
    <div class="text-ahmi-text-primary font-montserrat text-h1 font-bold w-full md:w-auto">
      {{ title }}
    </div>

    <!-- Zone des boutons -->
    <div
      class="relative w-full md:w-auto flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4"
    >
      <!-- Bouton Trier -->
      <div class="relative w-full md:w-auto" ref="dropdownRef">
        <button
          class="w-full md:w-auto flex justify-between md:justify-start items-center space-x-2 text-sm text-ahmi-text-primary font-medium border border-gray-300 px-3 py-2 rounded"
          @click="isDropdownOpen = !isDropdownOpen"
        >
          <SortDescendingIcon class="w-5 h-5" />
          <span>Trier</span>
          <svg
            class="ml-auto md:ml-0 w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-if="isDropdownOpen"
          class="absolute z-10 mt-2 w-full md:w-48 bg-white border border-gray-300 rounded shadow-md"
        >
          <ul class="divide-y divide-gray-100 text-sm">
            <li
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              @click="selectSort('date')"
            >
              📅 Date (récent → ancien)
              <CheckIcon v-if="props.sortType === 'date'" class="w-4 h-4 text-green-600" />
            </li>
            <li
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              @click="selectSort('dayNight')"
            >
              🌞 Jour / 🌙 Nuit
              <CheckIcon v-if="props.sortType === 'dayNight'" class="w-4 h-4 text-green-600" />
            </li>
            <li
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              @click="selectSort('category')"
            >
              📂 Catégorie
              <CheckIcon v-if="props.sortType === 'category'" class="w-4 h-4 text-green-600" />
            </li>
          </ul>
        </div>
      </div>

      <!-- Bouton Filtrer -->
      <BaseButton
        variant="light"
        size="md"
        rounded
        @click="$emit('filter')"
        class="w-full md:w-auto"
      >
        <FilterIcon class="w-6 h-6" />
        <span class="hidden md:inline">Filtrer</span>
      </BaseButton>
      <!-- Sélecteur de catégories -->
      <select
        class="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 w-full md:w-auto"
        @change="$emit('filter-category', $event.target.value)"
      >
        <option value="">Toutes les catégories</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat.nom">
          {{ cat.nom }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SortDescendingIcon, FilterIcon } from '@heroicons/vue/outline'
import BaseButton from '@/components/base/BaseButton.vue'
import { getCategories } from '@/services/eventService'
import { CheckIcon } from '@heroicons/vue/solid'

const props = defineProps({
  title: {
    type: String,
    default: 'Événements à venir',
  },
  sortType: {
    type: String,
    default: 'date',
  },
})

const emit = defineEmits(['change-sort', 'filter', 'filter-category'])

const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

function selectSort(type) {
  isDropdownOpen.value = false
  emit('change-sort', type)
}
const categories = ref([])

onMounted(async () => {
  try {
    // Service typé qui gère la baseURL et les cookies (JWT)
    const res = await getCategories()
    // back peut renvoyer soit {data: [...]}, soit [...]
    categories.value = Array.isArray(res?.data?.data) ? res.data.data : res?.data ?? []
  } catch (e) {
    // Ne pas faire planter l’UI si le catalogue des catégories est indispo
    console.warn('[TitleComponent] Impossible de charger les catégories :', e?.message || e)
    categories.value = []
  }
})

// Fermeture au clic extérieur (manuellement ici)
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
      isDropdownOpen.value = false
    }
  })
})
</script>
