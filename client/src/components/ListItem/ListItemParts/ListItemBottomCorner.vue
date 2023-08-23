<template>
  <div
    class="d-flex flex-column mt-5"
    style="font-size: 0.9em;"
  >
    <div class="d-flex flex-row">

      <slot name="left">

        <div
          v-if="corners.left"
          class="d-flex flex-row"
        >

          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            {{ corners.left.icon }}
          </v-icon>

          <p
            :style="{
              color: corners.left.error ? 'red' : 'black',
              fontWeight: corners.left.error ? 'bold' : 'normal',
            }"
          >
            {{ corners.left.text }}
          </p>

          <v-tooltip
            :disabled="smAndDown || !corners.left.tooltip"
            activator="parent"
            location="bottom"
          >
            {{ corners.left.tooltip }}
          </v-tooltip>

        </div>

      </slot>

      <v-spacer></v-spacer>

      <slot name="right">

        <div
          v-if="corners.right"
          class="d-flex flex-row"
        >

          <p
            :style="{
              color: corners.right.error ? 'red' : 'black',
              fontWeight: corners.right.error ? 'bold' : 'normal',
            }"
          >
            {{ corners.right.text }}
          </p>

          <v-tooltip
            :disabled="smAndDown || !corners.right.tooltip"
            activator="parent"
            location="bottom"
          >
            {{ corners.right.tooltip }}
          </v-tooltip>

          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            {{ corners.right.icon }}
          </v-icon>

        </div>

      </slot>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

type CornerData = {
  text: string,
  icon: string,
  error?: boolean,
  tooltip?: string,
}

const props = defineProps<{
  data?: [CornerData] | [CornerData, CornerData],
}>()

const corners = computed(() => {
  const [left, right] = props.data ?? []
  return {
    left,
    right,
  }
})
</script>