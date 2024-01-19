<template>
  <v-sheet class="px-4 py-2">
    <h1>
      Let's Create A New Mailing List
    </h1>
    <v-divider class="my-2"></v-divider>
    <h3>
      Select A Target Audience (optional)
    </h3>
    <div
      class="d-flex pb-4 pt-2"
      style="overflow: auto; gap: 8px"
    >
      <v-btn
        v-for="audience in audiences"
        @click="addAudience(audience)"
        :key="audience.name"
        :color="audience.color + '-darken-2'"
        rounded
      >
        {{ audience.name }}
      </v-btn>
      <h3
        v-if="!audiences.length"
        class="text-red"
      >
        No More Target Audiences
      </h3>
    </div>
    <h3 class="mt-3">
      Search For Specific Students
    </h3>
    <v-text-field
      v-model="search"
      class="mt-2"
      label="Students or Graduates"
      variant="solo"
    ></v-text-field>
    <div
      class="d-flex flex-column mb-4"
      style="height: 200px; overflow: auto; gap: 5px; user-select: none;"
    >
      <v-sheet
        v-for="student in filteredStudents"
        @click="toggleRecipient(student)"
        @mouseenter="hoveredStudentSysId = student.sysId"
        @mouseleave="hoveredStudentSysId = ''"
        :key="student.sysId"
        :color="color(student)"
        class="d-flex align-center justify-space-between py-2 px-3 student-list-item"
        style="border-radius: 5px; cursor: pointer;"
      >
        <h3>
          {{ student.name || '(No Name)' }}
          <span style="font-size: 0.75rem">
            ({{ student.id || 'No ID' }})
          </span>
        </h3>
        <h5>
          {{ student.email || 'No Email' }}
        </h5>
      </v-sheet>
      <h3
        v-if="!filteredStudents.length"
        class="text-red"
      >
        Cannot Find A Match For Your Search "{{ search }}"
      </h3>
    </div>
    <v-sheet
      class="d-flex flex-wrap align-content-start pa-2 mb-4"
      style="gap: 7px; height: 200px; overflow: auto; border-radius: 10px;"
      color="grey-lighten-3"
    >
      <div v-for="student in studentsInList">
        <v-sheet
          class="pa-1 pl-3"
          color="blue-darken-1"
          style="border-radius: 50px"
        >
          <span class="mr-2" style="font-weight: 600">
            {{ student.name }}
          </span>
          <v-icon @click="toggleRecipient(student)">
            mdi-close-circle
          </v-icon>
        </v-sheet>
      </div>
    </v-sheet>
    <div class="d-flex justify-end">
      <v-btn
        :disabled="!recipientSysIds.size"
        color="primary"
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
import { filterItems } from '../../FilterObjects';
import { getMailingListAudiences } from './MailingListAudiences';
import type { MailingList, Audience } from './MailingListAudiences';
import { useDialog } from '../../store/useDialog';
import { useStorage } from '@vueuse/core';
import { local } from '../../Locals';

const recipientSysIds = ref(new Set<string>())
const hoveredStudentSysId = ref('')
const search = ref('')

const selectedAudiences = ref(new Set<string>())
const audiences = computed(() => getMailingListAudiences().filter(a => !selectedAudiences.value.has(a.name)))

const addAudience = (audience: Audience) => {
  selectedAudiences.value.add(audience.name)
  audience.recipientSysIds.forEach(sysId => recipientSysIds.value.add(sysId))
}

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

const color = <T extends { sysId: string }>(student: T) => {
  if (recipientSysIds.value.has(student.sysId) && hoveredStudentSysId.value == student.sysId) {
    return 'blue-darken-2'
  } else if (recipientSysIds.value.has(student.sysId)) {
    return 'blue-darken-1'
  } else if (hoveredStudentSysId.value == student.sysId) {
    return 'grey-lighten-1'
  } else {
    return 'grey-lighten-2'
  }
}

const filteredStudents = computed(() => filterItems(students.value, search.value))

const createListBtnText = computed(() => {
  if (recipientSysIds.value.size == 1) {
    return `Create Mailing List (${recipientSysIds.value.size} Recipient)`
  }
  return `Create Mailing List (${recipientSysIds.value.size} Recipients)`
})

const createList = () => {
  const mailingLists = useStorage<MailingList[]>(local.mailingLists, [])
  mailingLists.value.push({
    name: 'New Mailing List',
    id: Date.now().toString(),
    recipientSysIds: [...recipientSysIds.value],
    color: 'red'
  })
  useDialog().close()
}
</script>