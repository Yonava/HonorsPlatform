<template>
  <div>
    <h1>Auto Sync: {{ autoSync }}</h1>
    {{ item }}
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  autoSync: {
    type: Boolean,
    required: true
  }
})
</script>