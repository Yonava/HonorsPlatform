<template>
  <v-sheet class="pa-5">
    <h1>
      Your Mailing Lists ({{ mailingLists.length }})
    </h1>
    <h3>
      Select a list to begin composing an email
    </h3>
    <v-divider class="my-2"></v-divider>
    <div
      class="d-flex flex-column"
      style="height: 250px; overflow-y: scroll; gap: 5px;"
    >
      <v-sheet
        v-for="list in mailingLists"
        :key="list.id"
        @mouseenter="hoveredMailingListId = list.id"
        @mouseleave="hoveredMailingListId = ''"
        :color="color(list)"
        class="d-flex align-center justify-space-between py-2 px-3"
        style="border-radius: 5px; cursor: pointer;"
      >
        <h3>
          {{ list.name }}
        </h3>
        <h5>
          {{ list.recipientSysIds.length }} Recipients
        </h5>
      </v-sheet>
      <v-sheet
        class="add-list-box d-flex align-center justify-center pa-2"
        style="border-radius: 5px; cursor: pointer; border: 1px dashed #7b7b7b;"
        @click="createList"
      >
        <v-icon color="grey-darken-2">
          mdi-plus
        </v-icon>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentCache } from '../../store/useDocumentCache';
import MailingListBuilder from './MailingListBuilder.vue';
import MailingListEditor from './MailingListEditor.vue';
import type { MailingList } from './MailingListAudiences';
import { useDialog } from '../../store/useDialog';
import { panels } from '../../Panels';
import { local } from '../../Locals';
import { useStorage } from '@vueuse/core';

const { Students, Graduates } = useDocumentCache()

const hoveredMailingListId = ref('')

const color = (list: MailingList) => {
  if (hoveredMailingListId.value === list.id) {
    return list.color + '-darken-2'
  }
  return list.color
}

const studentList = {
  name: 'All Students',
  id: 'default-students',
  recipientSysIds: Students.list.map(s => s.sysId),
  color: panels['STUDENTS'].color
}

const graduateList = {
  name: 'All Graduates',
  id: 'default-graduates',
  recipientSysIds: Graduates.list.map(s => s.sysId),
  color: panels['GRADUATES'].color
}

const storedMailingLists = useStorage(local.mailingLists, [])

const mailingLists = computed(() => {
  return [
    studentList,
    graduateList,
    ...storedMailingLists.value
  ]
})

const createList = () => {
  useDialog().open({
    component: {
      render: MailingListBuilder
    }
  })
}
</script>

<style scoped>
.add-list-box:hover {
  background-color: #d5d5d5;
}
</style>