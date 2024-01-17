<template>
  <v-btn
    block
    style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
    class="mt-3"
  >
    <v-icon
      :icon="icon"
      size="large"
      class="mr-2"
    ></v-icon>
    <slot><!-- optional fallback --></slot>
  </v-btn>
</template>

<script setup lang="ts">
defineProps<{
  icon: string,
}>()
</script>