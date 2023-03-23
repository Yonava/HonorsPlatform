<template>
  <div>
    <div style="font-weight: 900; font-size: 1.25em;">
      {{ item.name || '(No Name)' }}
    </div>
    <div style="font-size: 0.9em;">
      {{ item.phone || '(No Phone Number)' }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>