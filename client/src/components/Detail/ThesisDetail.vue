<template>
  <DetailFrame :item="thesis">
    <template #main>
      <DetailHeader
        :item="thesis"
        :placeholder="`${getActivePanel.title.singular} Title`"
      >
        <LinkStudentButton :item="thesis" />
      </DetailHeader>

      <InputCoupler>

        <DetailInput
          :item="thesis"
          prop="term"
          :button="{
            condition: !thesis.term,
            text: 'Current Term',
            newPropValue: () => getCurrentTerm(),
          }"
          :rules="[(v) => termValidator(v) || 'Potentially Invalid Term']"
          label="Term"
          icon="calendar"
        />

        <DetailInput
          :item="thesis"
          prop="decision"
          :icon="approvalStates[thesis.decision] ?? 'alert-circle'"
          label="Decision"
          :button="{
            condition: !thesis.decision,
            text: `Mark as ${Object.keys(approvalStates)[0]}`,
            newPropValue: () => Object.keys(approvalStates)[0],
          }"
          :input="{
            type: 'select',
            items: Object.keys(approvalStates),
          }"
        />

      </InputCoupler>

      <InputCoupler>

        <DetailInput
          :item="thesis"
          prop="draftReceived"
          icon="calendar-check"
          label="Draft Received"
          :button="{
            condition: !thesis.draftReceived,
            text: 'Received Today',
            newPropValue: () => new Date().toLocaleDateString('en-US'),
          }"
        />

        <DetailInput
          :item="thesis"
          prop="proposalReceived"
          icon="calendar-check"
          label="Proposal Received"
          :button="{
            condition: !thesis.proposalReceived,
            text: 'Received Today',
            newPropValue: () => new Date().toLocaleDateString('en-US'),
          }"
        />

      </InputCoupler>

      <DetailInput
        :item="thesis"
        prop="mentor"
        :button="{
          condition: !sameInstructor && !suggestionSelected,
          text: suggestionToString,
          newPropValue: () => selectSuggestion(),
        }"
        icon="human-male-board"
        label="Faculty Mentor"
      />

      <DetailInput
        :item="thesis"
        prop="mentorEmail"
        :rules="[(v) => emailValidator(v) || 'Invalid email address']"
        icon="email"
        label="Faculty Mentor Email"
        :button="{
          condition: !thesis.mentorEmail && !!thesis.mentor,
          text: 'New Faculty Email',
          newPropValue: () => getFacultyEmail(thesis.mentor),
        }"
      />

    </template>
    <template #buttons>
      <v-btn
        @click="viewProfileButton.onClick()"
        :disabled="readOnlyMode && !viewProfileButton.keepEnabledInReadOnly"
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
import InputCoupler from './Helper/InputCoupler.vue'
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import LinkStudent from './Helper/LinkStudent.vue'

import { computed } from 'vue'
import { useStudentMatcher } from '../../StudentMatcher'
import { useInstructorAutoComplete } from '../../InstructorAutoComplete'
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
import { storeToRefs } from 'pinia'

const { readOnlyMode } = storeToRefs(useSheetManager())
const { setPanel, getActivePanel } = useSheetManager()
const { deleteItem } = useDocumentCache()

const props = defineProps<{
  item: Thesis
}>()

const approvalStates = {
  'Pending': 'alert-circle',
  'Approved': 'check-circle',
  'Rejected': 'close-circle'
}

const thesis = computed(() => props.item)
const instructor = computed(() => thesis.value.mentor)

const {
  suggestedInstructor,
  sameInstructor,
  selectSuggestion,
  suggestionSelected,
  suggestionToString
} = useInstructorAutoComplete(instructor)

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
      keepEnabledInReadOnly: false,
      text: `No ${studentPanel.title.singular} Linked`,
      color: 'red-darken-4',
      icon: 'mdi-account-off',
      onClick: () => {
        const { open } = useDialog()
        open({
          component: {
            render: LinkStudent,
            props: {
              panelName: studentPanel.panelName,
            }
          }
        })
      },
    }
  } else if (student.value.foundIn === studentPanel.panelName) {
    return {
      keepEnabledInReadOnly: true,
      text: `${studentPanel.title.singular} Profile`,
      color: studentPanel.color,
      icon: studentPanel.icon,
      onClick: () => jumpTo(studentPanel.panelName),
    }
  } else if (student.value.foundIn === graduatePanel.panelName) {
    return {
      keepEnabledInReadOnly: true,
      text: `${graduatePanel.title.singular} Profile`,
      color: graduatePanel.color,
      icon: graduatePanel.icon,
      onClick: () => jumpTo(graduatePanel.panelName),
    }
  } else {
    return {
      keepEnabledInReadOnly: false,
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
                text: 'Relink',
                color: studentPanel.color,
                onClick: () => {
                  open({
                    component: {
                      render: LinkStudent,
                      props: {
                        panelName: studentPanel.panelName,
                      }
                    }
                  })
                },
              },
              {
                text: 'Dismiss',
                color: 'red',
                onClick: close
              },
            ],
          },
        })
      }
    }
  }
})
</script>