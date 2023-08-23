<template>
  <div
    class="d-flex flex-column mt-5"
    style="font-size: 0.9em;"
  >
    <div class="d-flex flex-row">

      <slot name="left">

        <div
          v-if="corners.left"
          :class="div('left').class"
          :style="div('left').style"
        >

          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            {{ iconify(corners.left.icon) }}
          </v-icon>

          {{ corners.left.text }}

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
          :class="div('right').class"
          :style="div('right').style"
        >

          {{ corners.right.text }}

          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            {{ iconify(corners.right.icon) }}
          </v-icon>

          <v-tooltip
            :disabled="smAndDown || !corners.right.tooltip"
            activator="parent"
            location="bottom"
          >
            {{ corners.right.tooltip }}
          </v-tooltip>

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

const iconify = (icon: string) => {
  if (icon.startsWith('mdi-')) {
    return icon
  }
  return `mdi-${icon}`
}

const div = (side: 'left' | 'right') => {
  const corner = corners.value[side]
  return {
    class: [
      'd-flex',
      'flex-row',
    ],
    style: {
      color: corner.error ? 'red' : 'black',
      fontWeight: corner.error ? 'bold' : 'normal',
    },
  }
}
</script>