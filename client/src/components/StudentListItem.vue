<template>
  <div>
    <div style="font-weight: 900; font-size: 1.25em;">
      {{ rawItem.name || '(No Name)' }}
    </div>
    <div style="font-size: 0.9em;">
      {{ rawItem.id || '(No ID)' }} - 
      {{ rawItem.email || '(No Email)' }} - 
      {{ rawItem.activeStatus || '(No Active Status)' }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRaw } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const rawItem = toRaw(props.item)
</script>