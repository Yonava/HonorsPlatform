<template>
  <div
    ref="wrapper"
    :class="[
      'd-flex',
      breakup ? 'flex-column' : 'flex-row',
    ]"
    :style="{
      gap: breakup ? '' : gap,
      width: '100%',
      justifyContent: 'space-between',
      alignItems: breakup ? '' : 'end'
    }"
  >
    <slot v-bind="{ brokenUp: breakup }"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useElementSize } from '@vueuse/core'

const props = defineProps<{
  minWidth?: number,
  gap?: string,
}>()

const wrapper = ref()
const { width } = useElementSize(wrapper)

const DEFAULTS = {
  minWidth: 400,
  gap: '20px',
} as const

const minWidth = computed(() => {
  return props.minWidth ?? DEFAULTS.minWidth
})

const gap = computed(() => {
  return props.gap ?? DEFAULTS.gap
})

const breakup = computed(() => {
  return width.value < minWidth.value
})
</script>