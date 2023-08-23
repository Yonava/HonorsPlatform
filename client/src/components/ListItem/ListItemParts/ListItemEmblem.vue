<template>
  <v-sheet
    :color="color"
    :style="{
      height: '25px',
      color: 'white',
      borderRadius: '25px',
      whiteSpace: 'nowrap',
      textTransform: 'capitalize',
    }"
    class="px-3 py-1 d-flex flex-row align-center"
    elevation="1"
  >

    <v-icon
      v-if="icon"
      class="mr-1"
    >
      {{ 'mdi-' + icon }}
    </v-icon>

    {{ text }}

    <v-tooltip
      :disabled="smAndDown || !tooltip"
      activator="parent"
      location="bottom"
    >
      {{ tooltip }}
    </v-tooltip>

  </v-sheet>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const props = defineProps<{
  color: string,
  text: string,
  icon?: string,
  tooltip?: string,
}>()
</script>