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
        <div class="d-flex">
          <h5>
            {{ list.recipientSysIds.length }} Recipients
          </h5>
          <div
            v-if="showActions(list)"
            class="d-flex ml-3"
            style="width: 50px; gap: 6px"
          >
            <div>
              <v-icon
                @click.stop="editList(list)"
              >
                mdi-pencil
              </v-icon>
              <v-tooltip activator="parent" location="bottom">
                Edit {{ list.name }}
              </v-tooltip>
            </div>
            <div>
              <v-icon
                @click.stop="deleteList(list)"
              >
                mdi-delete
              </v-icon>
              <v-tooltip activator="parent" location="bottom">
                Delete {{ list.name }}
              </v-tooltip>
            </div>
          </div>
        </div>
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

const defaultLists = [
  {
    name: 'All Students',
    id: 'default-students',
    recipientSysIds: Students.list.map(s => s.sysId),
    color: panels['STUDENTS'].color
  },
  {
    name: 'All Graduates',
    id: 'default-graduates',
    recipientSysIds: Graduates.list.map(s => s.sysId),
    color: panels['GRADUATES'].color
  }
] satisfies MailingList[]

const showActions = (list: MailingList) => {
  const isDefaultList = defaultLists.find(l => l.id === list.id)
  return isDefaultList ? false : hoveredMailingListId.value === list.id
}

const storedMailingLists = useStorage<MailingList[]>(local.mailingLists, [])

const mailingLists = computed(() => {
  return [
    ...defaultLists,
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

const deleteList = (list: MailingList) => {
  const index = storedMailingLists.value.findIndex(l => l.id === list.id)
  storedMailingLists.value.splice(index, 1)
  useDialog().openSnackbar({
    text: `Deleted ${list.name}`,
    closable: false,
    action: {
      text: 'Undo',
      onClick: () => {
        storedMailingLists.value.splice(index, 0, list)
      }
    }
  })
}
</script>

<style scoped>
.add-list-box:hover {
  background-color: #d5d5d5;
}
</style>