<template>
  <ModalContent v-model="show">
    <v-card elevation="0">
      <div
        @click="show = false"
        class="ma-2"
        style="left: 0; top: 0; position: absolute; cursor: pointer;"
      >
        <v-icon>mdi-close</v-icon>
      </div>
      <v-card-title class="mt-8">
        <strong>
          Add Meeting Note
        </strong>
      </v-card-title>
      <div class="px-4">
        <div v-if="initials">
          <div class="d-flex flex-row">
            <p class="mb-3">
              Initials set as
              <strong>
                {{ initials }}
              </strong>
            </p>
            <v-btn
              @click="initials = ''"
              class="ml-5"
              color="red"
              size="x-small"
            >clear initials</v-btn>
          </div>
          <v-textarea
            v-model="note"
            clearable
            no-resize
            variant="outlined"
            label="Note"
          ></v-textarea>
          <v-btn
            @click="addNote"
            :disabled="!note"
            class="my-2"
            color="blue-darken-2"
            block
          >
            <v-icon class="mr-2">mdi-plus</v-icon>
            Add Note
          </v-btn>
        </div>
        <div 
          v-else
          class="d-flex flex-column mb-4"
        >
          <v-text-field 
            v-model="tempInitials"
            label="Initials"
            variant="outlined"
          ></v-text-field>
          <v-btn 
            @click="setInitials"
            color="blue-darken-2"
          >Set Initials</v-btn>
        </div>
      </div>
    </v-card>
  </ModalContent>
</template>

<script setup lang="ts">
import ModalContent from './ModalContent.vue'
import { useDisplay } from 'vuetify'
import { computed, onMounted, ref } from 'vue' 

const props = defineProps<{
  show: boolean
}>()

const emits = defineEmits([
  'close',
  'success'
])

const show = computed({
  get: () => props.show,
  set: (v) => {
    if (!v) {
      emits('close')
      note.value = ''
    }
  }
})

const { xs } = useDisplay()

const initials = ref('')
const tempInitials = ref('')
const note = ref('')

function setInitials() {
  initials.value = tempInitials.value
  localStorage.setItem('initials', initials.value)
}

function addNote() {
  emits('success', {
    initials: initials.value,
    note: note.value
  })
  show.value = false
}

onMounted(() => {
  initials.value = localStorage.getItem('initials')
})
</script>