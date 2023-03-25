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
        v-if="item.activeStatus"
        class="ml-1 px-2"
        :color="item.activeStatus === 'Active' ? 'green' : 'red'"
        elevation="1"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
        }"
      >
        {{ item.activeStatus }}
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
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>