<template>
  <ModalContent v-model="showDialog">
    <div 
      v-if="item"
      class="d-flex justify-center align-center"
    >
      <v-card
        class="pa-5"
        :width="xs ? '100%' : '400'"
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
              v-if="!item.dateTime"
              @click="item.dateTime = getNewDate()"
              color="purple"
              size="x-small"
            >Now</v-btn>
          </div>
          <div class="d-flex flex-row">
            <v-text-field
              v-model="item.event"
              prepend-inner-icon="mdi-calendar"
              label="Event name"
              variant="outlined"
              class="mr-5"
            ></v-text-field>
            <v-text-field
              v-model="item.dateTime"
              prepend-inner-icon="mdi-clock-outline"
              label="Date/Time"
              variant="outlined"
            ></v-text-field>
          </div>
          <v-textarea
            v-model="item.note"
            no-resize
            label="Note"
            variant="outlined"
          ></v-textarea>
          <v-textarea
            v-model="item.note"
            no-resize
            label="Note"
            variant="outlined"
          ></v-textarea>
          <v-textarea
            v-model="item.note"
            no-resize
            label="Note"
            variant="outlined"
          ></v-textarea>
        </div>
        <v-card-actions class="pa-0">
          <v-btn
            v-if="creating"
            @click="add"
            color="green"
            variant="outlined"
          >create</v-btn>
          <v-btn
            v-else
            @click="update"
            color="green"
            variant="outlined"
          >update</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="close"
            variant="outlined"
            color="red"
          >discard changes</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </ModalContent>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import ModalContent from './ModalContent.vue'
import { GradEngagement } from '../SheetTypes'

const props = defineProps<{
  item: GradEngagement | undefined,
  show: boolean
}>()

const startingItem = ref(null)
const item = ref<GradEngagement>(null)
const { xs } = useDisplay()

const changed = computed(() => {
  return JSON.stringify(item.value) !== JSON.stringify(startingItem.value)
})

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

watch(() => props.item, newVal => {
  if (!newVal) return
  item.value = clone(newVal)
  startingItem.value = clone(newVal)
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