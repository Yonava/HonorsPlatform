<template>
  <v-menu v-model="active">
    <template v-slot:activator="{ props }">
      <v-btn 
        v-bind="props"
        icon
        class="ml-3"
      >
        <v-badge 
          v-if="!read && announcements.length > 0"
          size="small"
          color="red"
          :content="announcements.length"
        >
          <v-icon>
            mdi-message-alert{{ active ? '' : '-outline' }}
          </v-icon>
        </v-badge>
        <v-icon v-else>
          mdi-message-alert{{ active ? '' : '-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-list 
      width="600"
      class="pa-5"
    >
      <div class="d-flex align-center">
        <v-icon 
          size="x-large"
          class="mr-3"
        >mdi-bullhorn-variant</v-icon>
        <h1 style="line-height: 0.8">
          Dr. Matthews Says...
        </h1>
      </div>
      <div 
        v-if="loading"
        class="d-flex justify-center"
      >
        <v-progress-circular 
          size="32"
          indeterminate
          class="ma-10"
        ></v-progress-circular>
      </div>
      <div 
        v-else-if="announcements.length === 0"
        class="d-flex justify-center"
      >
        <h2 
          class="ma-10"
          style="color: green"
        >
          <v-icon class="mr-1 mb-1">mdi-check</v-icon>
          Nothing at the moment!
        </h2>
      </div>
      <v-list-item
        v-for="announcement in announcements"
        :key="announcement"
        :style="{
          background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`
        }"
        class="announcement pa-3 mt-3"
      >
        {{ announcement }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getEvery, Range } from '../SheetsAPI'

const announcements = ref<string[]>([])
const loading = ref(true)
const active = ref(false)
const read = ref(false)

watch(active, async (val) => {
  if (val) {
    read.value = true
    await fetchAnnouncements()
  }
})

async function fetchAnnouncements() {
  loading.value = true
  announcements.value = []
  const res = await getEvery(Range.ANNOUNCEMENTS)
  announcements.value = res.map(row => row[0])
    .filter(announcement => announcement)
  loading.value = false
}

fetchAnnouncements()
</script>

<style scoped>
.announcement {
  font-size: 1.2rem;
  border-radius: 5px;
}
</style>