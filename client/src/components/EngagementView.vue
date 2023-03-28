<template>
  <div>
    <div 
      v-for="event in engagements" 
      :key="event.id" 
      @click="select(event)"
    >
      <v-sheet
        color="purple-darken-2"
        class="pa-2 mb-2"
        style="cursor: pointer; border-radius: 5px"
        elevation="5"
      >
        <strong v-if="event.event">Event: </strong>{{ event.event }}
        <v-spacer></v-spacer>
        <strong v-if="event.dateTime">Date/Time: </strong>{{ event.dateTime }}
      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GradEngagement } from "../SheetTypes"

const props = defineProps<{
  engagements: GradEngagement[];
}>();

const emits = defineEmits(['selected-engagement']);
const select = (event: GradEngagement) => emits('selected-engagement', event);
</script>