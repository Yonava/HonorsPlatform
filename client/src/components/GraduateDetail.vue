<template>
  <div>
    <h1>Auto Sync: {{ autoSync }}</h1>
    {{ item }}
    <v-btn @click="$emit('delete')">delete {{ item.name }}</v-btn>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

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

const emits = defineEmits(['delete'])
</script>