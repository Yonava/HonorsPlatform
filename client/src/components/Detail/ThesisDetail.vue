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
          :button="termSuggestions"
          :rules="termInputValidator()"
          prop="term"
          label="Term"
          icon="calendar"
        />

        <DetailInput
          :item="thesis"
          prop="decision"
          :icon="approvalStates[thesis.decision] ?? 'alert-circle'"
          label="Committee Approval Status"
          :button="{
            condition: !thesis.decision,
            text: thesisDecisions[0],
            newPropValue: () => thesisDecisions[0],
          }"
          :input="{
            type: 'select',
            items: thesisDecisions,
          }"
        />

      </InputCoupler>

      <InputCoupler>

        <DetailInput
          :item="thesis"
          :button="dateAutoComplete(thesis.draftReceived)"
          :hint="fullDate(thesis.draftReceived)"
          persistent-hint
          prop="draftReceived"
          icon="calendar-check"
          label="Draft Received"
        />

        <DetailInput
          :item="thesis"
          :button="dateAutoComplete(thesis.proposalReceived)"
          :hint="fullDate(thesis.proposalReceived)"
          persistent-hint
          prop="proposalReceived"
          icon="calendar-check"
          label="Proposal Received"
        />

      </InputCoupler>

      <DetailInput
        :item="thesis"
        :button="instructorSuggestions"
        prop="mentor"
        icon="human-male-board"
        label="Faculty Mentor"
      />

      <DetailInput
        :item="thesis"
        prop="mentorEmail"
        :rules="emailInputValidator()"
        icon="email"
        label="Faculty Mentor Email"
        :button="{
          condition: !thesis.mentorEmail && !!thesis.mentor,
          text: getFacultyEmail(thesis.mentor),
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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getPanel } from '@panels'
import { useSheetManager } from '@store/useSheetManager'
import { useDialog } from '@store/useDialog'
import { termInputValidator } from '@utils/terms'
import { emailInputValidator, getFacultyEmail } from '@utils/emails'
import { fullDate } from '@utils/dates'
import {
  useInstructorAutoComplete,
  useTermCodeAutoComplete,
  dateAutoComplete
} from '@composables/useAutoComplete'
import type { Student, Thesis } from '@apptypes/sheetItems'
import { thesisDecisions, type ThesisDecision } from '@apptypes/misc'
import { useReactiveProp, useStudentMatcher } from '@composables/useStudentMatcher'

import InputCoupler from './Helper/InputCoupler.vue'
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import LinkStudent from './Helper/LinkStudent.vue'

const { readOnlyMode } = storeToRefs(useSheetManager())
const { setPanel, getActivePanel } = useSheetManager()

const props = defineProps<{
  item: Thesis
}>()

const thesis = computed(() => props.item)
const { button: instructorSuggestions } = useInstructorAutoComplete(thesis.value)
const { button: termSuggestions } = useTermCodeAutoComplete(thesis.value)

const approvalStates: Record<ThesisDecision, string> = {
  'Pending': 'alert-circle',
  'Approved': 'check-circle',
  'Rejected': 'close-circle'
}

const student = useStudentMatcher(thesis)

const studentPanel = getPanel('STUDENTS')
const graduatePanel = getPanel('GRADUATES')

const jumpTo = (panelName: 'STUDENTS' | 'GRADUATES') => {
  setPanel(panelName, {
    value: thesis.value.studentSysId
  })
}

const viewProfileButton = computed(() => {
  if ('error' in student.value) {
    const { error } = student.value
    if (error === 'NOT_LINKED') {
      return {
        keepEnabledInReadOnly: false,
        text: `No ${studentPanel.title.singular} Linked`,
        color: 'red-darken-4',
        icon: 'mdi-account-off',
        onClick: () => {
          const { open } = useDialog()
          open({
            component: LinkStudent,
            props: {
              panelName: studentPanel.panelName,
            }
          })
        },
      }
    } else {
      return {
        keepEnabledInReadOnly: false,
        text: `Error Linking ${studentPanel.title.singular}`,
        color: 'red-darken-4',
        icon: 'mdi-alert-circle',
        onClick: () => {
          const { open, close } = useDialog()
          open({
            title: `Error Linking ${studentPanel.title.singular}`,
            description: `There was an error linking this ${getActivePanel.title.singular} to a ${studentPanel.title.singular}. Please try again.`,
            buttons: [
              {
                text: 'Relink',
                color: studentPanel.color,
                onClick: () => {
                  open({
                    component: LinkStudent,
                    props: {
                      panelName: studentPanel.panelName,
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
          })
        },
      }
    }
  }

  if (student.value.foundIn === studentPanel.panelName) {
    return {
      keepEnabledInReadOnly: true,
      text: `${studentPanel.title.singular} Profile`,
      color: studentPanel.color,
      icon: studentPanel.icon,
      onClick: () => jumpTo(studentPanel.panelName),
    }
  } else {
    return {
      keepEnabledInReadOnly: true,
      text: `${graduatePanel.title.singular} Profile`,
      color: graduatePanel.color,
      icon: graduatePanel.icon,
      onClick: () => jumpTo(graduatePanel.panelName),
    }
  }
})
</script>