<template>
  <ModalContent v-model="showDialog">
    <div
      v-if="selectedEvent"
      class="d-flex justify-center align-center"
    >
      <v-card
        class="pa-5"
        :width="xs ? '100%' : '550'"
        elevation="0"
      >
        <v-sheet
          class="py-2 px-4 d-flex align-center"
          color="purple-darken-2"
          style="font-weight: bold; color: white; border-radius: 20px; width: 120%"
        >
          <v-icon class="mr-1">mdi-calendar</v-icon>
          <span>
            {{ bannerText }}
          </span>
        </v-sheet>
        <div class="my-5">
          <div class="d-flex flex-row mb-3">
            <v-spacer></v-spacer>
            <v-btn
              v-if="!selectedEvent.dateTime"
              @click="selectedEvent.dateTime = getNewDate()"
              color="purple"
              size="x-small"
            >Now</v-btn>
          </div>
          <div class="d-flex flex-row">
            <v-text-field
              v-model="selectedEvent.event"
              prepend-inner-icon="mdi-calendar"
              label="Event name"
              variant="outlined"
              class="mr-5"
            ></v-text-field>
            <v-text-field
              v-model="selectedEvent.dateTime"
              prepend-inner-icon="mdi-clock-outline"
              label="Date/Time"
              variant="outlined"
            ></v-text-field>
          </div>
          <v-textarea
            v-model="selectedEvent.note"
            no-resize
            label="Note"
            variant="outlined"
          ></v-textarea>
        </div>
        <v-card-actions class="pa-0">
          <v-btn
            @click="update"
            color="green"
            variant="outlined"
          >{{ newEvent ? 'create' : 'update' }}</v-btn>
          <v-btn
            v-if="xs"
            @click="setSelectedItem(null, eventsPanel)"
            color="red"
            variant="outlined"
          >close</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="setSelectedItem(null, eventsPanel)"
            variant="outlined"
            color="red"
          >discard changes</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </ModalContent>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue'
import { GradEngagement } from '../../../../SheetTypes'
import { panels } from '../../../../Panels'
import { useDocumentCache } from '../../../../store/useDocumentCache'
import { useDisplay } from 'vuetify'
import ModalContent from '../../../ModalContent.vue'

const { "Grad Engagements": gradEngagements, setSelectedItem, updateItem } = useDocumentCache()
const { selected } = toRefs(gradEngagements)

const startingState = ref<GradEngagement>(null)
const selectedEvent = ref<GradEngagement>(null)
const newEvent = ref(false)
const eventsPanel = panels['GRADUATE_ENGAGEMENTS']

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))
const { xs } = useDisplay()

watch(selected, newVal => {
  if (!newVal) return
  item.value = clone(newVal)
  startingItem.value = clone(newVal)
})

const changed = computed(() => {
  return JSON.stringify(item.value) !== JSON.stringify(startingItem.value)
})

const creating = computed(() => !item.value.gradId)
const bannerText = computed(() => creating.value ? 'Create Event' : 'Update Event')

const emits = defineEmits([
  'close',
  'update',
  'add'
])

const showDialog = computed({
  get: () => props.show,
  set: () => emits('close')
})

const close = async () => {
  emits('close')
}

const add = () => {
  if (!changed.value) return close()
  emits('add', item.value)
  close()
}

const update = () => {
  if (!changed.value) return close()
  emits('update', item.value)
  close()
}

function getNewDate() {
  const date = new Date()
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric'
  })
  const day = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  return `${day} at ${time}`
}
</script>