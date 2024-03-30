<template>
  <v-btn
    :style="styles"
    block
  >
    <v-icon
      v-if="icon"
      :icon="icon"
      size="large"
      class="mr-2"
    ></v-icon>
    <slot><!-- optional fallback --></slot>
  </v-btn>
</template>

<script setup lang="ts">
import type { StyleValue } from "vue"
import { computed } from "vue"

const props = defineProps<{
  icon?: string,
  style?: StyleValue,
}>()

const styles = computed(() => {
  const passedInStyles = props.style ?? {}
  return Object.assign({
    background: 'rgba(0, 0, 0, 0.4)',
    color: 'rgb(240, 240, 240)'
  }, passedInStyles)
})
</script>