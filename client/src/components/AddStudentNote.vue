<template>
  <ModalContent v-model="show">
    <v-card elevation="0">
      <v-card-title>
        <strong>
          Add Student Note
        </strong>
      </v-card-title>
      <div class="px-4">
        <div v-if="initials">
          <p class="mb-3">
            Initials set as {{ initials }}
          </p>
          <v-textarea
            v-model="note"
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
        <div v-else>
          <input 
            v-model="tempInitials"
            type="text"
            placeholder="Enter Initials"
          >
          <v-btn 
            @click="setInitials"
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
    if (!v) emits('close')
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