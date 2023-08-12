<template>
  <DetailFrame
    v-model="thesis.note"
    @user-input="broadcastThroughSocket('note')"
    :item="thesis"
  >
    <template #main>
      <DetailHeader
        v-model="thesis.title"
        @input="broadcastThroughSocket('title')"
        :item="thesis"
        :placeholder="`${getActivePanel.title.singular} Title`"
      >
        <LinkStudentButton
          @update="broadcastThroughSocket('studentSysId')"
          :item="thesis"
        />
      </DetailHeader>

      <v-btn
        v-if="!thesis.term"
        @click="
          thesis.term = getCurrentTerm();
          broadcastThroughSocket('term');
        "
        :color="getActivePanel.color"
        class="mb-2"
        size="x-small"
      >
        Current Term
      </v-btn>

      <v-text-field
        v-model="thesis.term"
        @input="broadcastThroughSocket('term')"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        label="Term"
        prepend-icon="mdi-calendar"
      ></v-text-field>

      <div class="mb-2 d-flex flex-row ">
        <v-btn
          v-if="!thesis.draftReceived"
          @click="
            thesis.draftReceived = new Date().toLocaleString('en-US').split(',')[0];
            broadcastThroughSocket('draftReceived');
          "
          :color="getActivePanel.color"
          size="x-small"
        >
          Today
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!thesis.proposalReceived"
          @click="
            thesis.proposalReceived = new Date().toLocaleString('en-US').split(',')[0];
            broadcastThroughSocket('proposalReceived');
          "
          :color="getActivePanel.color"
          size="x-small"
        >
          Today
        </v-btn>
      </div>

      <div class="d-flex flex-row">

        <v-text-field
          v-model="thesis.draftReceived"
          @input="broadcastThroughSocket('draftReceived')"
          label="Draft Received"
          prepend-icon="mdi-calendar-check"
          class="mr-6"
        ></v-text-field>

        <v-text-field
          v-model="thesis.proposalReceived"
          @input="broadcastThroughSocket('proposalReceived')"
          label="Proposal Received"
          prepend-icon="mdi-calendar-check"
        ></v-text-field>

      </div>

      <v-select
        v-model="thesis.decision"
        @update:model-value="broadcastThroughSocket('decision')"
        :items="Object.keys(approvalStates)"
        :prepend-icon="approvalStates[thesis.decision]"
        label="Decision"
      ></v-select>

      <div class="d-flex flex-row">
        <InstructorComplete
          @update="thesis.mentor = $event; thesis.mentorEmail = getFacultyEmail($event)"
          :instructor="thesis.mentor"
          :color="getActivePanel.color"
        />
        <v-spacer></v-spacer>
        <v-btn
          v-if="thesis.mentor && !thesis.mentorEmail"
          @click="thesis.mentorEmail = getFacultyEmail(thesis.mentor)"
          :color="getActivePanel.color"
          size="x-small"
          class="mb-2"
        >New Faculty Email</v-btn>
      </div>
      <div class="d-flex flex-row align-center justify-center">
        <v-text-field
          v-model="thesis.mentor"
          prepend-icon="mdi-human-male-board"
          label="Faculty Mentor"
          class="mr-6"
          style="width: 45%"
        ></v-text-field>
        <v-text-field
          v-model="thesis.mentorEmail"
          :rules="[(v) => emailValidator(v) || 'Invalid email address']"
          prepend-icon="mdi-email"
          label="Faculty Mentor Email"
          style="width: 45%"
        ></v-text-field>
      </div>
    </template>
    <template #buttons>
      <v-btn
        @click="viewProfileButton.onClick()"
        :color="viewProfileButton.color"
        size="large"
      >
        <v-icon
          class="mr-4"
          size="x-large"
        >
          {{ viewProfileButton.icon }}
        </v-icon>
        {{ viewProfileButton.text }}
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import LinkStudent from './Helper/LinkStudent.vue'

import { computed } from 'vue'
import { useStudentMatcher } from '../../StudentMatcher'
import type { Thesis } from '../../SheetTypes'
import { getPanel } from '../../Panels'
import { getCurrentTerm, termValidator } from '../../TermValidator'
import {
  emailValidator,
  getFacultyEmail,
} from '../../EmailUtilities'

import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDialog } from '../../store/useDialog'
import { useUpdateItem } from '../../TrackItemForUpdate'
const { setPanel, getActivePanel } = useSheetManager()
const { deleteItem } = useDocumentCache()

const props = defineProps<{
  item: Thesis
}>()

const approvalStates = {
  'Approved': 'mdi-check-circle',
  'Rejected': 'mdi-close-circle',
  'Pending': 'mdi-alert-circle',
}

const thesis = computed(() => props.item)

const { broadcastThroughSocket } = useUpdateItem(thesis)

const student = computed(() => {
  const { studentMatch } = useStudentMatcher(thesis.value.studentSysId)
  return studentMatch.value
})

const studentPanel = getPanel('STUDENTS')
const graduatePanel = getPanel('GRADUATES')

const jumpTo = (panelName: 'STUDENTS' | 'GRADUATES') => {
  setPanel(panelName, {
    value: thesis.value.studentSysId
  })
}

const viewProfileButton = computed(() => {
  if (student.value.error === 'NOT_LINKED') {
    return {
      text: `No ${studentPanel.title.singular} Linked`,
      color: 'red-darken-4',
      icon: 'mdi-account-off',
      onClick: () => {
        const { open, close } = useDialog()
        open({
          body: {
            title: `No ${studentPanel.title.singular} Linked`,
            description: `This ${getActivePanel.title.singular.toLowerCase()} is not linked to a ${studentPanel.title.singular.toLowerCase()}. Link a ${studentPanel.title.singular.toLowerCase()} or delete.`,
            buttons: [
              {
                text: `Link ${studentPanel.title.singular}`,
                color: studentPanel.color,
                onClick: () => {
                  open({
                    component: {
                      render: LinkStudent,
                      props: {
                        onUpdate: () => broadcastThroughSocket('studentSysId')
                      }
                    }
                  })
                },
              },
              {
                text: 'Delete',
                color: 'red-darken-2',
                onClick: () => deleteItem({
                  item: thesis.value
                })
              },
              {
                text: 'Dismiss',
                color: 'red',
                onClick: () => close()
              },
            ],
          },
        })
      },
    }
  } else if (student.value.foundIn === studentPanel.panelName) {
    return {
      text: `${studentPanel.title.singular} Profile`,
      color: studentPanel.color,
      icon: studentPanel.icon,
      onClick: () => jumpTo(studentPanel.panelName),
    }
  } else if (student.value.foundIn === graduatePanel.panelName) {
    return {
      text: `${graduatePanel.title.singular} Profile`,
      color: graduatePanel.color,
      icon: graduatePanel.icon,
      onClick: () => jumpTo(graduatePanel.panelName),
    }
  } else {
    return {
      text: `Problem Linking ${studentPanel.title.singular}`,
      color: 'red-darken-4',
      icon: 'mdi-alert-circle',
      onClick: () => {
        const { open, close } = useDialog()
        open({
          body: {
            title: `Problem Linking ${studentPanel.title.singular}`,
            description: `The ${studentPanel.title.singular} that this ${getActivePanel.title.singular} was linked to no longer exists. Please relink or delete.`,
            buttons: [
              {
                text: 'Delete',
                color: 'red-darken-2',
                onClick: () => deleteItem({
                  item: thesis.value
                })
              },
              {
                text: 'Relink',
                color: studentPanel.color,
                onClick: () => {
                  open({
                    component: {
                      render: LinkStudent,
                      props: {
                        onUpdate: () => broadcastThroughSocket('studentSysId')
                      }
                    }
                  })
                },
              },
              {
                text: 'Dismiss',
                color: 'red',
                onClick: () => close()
              },
            ],
          },
        })
      }
    }
  }
})
</script>