<template>
  <v-sheet class="pa-5">

    <input
      v-model="userInitials"
      ref="initialsInputRef"
    />

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
      block
      class="my-2"
      :color="`${getPanel('STUDENTS').color}-darken-2`"
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
import { useInputFocus } from '@composables/useInputFocus';
import { broadcastPropUpdate } from '@utils/socketBroadcastWrappers';
import type { Student } from '../../../SheetTypes';

const props = defineProps<{
  student: Student
}>()

const userInitials = useStorage(local.initials, '')

const noteInputRef = ref(null)
const initialsInputRef = ref(null)

const { focus: focusInitials } = useInputFocus(initialsInputRef)
const { focus: focusNotes } = useInputFocus(noteInputRef)

onMounted(() => userInitials.value ? focusNotes() : focusInitials())

const note = ref('')

const addNote = () => {
  const { trackItemForUpdate } = useUpdateManager()
  trackItemForUpdate()

  const date = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  })

  const noteString = `${userInitials.value} (${date}): ${note.value}`

  props.student.note = noteString + '\n\n' + props.student.note

  const broadcast = broadcastPropUpdate(props.student)
  broadcast('note')
}
</script>