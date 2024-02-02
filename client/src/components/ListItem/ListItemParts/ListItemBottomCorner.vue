<template>
  <div
    class="d-flex flex-column mt-5"
    style="font-size: 0.9em;"
  >
    <div class="d-flex flex-row">

      <slot name="left">

        <div
          v-if="left"
          class="truncate"
          :style="{
            ...errorStyles(left).style,
            maxWidth: `calc(100% - ${rightDivWidth}px)`,
          }"
        >

          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            {{ iconify(left.icon) }}
          </v-icon>

          {{ textify(left.text) }}

          <v-tooltip
            :disabled="smAndDown || !left.tooltip"
            activator="parent"
            location="bottom"
          >
            {{ left.tooltip }}
          </v-tooltip>

        </div>

      </slot>

      <v-spacer></v-spacer>

      <slot name="right">

        <div
          v-if="right"
          ref="rightDiv"
          :style="errorStyles(right).style"
        >

          {{ textify(right.text) }}

          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            {{ iconify(right.icon) }}
          </v-icon>

          <v-tooltip
            :disabled="smAndDown || !right.tooltip"
            activator="parent"
            location="bottom"
          >
            {{ right.tooltip }}
          </v-tooltip>

        </div>

      </slot>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { StyleValue } from 'vue';
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

type CornerData = {
  text: string | number,
  icon: string,
  error?: boolean,
  tooltip?: string,
}

const { left, right } = defineProps<{
  left?: CornerData,
  right?: CornerData,
}>()

const rightDiv = ref<HTMLElement | null>(null)
const rightDivWidth = ref(0)

onMounted(() => {
  const minimumLeftRightSeparationPx = 15
  if (!rightDiv.value) {
    return
  }
  rightDivWidth.value = rightDiv.value.clientWidth + minimumLeftRightSeparationPx
})

const iconify = (icon: string) => {
  if (!icon) {
    return ''
  }

  if (icon.startsWith('mdi-')) {
    return icon
  }

  return `mdi-${icon}`
}

const textify = (text: string | number) => {
  const canParseAsNumber = !isNaN(Number(text))
  return canParseAsNumber ? Number(text).toLocaleString() : text
}

const errorStyles = ({ error }: CornerData) => {
  return {
    style: {
      color: error ? 'red' : 'black',
      fontWeight: error ? 'bold' : 'normal',
      whiteSpace: 'nowrap',
    } satisfies StyleValue,
  }
}
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>