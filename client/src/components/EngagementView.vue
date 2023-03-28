<template>
  <div>
    <div 
      v-for="evt in engagements" 
      :key="evt.id" 
      @click="select(evt)"
    >
      <v-sheet
        color="purple-darken-2"
        class="pa-2 mb-2"
        style="cursor: pointer; border-radius: 5px"
        elevation="5"
      >
        <strong v-if="evt.event">Event: </strong>{{ evt.event }}
        <v-spacer></v-spacer>
        <strong v-if="evt.dateTime">Date/Time: </strong>{{ evt.dateTime }}
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