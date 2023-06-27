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
        <div v-if="!inputInitials">
          <div class="d-flex flex-row">
            <p class="mb-3">
              Initials set as
              <strong>
                {{ initials }}
              </strong>
            </p>
            <v-btn
              @click="clearInitials"
              class="ml-5"
              color="red"
              size="x-small"
            >clear initials</v-btn>
          </div>
          <v-textarea
            v-model="note"
            clearable
            no-resize
            ref="noteBox"
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
            v-model.trim="initials"
            @keyup.enter="setInitials"
            :value="initials ? initials.toUpperCase() : ''"
            clearable
            label="Initials"
            ref="initialsBox"
            variant="outlined"
          ></v-text-field>
          <v-btn
            @click="setInitials"
            :disabled="initials ? initials.length < 2 : true"
            color="blue-darken-2"
          >Set Initials</v-btn>
        </div>
      </div>
    </v-card>
  </ModalContent>
</template>

<script setup lang="ts">
import ModalContent from '../../ModalContent.vue'
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
  get: () => {
    if (props.show) {
      focus()
      if (inputInitials.value) {
        return props.show
      }
      inputInitials.value = !initials.value
    }
    return props.show
  },
  set: (v) => {
    if (!v) {
      emits('close')
      note.value = ''
    }
  }
})

const { xs } = useDisplay()

const inputInitials = ref(false)
const initials = ref('')
const note = ref('')

function setInitials() {
  inputInitials.value = false
  localStorage.setItem('initials', initials.value.toUpperCase())
  focus()
}

function clearInitials() {
  initials.value = ''
  inputInitials.value = true
  localStorage.removeItem('initials')
  focus()
}

const noteBox = ref(null)
const initialsBox = ref(null)
function focus() {
  setTimeout(() => {
    if (noteBox.value) {
      noteBox.value.focus()
    } else if (initialsBox.value) {
      initialsBox.value.focus()
    }
  }, 50)
}

function addNote() {
  emits('success', {
    date: new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }),
    initials: initials.value,
    note: note.value
  })
  show.value = false
}

onMounted(() => {
  initials.value = localStorage.getItem('initials')
})
</script>