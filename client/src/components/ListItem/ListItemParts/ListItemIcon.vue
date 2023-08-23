<template>
  <div>
    <v-icon
      :color="color"
      class="mr-2"
    >
      {{ 'mdi-' + icon }}
    </v-icon>

    <v-tooltip
      :disabled="smAndDown || !tooltip"
      activator="parent"
      location="bottom"
    >
      {{ tooltip }}
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const props = defineProps<{
  icon: string,
  tooltip: string,
  color?: string,
}>()
</script>