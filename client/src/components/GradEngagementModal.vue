<template>
  <v-dialog v-model="showDialog">
    <div 
      v-if="item"
      class="d-flex justify-center align-center"
    >
      <v-card
        class="module-card pa-5"
        width="500"
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
              label="Event"
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
            label="Note"
            variant="outlined"
          ></v-textarea>
        </div>
        <v-card-actions>
          <v-btn
            v-if="creating"
            @click="add"
            color="green"
            filled
          >create</v-btn>
          <v-btn
            v-else
            @click="update"
            color="green"
            filled
          >update</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="emits('close')"
            color="red"
          >discard changes</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { GradEngagement } from '../SheetTypes'

const props = defineProps<{
  item: GradEngagement | undefined,
  show: boolean
}>()

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

watch(() => props.item, () => {
  const item = ref<GradEngagement | undefined>(props.item)
  if (!item.value) {
    item.value = {
      row: -1,
      gradId: '',
      event: '',
      dateTime: '',
      note: ''
    }
  }
  item.value = clone(props.item)
  startingItem.value = clone(props.item)
})

const startingItem = ref(null)
const item = ref<GradEngagement>(clone(props.item))

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

const add = () => {
  if (JSON.stringify(item.value) === JSON.stringify(startingItem.value)) {
    emits('close')
    return
  }
  emits('add', item.value)
  emits('close')
}

const update = () => {
  if (JSON.stringify(item.value) === JSON.stringify(startingItem.value)) {
    emits('close')
    return
  }
  emits('update', item.value)
  emits('close')
}

function getNewDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const Am_Pm = hour >= 12 ? 'p' : 'a'
  return `${year}/${month}/${day} ${hour}${Am_Pm}`
}
</script>