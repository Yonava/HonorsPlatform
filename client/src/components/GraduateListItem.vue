<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.name || '(No Name)' }}
        <span style="font-weight: 300; font-size: 0.6em">
          {{ item.id || '(No ID)' }}
        </span>
      </div>
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
          {{ item.phone || '(No Phone)' }}
        </p>
        <v-icon 
          class="ml-1"
          style="opacity: 0.75"
        >
          mdi-phone
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Graduate } from '../SheetTypes'

const props = defineProps<{
  item: Graduate
}>()
</script>