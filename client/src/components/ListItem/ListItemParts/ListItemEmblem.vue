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
    class="px-2"
    elevation="1"
  >

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
  tooltip?: string,
}>()
</script>