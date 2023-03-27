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
          <span>{{ item.gradId ? 'Update' : 'Create' }} Event</span>
        </v-sheet>
        <div class="my-5">
          <div class="d-flex flex-row mb-3">
            <v-spacer></v-spacer>
            <v-btn 
              v-if="!item.dateTime"
              @click="item.dateTime = new Date().toLocaleDateString({
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              }) + ' ' + new Date().toLocaleTimeString({
                hour: '2-digit',
                minute: '2-digit',
                second: 'none'
              })"
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
            v-if="item.gradId"
            @click="update"
            color="green"
            filled
          >update</v-btn>
          <v-btn
            v-else
            @click="add"
            color="green"
            filled
          >create</v-btn>
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
import { ref, computed, watch } from 'vue'
import { GradEngagement } from '../SheetTypes'

const props = defineProps<{
  item: GradEngagement,
  show: boolean
}>()

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

watch(() => props.item, () => {
  item.value = clone(props.item)
})

const item = ref<GradEngagement>(clone(props.item))

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
  emits('add', item.value)
  emits('close')
}

const update = () => {
  emits('update', item.value)
  emits('close')
}
</script>