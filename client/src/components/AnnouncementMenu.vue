<template>
  <v-menu v-model="active">
    <template v-slot:activator="{ props }">
      <v-btn 
        v-bind="props"
        icon
        class="ml-3"
      >
        <v-icon>
          mdi-message-alert{{ active ? '' : '-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-list 
      width="600"
      class="pa-3"
    >
      <h2 style="line-height: 0.8">
        Announcements From The Desk of Dr. Matthews:
      </h2>
      <v-list-item
        v-for="announcement in announcements"
        :key="announcement"
        class="announcement pa-3 mt-3"
        :style="{
          background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`
        }"
      >
        {{ announcement }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getEvery } from '../SheetsAPI'

const announcements = ref([])
const active = ref(false)

const fetchAnnouncements = async () => {
  const res = await getEvery('Announcements')
  announcements.value = res.map((row: any) => row[0])
    .filter((row: any) => row)
}

fetchAnnouncements()
</script>

<style scoped>
.announcement {
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 5px;
}
</style>