<template>
  <v-sheet class="pa-5">

    <div class="d-flex">
      <h1>
        Add Meeting Note
      </h1>
      <v-spacer></v-spacer>
      <div style="width: 100px">
        <v-text-field
          v-model="userInitials"
          @keydown.enter="focusNotes"
          variant="outlined"
          label="Initials"
          ref="initialsInputRef"
        />
      </div>
    </div>

    <v-textarea
      v-model="note"
      no-resize
      ref="noteInputRef"
      variant="outlined"
      label="Note"
    ></v-textarea>

    <v-btn
      @click="addNote"
      :disabled="!note"
      :color="`${getPanel('STUDENTS').color}-darken-2`"
      block
      class="my-2"
    >
      <v-icon class="mr-2">
        mdi-plus
      </v-icon>
      Add Note
    </v-btn>

  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStorage } from '@vueuse/core';
import { local } from '@locals'
import { getPanel } from '@panels';
import { useUpdateManager } from '@store/useUpdateManager';
import { useDialog } from '@store/useDialog';
import { useInputFocus } from '@composables/useInputFocus';
import { broadcastPropUpdate } from '@utils/socketBroadcastWrappers';
import type { Student } from '@apptypes/sheetItems';

const props = defineProps<{
  student: Student
}>()

const userInitials = useStorage(local.initials, '')
const { trackItemForUpdate } = useUpdateManager()
const broadcast = broadcastPropUpdate(props.student)

const noteInputRef = ref<HTMLElement | null>(null)
const initialsInputRef = ref<HTMLElement | null>(null)

const { focus: focusInitials } = useInputFocus(initialsInputRef)
const { focus: focusNotes } = useInputFocus(noteInputRef)

onMounted(() => userInitials.value ? focusNotes() : focusInitials())

const note = ref('')

const addNote = () => {

  trackItemForUpdate()

  const date = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  })

  const newNote = `${userInitials.value} (${date}): ${note.value}`
  const previousNotes = props.student.note
  props.student.note = previousNotes ? newNote + '\n\n' + previousNotes : newNote

  broadcast('note')
  useDialog().close()
}
</script>