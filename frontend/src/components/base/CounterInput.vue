<!-- src/components/base/CounterInput.vue -->
<template>
  <div class="flex items-center gap-3">
    <BaseButton
      variant="light"
      size="sm"
      :disabled="modelValue <= min"
      @click="decrement"
      aria-label="Réduire"
    >
      −
    </BaseButton>

    <input
      type="number"
      :value="modelValue"
      @input="update($event.target.value)"
      class="w-16 text-center border border-gray-300 rounded py-1"
      :min="min"
      :max="max"
      aria-label="Nombre de places"
    />

    <BaseButton
      variant="light"
      size="sm"
      :disabled="modelValue >= max"
      @click="increment"
      aria-label="Augmenter"
    >
      +
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    default: Infinity,
  },
})

const emit = defineEmits(['update:modelValue'])

const increment = () => {
  if (props.modelValue < props.max) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

const decrement = () => {
  if (props.modelValue > props.min) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

const update = (val) => {
  const parsed = parseInt(val)
  if (!isNaN(parsed)) {
    const safe = Math.max(props.min, Math.min(parsed, props.max))
    emit('update:modelValue', safe)
  }
}
</script>
