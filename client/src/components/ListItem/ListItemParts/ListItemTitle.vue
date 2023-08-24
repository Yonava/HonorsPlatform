<template>
  <div
    :style="{
      fontWeight: 900,
      fontSize: '1.5em',
      lineHeight: 1,
    }"
    class="truncate mr-3"
  >

    <!-- primary title -->
    <span
      :style="{
        color: primary.error ? 'red' : 'black',
        whitespace: 'nowrap'
      }"
    >

      {{ primary.text }}

      <v-tooltip
        :disabled="smAndDown || !primary.tooltip"
        activator="parent"
        location="bottom"
      >
        {{ primary.tooltip }}
      </v-tooltip>

    </span>

    <!-- secondary text -->
    <span
      v-if="secondary"
      class="mr-1"
      :style="{
        fontWeight: secondary.error ? 900 : 300,
        fontSize: '0.6em',
        color: secondary.error ? 'red' : 'black'
      }"
    >

      {{ secondary.text }}

      <v-tooltip
        :disabled="smAndDown || !secondary.text"
        activator="parent"
        location="bottom"
      >
        {{ secondary.tooltip }}
      </v-tooltip>

    </span>

  </div>

</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const props = defineProps<{
  primary: {
    text: string,
    tooltip?: string,
    error?: boolean
  },
  secondary?: {
    text: string,
    tooltip?: string,
    error?: boolean
  }
}>()
</script>

<style scoped>

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 300;
}

</style>