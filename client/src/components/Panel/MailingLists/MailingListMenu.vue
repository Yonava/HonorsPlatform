<template>
  <v-sheet class="px-5 py-3">
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
        @click="composeEmail(list)"
        @mouseenter="mouseEnteredList(list)"
        @mouseleave="mouseLeftList"
        :color="color(list)"
        class="d-flex align-center justify-space-between py-2 px-3"
        style="border-radius: 5px; cursor: pointer;"
      >
        <h3>
          {{ list.name || '(Untitled)' }}
        </h3>
        <div class="d-flex align-center">
          <h5>
            {{ numberOfRecipientsText(list) }}
          </h5>
          <div
            v-if="showActions(list)"
            class="d-flex ml-3"
            style="gap: 6px"
          >
            <div v-for="action in actions">
              <v-icon @click.stop="action.onClick(list)">
                {{ action.icon }}
              </v-icon>
              <v-tooltip activator="parent" location="bottom">
                {{ action.tooltip }}
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
import { useStorage } from '@vueuse/core';
import { useDocumentCache } from '@store/useDocumentCache';
import { useDialog } from '@store/useDialog';
import MailingListBuilder from './MailingListBuilder.vue';
import MailingListEditor from './MailingListEditor.vue';
import type { MailingList } from './MailingListAudiences';
import { panels } from '@panels';
import { local } from '@locals';
import { emailValidator } from '../../../EmailUtilities';

const { Students, Graduates } = useDocumentCache()

const hoveredMailingListId = ref('')

const mouseEnteredList = (list: MailingList) => {
  hoveredMailingListId.value = list.id;
}

const mouseLeftList = () => {
  hoveredMailingListId.value = '';
  emailAddressesCopied.value = false
}

const color = (list: MailingList) => {
  if (hoveredMailingListId.value === list.id) {
    return list.color + '-darken-2'
  }
  return list.color
}

const numberOfRecipientsText = (list: MailingList) => {
  const numberOfRecipients = list.recipientSysIds.length
  if (numberOfRecipients === 1) return '1 recipient'
  return `${numberOfRecipients} recipients`
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

const editList = (mailingList: MailingList) => {
  useDialog().open({
    component: {
      render: MailingListEditor,
      props: {
        mailingListId: mailingList.id
      }
    }
  })
}

const copyEmailAddresses = (list: MailingList) => {
  try {
    navigator.clipboard.writeText(emailString(list))
    emailAddressesCopied.value = true
    setTimeout(() => emailAddressesCopied.value = false, 3000)
    useDialog().openSnackbar({
      text: `Copied ${list.recipientSysIds.length} email addresses to clipboard`,
      closable: false
    })
  } catch (e) {
    console.error(e)
    useDialog().openSnackbar({
      text: `Failed to copy email addresses to clipboard`,
      closable: false
    })
  }
}

const emailString = (list: MailingList) => {
  return list.recipientSysIds
    .map(sysId => {
      const student = Students.list.find(s => s.sysId === sysId)
      const graduate = Graduates.list.find(s => s.sysId === sysId)
      return student?.email ?? graduate?.email ?? ''
    })
    .filter(email => !!email)
    .filter(email => emailValidator(email))
    .join(',')
}

const composeEmail = (list: MailingList) => window.open(`mailto:${emailString(list)}`)

const emailAddressesCopied = ref(false)

const actions = ref([
   {
    icon: computed(() => emailAddressesCopied.value ? 'mdi-check' : 'mdi-content-copy'),
    tooltip: 'Copy Email Addresses',
    onClick: copyEmailAddresses
  },
  {
    icon: 'mdi-pencil',
    tooltip: 'Edit',
    onClick: editList
  },
  {
    icon: 'mdi-delete',
    tooltip: 'Delete',
    onClick: deleteList
  },
])
</script>

<style scoped>
.add-list-box:hover {
  background-color: #d5d5d5;
}
</style>./MailingLists/MailingListAudiences