<template>
  <v-sheet class="px-4 py-2">
    <input
      v-model="mailingList.name"
      placeholder="Mailing List Name"
      type="text"
      class="edit-title mt-2"
    />

    <ColorPalette
      v-model="mailingList.color"
      class="mb-3"
    />

    <StudentSearch
      @selected="toggleRecipient($event)"
      :students="students"
      :recipientSysIds="recipientSysIds"
      :color="mailingList.color"
    />

    <RecipientBox
      @remove="toggleRecipient($event)"
      :items="studentsInList"
      :display="student => student.name"
      :color="mailingList.color"
    />

    <v-btn
      @click.stop="close"
      :disabled="!recipientSysIds.size"
      :color="`${mailingList.color}-darken-1`"
      class="my-2"
    >
      Done
    </v-btn>

  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core';
import { useDocumentCache } from '@store/useDocumentCache';
import { useDialog } from '@store/useDialog';
import { localKeys } from '@locals';
import type { MailingList } from './MailingListAudiences';
import RecipientBox from './MailingListRecipientBox.vue';
import StudentSearch from './MailingListStudentSearch.vue';
import ColorPalette from './MailingListColorPalette.vue';

const props = defineProps<{
  mailingListId: string
}>()

const { close } = useDialog()

const allMailingLists = useStorage<MailingList[]>(localKeys.mailingLists, [])

const mailingList = allMailingLists.value.find((list) => list.id === props.mailingListId)

if (!mailingList) {
  throw new Error(`Mailing list with id ${props.mailingListId} not found`)
}

const recipientSysIds = ref(new Set<string>(mailingList.recipientSysIds))

const { Students, Graduates } = useDocumentCache()

const students = computed(() => [
  ...Students.list,
  ...Graduates.list
])

const studentsInList = computed(() => {
  return students.value.filter(s => recipientSysIds.value.has(s.sysId))
})

const toggleRecipient = (student: Record<'sysId', string>) => {
  if (recipientSysIds.value.has(student.sysId)) {
    recipientSysIds.value.delete(student.sysId)
  } else {
    recipientSysIds.value.add(student.sysId)
  }
  mailingList.recipientSysIds = [...recipientSysIds.value]
}
</script>

<style scoped>
.edit-title {
  font-size: 2.5rem;
  font-weight: 900;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
}
</style>