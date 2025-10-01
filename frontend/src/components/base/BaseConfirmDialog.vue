<!-- src/components/base/BaseConfirmDialog.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
      <h2 class="text-lg font-semibold mb-4">{{ title }}</h2>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" @click="$emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button
          class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: 'Êtes-vous sûr ?' },
  confirmLabel: { type: String, default: 'Confirmer' },
  cancelLabel: { type: String, default: 'Annuler' },
})
defineEmits(['confirm', 'cancel'])
</script>
