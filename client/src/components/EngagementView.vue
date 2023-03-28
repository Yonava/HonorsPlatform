<template>
  <div>
    <div class="d-flex flex-row justify-space-between align-center">
      <h1 class="mb-2">Engagement Tracking</h1>
      <v-btn @click="addEventButton" color="green" size="small">
        <v-icon class="mr-2" size="x-large">mdi-plus</v-icon>
        Add Event
      </v-btn>
    </div>
    <div style="height: 350px; overflow: auto">
      <div v-for="event in engagements" :key="event.id" @click="openModal(event)">
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
      <div
        v-if="loadingEngagements"
        class="d-flex flex-row justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="purple-darken-2"
        ></v-progress-circular>
      </div>
      <div
        v-else-if="engagements.length === 0"
        style="font-weight: 200; color: red; font-size: 25px"
      >
        No events yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>