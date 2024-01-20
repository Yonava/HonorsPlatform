<template>
  <v-sheet class="px-4 py-2">
    <input
      v-model="name"
      placeholder="Mailing List Name"
      type="text"
      class="edit-title"
    />

    <h3>
      Add Students By Group
      <InfoBtn>
        Automatically include all students that meet the criteria of a group.
      </InfoBtn>
    </h3>

    <Audiences
      @selected="audienceSelected($event)"
      class="mb-4"
    />

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

    <div class="d-flex justify-end my-2">
      <v-btn
        :disabled="!recipientSysIds.size"
        color="blue-darken-1"
        @click="createList"
      >
        {{ createListBtnText }}
        <v-icon class="ml-2">mdi-arrow-right</v-icon>
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
import Audiences from './MailingListAudiences.vue';
import InfoBtn from './InfoBtn.vue';

const recipientSysIds = ref(new Set<string>())
const name = ref('')

const { Students, Graduates } = useDocumentCache()

const students = computed(() => [
  ...Students.list,
  ...Graduates.list
])

const studentsInList = computed(() => {
  return students.value.filter(s => recipientSysIds.value.has(s.sysId))
})

const audienceSelected = (audience: Audience) => {
  audience.recipientSysIds.forEach(sysId => recipientSysIds.value.add(sysId))
}

const toggleRecipient = (student: { sysId: string }) => {
  if (recipientSysIds.value.has(student.sysId)) {
    recipientSysIds.value.delete(student.sysId)
  } else {
    recipientSysIds.value.add(student.sysId)
  }
}

const createListBtnText = computed(() => {
  if (recipientSysIds.value.size == 1) {
    return `Create Mailing List (${recipientSysIds.value.size} Recipient)`
  }
  return `Create Mailing List (${recipientSysIds.value.size} Recipients)`
})

const createList = () => {
  const mailingLists = useStorage<MailingList[]>(local.mailingLists, [])
  mailingLists.value.push({
    name: name.value,
    id: Date.now().toString(),
    recipientSysIds: [...recipientSysIds.value],
    color: 'red'
  })
  useDialog().close()
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