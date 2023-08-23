<template>
  <div
    :style="{
      fontWeight: 900,
      fontSize: '1.5em',
      lineHeight: 1
    }"
  >

    <!-- primary title -->
    <span>

      {{ primaryText }}

      <v-tooltip
        :disabled="smAndDown || !primaryTooltip"
        activator="parent"
        location="bottom"
      >
        {{ primaryTooltip }}
      </v-tooltip>

    </span>

    <!-- secondary text -->
    <span
      class="mr-1"
      style="font-weight: 300; font-size: 0.6em"
    >

      {{ secondaryText }}

      <v-tooltip
        :disabled="smAndDown || !secondaryText"
        activator="parent"
        location="bottom"
      >
        {{ secondaryTooltip }}
      </v-tooltip>

    </span>

  </div>

</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const props = defineProps<{
  primaryText: string
  primaryTooltip?: string
  secondaryText: string
  secondaryTooltip?: string
}>()
</script>