<template>
  <div
    class="d-flex flex-column mt-5"
    style="font-size: 0.9em;"
  >
    <div class="d-flex flex-row">

      <slot name="left">

        <div
          v-if="corners.left"
          class="truncate"
          :style="{
            ...div('left').style,
            maxWidth: `calc(100% - ${rightDivWidth}px)`,
          }"
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
          ref="rightDiv"
          v-if="corners.right"
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
import { computed, ref, onMounted } from 'vue'
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

const rightDiv = ref<HTMLElement | null>(null)
const rightDivWidth = ref<number>(0)

onMounted(() => {
  const minimumLeftRightSeparationPx = 15
  if (!rightDiv.value) {
    return
  }
  rightDivWidth.value = rightDiv.value.clientWidth + minimumLeftRightSeparationPx
})

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
    style: {
      color: corner.error ? 'red' : 'black',
      fontWeight: corner.error ? 'bold' : 'normal',
      whiteSpace: 'nowrap',
    },
  }
}
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>