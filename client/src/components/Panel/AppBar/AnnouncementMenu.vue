<template>
  <v-menu
    v-model="open"
    :offset="smAndDown ? [8, 0] : [0, 0]"
  >
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
      style="max-width: 95vw; width: 500px"
      class="pa-3"
    >

      <AnnouncementHeader />

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

      <div
        v-else
        style="max-height: 400px; overflow: auto"
      >

        <div
          v-for="announcement in announcements"
          :key="announcement.sysId"
        >
          <AnnouncementItem :announcement="announcement" />
        </div>

      </div>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useDocumentCache } from '@store/useDocumentCache'
import AnnouncementItem from './AnnouncementItem.vue'
import AnnouncementHeader from './AnnouncementHeader.vue'

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

  // reset badge number if the menu is already open
  if (open.value) {
    badgeNumber.value = 0
  }
}, { deep: true })

const icon = computed(() => {
  const announcementsUnViewed = badgeNumber.value > 0

  const innerIcon = cacheRefreshInProgress.value ? 'processing' : announcementsUnViewed ? 'alert' : 'check'
  const outlined = open.value ? '' : '-outline'

  return `mdi-message-${innerIcon}${outlined}`
})
</script>

<style scoped>
.announcement {
  font-size: 1.2rem;
  border-radius: 20px;
  box-shadow: 5px 1px 5px 0 rgba(0, 0, 0, 0.05);
}
</style>