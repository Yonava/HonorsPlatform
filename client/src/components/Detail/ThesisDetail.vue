<template>
  <DetailFrame v-model="thesis.note">
    <template #main>
      <DetailHeader
        v-model="thesis.title"
        :id="thesis.studentId"
        placeholder="Thesis Title"
      />
      <v-text-field
        v-model="thesis.name"
        clearable
        label="Student Name"
        prepend-icon="mdi-account"
      ></v-text-field>
      <v-btn
        v-if="thesis.name && !thesis.email"
        @click="thesis.email = getStudentEmail(thesis.name)"
        color="green"
        size="x-small"
        class="mb-2"
      >New Student Email</v-btn>
      <v-text-field
        v-model="thesis.email"
        :rules="[(v) => emailValidator(v) || 'Invalid email address']"
        clearable
        label="Student Email"
        prepend-icon="mdi-email"
      ></v-text-field>

      <v-divider class="mb-5"></v-divider>

        <v-btn
          v-if="!thesis.term"
          @click="thesis.term = getCurrentTerm()"
          class="mb-2"
          color="green"
          size="x-small"
        >Current Term</v-btn>
        <v-text-field
          v-model="thesis.term"
          :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
          clearable
          label="Term"
          prepend-icon="mdi-calendar"
        ></v-text-field>

      <div class="mb-2 d-flex flex-row ">
        <v-btn
          v-if="!thesis.draftReceived"
          @click="thesis.draftReceived = new Date().toLocaleString().split(',')[0]"
          color="green"
          size="x-small"
        >Today</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!thesis.proposalReceived"
          @click="thesis.proposalReceived = new Date().toLocaleString().split(',')[0]"
          color="green"
          size="x-small"
        >Today</v-btn>
      </div>

      <div class="d-flex flex-row">
        <v-text-field
          v-model="thesis.draftReceived"
          clearable
          label="Draft Received"
          prepend-icon="mdi-calendar-check"
          class="mr-6"
        ></v-text-field>
        <v-text-field
          v-model="thesis.proposalReceived"
          clearable
          label="Proposal Received"
          prepend-icon="mdi-calendar-check"
        ></v-text-field>
      </div>
      <v-select
        v-model="thesis.decision"
        :items="[
          'Approved',
          'Rejected',
          'Pending',
        ]"
        :prepend-icon="thesis.decision === 'Approved' ? 'mdi-check-circle' : thesis.decision === 'Rejected' ? 'mdi-close-circle' : 'mdi-alert-circle'"
        label="Decision"
      ></v-select>
      <div class="d-flex flex-row">
        <v-spacer></v-spacer>
        <v-btn
          v-if="thesis.mentor && !thesis.mentorEmail"
          @click="thesis.mentorEmail = getFacultyEmail(thesis.mentor)"
          color="green"
          size="x-small"
          class="mb-2"
        >New Faculty Email</v-btn>
      </div>
      <InstructorComplete
        @update="thesis.mentor = $event; thesis.mentorEmail = getFacultyEmail($event)"
        :instructor="thesis.mentor"
        color="green"
      />
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
          clearable
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
        >{{ viewProfileButton.icon }}</v-icon>
        {{ viewProfileButton.text }}
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'

import { ref, toRefs, computed } from 'vue'
import { getCurrentTerm, termValidator } from '../../TermValidator'
import type { Thesis } from '../../SheetTypes'
import { getPanel } from '../../Panels'
import {
  emailValidator,
  getFacultyEmail,
  getStudentEmail
} from '../../EmailUtilities'

import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDialog } from '../../store/useDialog'
import { storeToRefs } from 'pinia'
import { useUpdateItem } from '../../TrackItemForUpdate'

const { setPanel } = useSheetManager()
const { Theses, Students, Graduates } = useDocumentCache()
const { selected: thesis } = toRefs(Theses)
useUpdateItem(thesis)

const studentPanel = getPanel('STUDENTS')
const graduatePanel = getPanel('GRADUATES')

const viewProfileButton = computed(() => {
  const student = Students.list.find((student) => student.id === thesis.value.studentId)
  const graduate = Graduates.list.find((graduate) => graduate.id === thesis.value.studentId)
  if (!thesis.value.studentId) {
    return {
      text: 'No Student Linked',
      color: 'red-darken-4',
      icon: 'mdi-account-off',
      onClick: () => {
        const { open, close } = useDialog()
        open({
          body: {
            title: 'No Student Linked',
            description: 'This thesis has no linked student. Add a student ID from an existing student or graduate.',
            buttons: [
              {
                text: 'Close',
                color: 'red',
                onClick: () => close(),
              },
            ],
          },
        })
      },
    }
  }

  if (student) {
    return {
      text: 'View ' + studentPanel.title.singular,
      color: studentPanel.color,
      icon: studentPanel.icon,
      onClick: () => jumpTo('STUDENTS'),
    }
  } else if (graduate) {
    return {
      text: 'View ' + graduatePanel.title.singular,
      color: graduatePanel.color,
      icon: graduatePanel.icon,
      onClick: () => jumpTo('GRADUATES'),
    }
  } else {
    return {
      text: 'ID ' + thesis.value.studentId + ' Not Found',
      color: 'red-darken-4',
      icon: 'mdi-alert-circle',
      onClick: () => {
        const { open, close } = useDialog()
        open({
          body: {
            title: 'ID ' + thesis.value.studentId + ' Not Found',
            description: `This thesis has a student ID (${thesis.value.studentId}) that does not match any student or graduate. This may be because the student or graduate was deleted.`,
            buttons: [
              {
                text: 'Close',
                color: 'red',
                onClick: () => close(),
              },
            ],
          },
        })
      }
    }
  }
})

const jumpTo = (panel: 'STUDENTS' | 'GRADUATES') => {
  setPanel(panel, {
    key: 'id',
    value: thesis.value.studentId
  })
}
</script>