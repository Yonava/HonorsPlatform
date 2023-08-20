<template>
  <div
    ref="parentDiv"
    :class="[
      breakup ? '' : 'd-flex',
      'flex-row'
    ]"
    :style="{
      gap: '20px',
      width: '100%',
    }"
  >
    <slot><!-- optional fallback --></slot>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { ref, computed } from 'vue'

const parentDiv = ref<HTMLElement | null>(null)
const { width } = useElementSize(parentDiv)

const props = defineProps<{
  minWidth?: number,
}>()

const defaultMinWidth = 500

const minWidth = computed(() => {
  return props.minWidth ?? defaultMinWidth
})

const breakup = computed(() => {
  return width.value < minWidth.value
})
</script>