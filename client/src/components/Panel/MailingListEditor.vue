<template>
  <v-sheet class="px-4 py-2">
    <h1>
      Edit Mailing List
    </h1>

    <StudentSearch
      @selected="toggleRecipient($event)"
      :students="students"
      :recipientSysIds="recipientSysIds"
    />

    <NameBox
      @remove="toggleRecipient($event)"
      :items="studentsInList"
      :display="student => student.name"
    />

    <div class="d-flex justify-end">
      <v-btn
        :disabled="!recipientSysIds.size"
        color="primary"
        @click="close"
      >
        Done
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDocumentCache } from '../../store/useDocumentCache';
import type { MailingList, Audience } from './MailingListAudiences';
import { useDialog } from '../../store/useDialog';
import { useStorage } from '@vueuse/core';
import { local } from '../../Locals';
import NameBox from './MailingListNameBox.vue';
import StudentSearch from './MailingListStudentSearch.vue';

const props = defineProps<{
  mailingList: MailingList
}>()

const recipientSysIds = ref(new Set<string>(props.mailingList.recipientSysIds))

const { Students, Graduates } = useDocumentCache()

const students = computed(() => [
  ...Students.list,
  ...Graduates.list
])

const studentsInList = computed(() => {
  return students.value.filter(s => recipientSysIds.value.has(s.sysId))
})

const toggleRecipient = (student: { sysId: string }) => {
  if (recipientSysIds.value.has(student.sysId)) {
    recipientSysIds.value.delete(student.sysId)
  } else {
    recipientSysIds.value.add(student.sysId)
  }
}

const close = () => {
  // const mailingLists = useStorage<MailingList[]>(local.mailingLists, [])
  // mailingLists.value.push({
  //   name: 'New Mailing List',
  //   id: Date.now().toString(),
  //   recipientSysIds: [...recipientSysIds.value],
  //   color: 'red'
  // })
  useDialog().close()
}
</script>