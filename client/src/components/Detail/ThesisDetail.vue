<template>
  <DetailFrame v-model="thesis.note">
    <template #main>
      <DetailHeader
        v-model="thesis.title"
        :id="thesis.studentSysId"
        placeholder="Thesis Title"
      />

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

import { toRefs, computed, Ref } from 'vue'
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

const { setPanel } = useSheetManager()
const { Theses, getItemBySysId, deleteItem } = useDocumentCache()
const { selected } = toRefs(Theses)
const thesis = selected as Ref<Thesis>
useUpdateItem(thesis)

const studentPanel = getPanel('STUDENTS')
const graduatePanel = getPanel('GRADUATES')

const viewProfileButton = computed(() => {
  const studentSysId = thesis.value.studentSysId
  const student = getItemBySysId(studentSysId, 'STUDENTS')
  const graduate = getItemBySysId(studentSysId, 'GRADUATES')
  if (!studentSysId) {
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
  } else if (student) {
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
      text: 'Problem Linking Student',
      color: 'red-darken-4',
      icon: 'mdi-alert-circle',
      onClick: () => {
        const { open, close } = useDialog()
        open({
          body: {
            title: 'Problem Linking Student',
            description: 'The student that this thesis was linked to no longer exists. Please relink this thesis to a student or graduate on the Google Sheet (ask Dr. Matthews) or delete it.',
            buttons: [
              {
                text: 'Delete Thesis',
                color: 'red-darken-2',
                onClick: () => deleteItem()
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

const jumpTo = (panel: 'STUDENTS' | 'GRADUATES') => {
  setPanel(panel, {
    value: thesis.value.studentSysId
  })
}
</script>