<template>
  <v-sheet class="pa-5">
    <h1>
      Your Mailing Lists ({{ mailingLists.length }})
    </h1>
    <h3>
      Select a list to view its recipients
    </h3>
    <v-divider class="my-2"></v-divider>
    <div
      class="d-flex flex-column"
      style="height: 300px; overflow-y: scroll; gap: 5px;"
    >
      <v-sheet
        v-for="list in mailingLists"
        :key="list.id"
        @mouseenter="list.color += '-darken-3'"
        @mouseleave="list.color = list.color.replace('-darken-3', '')"
        class="d-flex align-center justify-space-between pa-2"
        style="border-radius: 5px; cursor: pointer;"
        :color="list.color"
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
        @click=""
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
import { panels } from '../../Panels';

type MailingList = {
  name: string
  id: string
  recipientSysIds: string[]
  color: string
}

const { Students, Graduates } = useDocumentCache()

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

const mailingLists = ref<MailingList[]>([studentList, graduateList])
</script>

<style scoped>
.add-list-box:hover {
  background-color: #f5f5f5;
}
</style>