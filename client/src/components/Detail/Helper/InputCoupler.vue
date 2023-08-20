<template>
  <div
    ref="parentDiv"
    :class="[
      'd-flex',
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
import { ref } from 'vue'

const parentDiv = ref<HTMLElement | null>(null)
const { width } = useElementSize(parentDiv)
</script>