<template>
  <div
    ref="el"
    :class="[
      'pa-5',
      'd-flex',
      sm ? 'flex-column' : 'flex-row'
    ]"
  >
    <div>

      <DetailHeader
        v-model="item.title"
        :id="item.studentId"
        placeholder="Thesis Title"
      />

      <v-btn
        v-if="item.studentId && !item.name"
        @click="setStudentData"
        :loading="studentDataState.loading"
        :color="studentDataState.color"
        class="mb-3"
        block
      >
        <v-icon class="mr-2">mdi-account-group</v-icon>
        <span v-if="!studentDataState.error">
          Fill With Data From Students ({{ item.studentId }})
        </span>
        <span v-else>
          {{ studentDataState.error }}
        </span>
      </v-btn>
      <v-text-field
        v-model="item.name"
        clearable
        label="Student Name"
        prepend-icon="mdi-account"
      ></v-text-field>
      <v-btn
        v-if="item.name && !item.email"
        @click="item.email = getStudentEmail(item.name)"
        color="green"
        size="x-small"
        class="mb-2"
      >New Student Email</v-btn>
      <v-text-field
        v-model="item.email"
        :rules="[(v) => emailValidator(v) || 'Invalid email address']"
        clearable
        label="Student Email"
        prepend-icon="mdi-email"
      ></v-text-field>

      <v-divider class="mb-5"></v-divider>

        <v-btn
          v-if="!item.term"
          @click="item.term = getCurrentTerm()"
          class="mb-2"
          color="green"
          size="x-small"
        >Current Term</v-btn>
        <v-text-field
          v-model="item.term"
          :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
          clearable
          label="Term"
          prepend-icon="mdi-calendar"
        ></v-text-field>

      <div class="mb-2 d-flex flex-row ">
        <v-btn
          v-if="!item.draftReceived"
          @click="item.draftReceived = new Date().toLocaleString().split(',')[0]"
          color="green"
          size="x-small"
        >Today</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!item.proposalReceived"
          @click="item.proposalReceived = new Date().toLocaleString().split(',')[0]"
          color="green"
          size="x-small"
        >Today</v-btn>
      </div>

      <div class="d-flex flex-row">
        <v-text-field
          v-model="item.draftReceived"
          clearable
          label="Draft Received"
          prepend-icon="mdi-calendar-check"
          class="mr-6"
        ></v-text-field>
        <v-text-field
          v-model="item.proposalReceived"
          clearable
          label="Proposal Received"
          prepend-icon="mdi-calendar-check"
        ></v-text-field>
      </div>
      <v-select
        v-model="item.decision"
        :items="[
          'Approved',
          'Rejected',
          'Pending',
        ]"
        clearable
        :prepend-icon="item.decision === 'Approved' ? 'mdi-check-circle' : item.decision === 'Rejected' ? 'mdi-close-circle' : 'mdi-alert-circle'"
        label="Decision"
      ></v-select>
      <div class="d-flex flex-row">
        <v-spacer></v-spacer>
        <v-btn
          v-if="item.mentor && !item.mentorEmail"
          @click="item.mentorEmail = getFacultyEmail(item.mentor)"
          color="green"
          size="x-small"
          class="mb-2"
        >New Faculty Email</v-btn>
      </div>
      <InstructorComplete
        @update="item.mentor = $event; item.mentorEmail = getFacultyEmail($event)"
        :instructor="item.mentor"
        color="green"
      />
      <div class="d-flex flex-row align-center justify-center">
        <v-text-field
          v-model="item.mentor"
          prepend-icon="mdi-human-male-board"
          label="Faculty Mentor"
          class="mr-6"
          style="width: 45%"
        ></v-text-field>
        <v-text-field
          v-model="item.mentorEmail"
          :rules="[(v) => emailValidator(v) || 'Invalid email address']"
          clearable
          prepend-icon="mdi-email"
          label="Faculty Mentor Email"
          style="width: 45%"
        ></v-text-field>
      </div>
    </div>
    <v-divider
      v-if="sm"
      class="my-2"
    ></v-divider>
    <div
      :class="[
        sm ? '' : 'ml-5',
        'd-flex',
        'flex-column',
        'align-center'
      ]"
      :style="sm ? '' : 'width: 55%; max-width: 450px'"
    >
      <div style="width: 100%;">
        <v-textarea
          v-model="item.note"
          auto-grow
          variant="outlined"
          clearable
          label="Thesis Notes"
        ></v-textarea>
      </div>
      <div
        :class="[
          'd-flex',
          'flex-column'
        ]"
        style="width: 100%"
      >
        <v-btn
          @click="$emit('delete')"
          size="large"
          color="red"
          class="mt-3"
        >
          <v-icon
            class="mr-4"
            size="x-large"
          >mdi-delete</v-icon>
          delete thesis
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, toRefs } from 'vue'
import { getCurrentTerm, termValidator } from '../../TermValidator'
import { useElementSize } from '@vueuse/core'
import { Thesis } from '../../SheetTypes'
import { getEvery, Range } from '../../SheetsAPI'
import { mapStudents } from '../../DataMappers'
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import {
  emailValidator,
  getFacultyEmail,
  getStudentEmail
} from '../../EmailUtilities'

const props = defineProps<{
  item: Thesis
}>()

const studentDataState = ref({
  loading: false,
  error: '',
  color: 'blue-darken-2',
})

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const emits = defineEmits([
  'delete',
  'unselect'
])

async function setStudentData() {
  studentDataState.value.loading = true
  const students = await getEvery(Range.STUDENTS)
  const mappedStudents = await mapStudents(students)
  const student = mappedStudents.find(s => s.id === props.item.studentId)
  if (!student) {
    studentDataState.value.error = 'Student not found'
    studentDataState.value.color = 'red'
    studentDataState.value.loading = false
    return
  }
  props.item.name = student.name
  props.item.email = student.email
  studentDataState.value.loading = false
  studentDataState.value.color = 'blue-darken-2'
}
</script>