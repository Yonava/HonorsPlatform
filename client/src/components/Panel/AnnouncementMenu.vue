<template>
  <v-menu v-model="active">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
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
        <v-tooltip
          :disabled="smAndDown || active"
          activator="parent"
          location="bottom"
        >{{ tooltipText }}</v-tooltip>
      </v-btn>
    </template>

    <v-list
      style="max-width: 80vw; width: 500px"
      class="pa-5"
    >
      <div class="d-flex align-center">
        <v-icon
          size="x-large"
          class="mr-3"
        >
          mdi-bullhorn-variant
        </v-icon>
        <h1 style="line-height: 1">
          Message Board
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
          <v-icon class="mr-1 mb-1">
            mdi-check
          </v-icon>
          No New Messages!
        </h2>
      </div>
      <v-list-item
        v-for="announcement in announcements"
        :key="announcement.content"
        :style="{
          background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`
        }"
        class="announcement pa-3 mt-3"
      >
        <div
          class="d-flex flex-row"
          style="gap: 12px;"
        >
          <img
            style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%"
            :src="announcement.posterPhoto"
            alt="Poster Photo"
          >

          <div>
            <h4>
              {{ announcement.posterName }}
            </h4>
            <p>
              {{ announcement.content }}
            </p>
          </div>
          <v-spacer></v-spacer>
          <p
            style="font-size: 0.8rem; position: absolute; top: 5px; right: 10px;"
            class="ma-3"
          >
            {{ daysAgo(announcement.datePosted) }}
          </p>
        </div>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndDown } = useDisplay()

const announcements = ref<{
  posterName: string,
  posterPhoto: string,
  content: string,
  datePosted: string
}[]>([])
const loading = ref(true)
const active = ref(false)
const read = ref(false)

watch(active, async (val) => {
  if (val) {
    read.value = true
  }
})

onMounted(async () => {
  loading.value = true
  if (useDocumentCache().cacheRefreshInProgress) {
    await useDocumentCache().cacheRefreshInProgress
  } else {
    read.value = true
  }
  announcements.value = useDocumentCache().Announcements.map(row => {
    return {
      content: row[0],
      posterName: row[1],
      posterPhoto: row[2],
      datePosted: row[3]
    }
  })
    .filter(announcement => announcement.content)
  loading.value = false
})

const tooltipText = computed(() => {
  if (announcements.value.length && !read.value) {
    return `Unread Announcements (${announcements.value.length})`
  } else {
    return 'No New Announcements'
  }
})

const daysAgo = (date: string) => {
  const today = new Date()
  const datePosted = new Date(date)
  const diff = today.getTime() - datePosted.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else {
    return `${days} days ago`
  }
}
</script>

<style scoped>
.announcement {
  font-size: 1.2rem;
  border-radius: 5px;
}
</style>