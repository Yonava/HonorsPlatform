<template>
  <div
    ref="parentDiv"
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
    <slot
      v-bind="{
        brokenUp: breakup
      }"
    ></slot>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { ref, computed } from 'vue'

const parentDiv = ref<HTMLElement | null>(null)
const { width } = useElementSize(parentDiv)

const props = defineProps<{
  minWidth?: number,
  gap?: string,
}>()

const DEFAULTS = {
  minWidth: 400,
  gap: '20px',
}

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