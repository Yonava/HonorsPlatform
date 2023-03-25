<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.name || '(No Name)' }}
        <span style="font-weight: 300; font-size: 0.6em">
          {{ item.id || '(No ID)' }}
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-sheet 
        class="px-2"
        :color="color"
        elevation="1"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
      >
        {{ item.activeStatus || 'No Status' }}
      </v-sheet>
    </div>
    <div 
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <v-icon 
          class="mr-1"
          style="opacity: 0.75"
        >
          mdi-email
        </v-icon>
        <p>
          {{ item.email || '(No Email)' }} 
        </p>
        <v-spacer></v-spacer>
        <p>
          {{ item.points || 0 }}
        </p>
        <v-icon 
          class="ml-1"
          style="opacity: 0.75"
        >
          mdi-ticket
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const color = computed(() => {
  if (props.item.activeStatus.toLowerCase() === 'active') return 'green'
  if (props.item.activeStatus.toLowerCase() === 'inactive') return 'red'
  return 'grey'
})
</script>