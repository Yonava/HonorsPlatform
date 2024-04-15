<template>
  <p
    style="font-size: 0.8rem; position: absolute; top: 5px; right: 10px; cursor: default;"
    class="ma-3"
  >
    {{ postDateDisplay }}
    <v-tooltip
      activator="parent"
    >
      {{ fullDateTime }}
    </v-tooltip>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  date: string
}>()

const postDateDisplay = useTimeAgo(props.date)

const fullDateTime = computed(() => {
  const datePosted = new Date(props.date)
  const dateString = datePosted.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const timeString = datePosted.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${dateString} at ${timeString}`
})
</script>