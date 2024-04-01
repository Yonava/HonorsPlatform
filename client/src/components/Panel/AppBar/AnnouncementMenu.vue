<template>
  <v-menu v-model="open">
    <template v-slot:activator="{ props }">
      <div
        v-bind="props"
        @click="badgeNumber = 0"
      >
        <slot
          name="activator"
          v-bind="{ badgeNumber, tooltipText, open }"
        >
          <v-btn icon>
            <v-badge
              v-if="badgeNumber > 0 && !cacheRefreshInProgress"
              :content="badgeNumber"
              size="small"
              color="red"
            >
              <v-icon>
                {{ icon }}
              </v-icon>
            </v-badge>
            <v-icon v-else>
              {{ icon }}
            </v-icon>
            <v-tooltip
              :disabled="smAndDown || open"
              activator="parent"
              location="bottom"
            >
              {{ tooltipText }}
            </v-tooltip>
          </v-btn>
        </slot>
      </div>
    </template>

    <v-list
      style="max-width: 80vw; width: 500px"
      class="pa-5"
    >
      <div
        class="d-flex align-center mb-4"
      >
        <v-icon
          size="x-large"
          class="mr-3"
        >
          mdi-bullhorn-variant
        </v-icon>
        <h1
          style="line-height: 1"
        >
          Announcements
        </h1>
      </div>
      <div
        v-if="cacheRefreshInProgress"
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
          No Active Announcements!
        </h2>
      </div>
      <div style="max-height: 400px; overflow: auto">
        <v-list-item
          v-for="announcement in announcements"
          :key="announcement.content"
          :style="{
            background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
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
              <v-tooltip
                activator="parent"
              >
                {{ fullDateTime(announcement.datePosted) }}
              </v-tooltip>
            </p>
          </div>
        </v-list-item>
      </div>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify'
import { useDocumentCache } from '@store/useDocumentCache'

const { smAndDown } = useDisplay()

const { Announcements, cacheRefreshInProgress } = storeToRefs(useDocumentCache())

const announcements = computed(() => {
  return Announcements.value.sort((a, b) => {
    const dateA = new Date(a.datePosted)
    const dateB = new Date(b.datePosted)

    return dateB.getTime() - dateA.getTime()
  })
})

const badgeNumber = ref(0)
const previousListLength = ref(0)
const open = ref(false)

const tooltipText = computed(() => {
  if (announcements.value.length === 0) {
    return 'No Active Announcements'
  } else if (announcements.value.length === 1) {
    return '1 Active Announcement'
  } else {
    return `${announcements.value.length} Active Announcements`
  }
})

watch(announcements, (newList) => {
  if (newList.length > previousListLength.value) {
    badgeNumber.value += newList.length - previousListLength.value
  }

  previousListLength.value = newList.length
}, { deep: true })

const icon = computed(() => {
  const announcementsUnViewed = badgeNumber.value > 0

  const innerIcon = cacheRefreshInProgress.value ? 'processing' : announcementsUnViewed ? 'alert' : 'check'
  const outlined = open.value ? '' : '-outline'

  return `mdi-message-${innerIcon}${outlined}`
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

const fullDateTime = (date: string) => {
  const datePosted = new Date(date)
  const dateString = datePosted.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const timeString = datePosted.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${dateString} at ${timeString}`
}
</script>

<style scoped>
.announcement {
  font-size: 1.2rem;
  border-radius: 5px;
}
</style>