<template>
  <div>
    <DetailFrame v-model="student.note">
      <template #main>
        <DetailHeader
          v-model="student.name"
          :id="student.id"
          placeholder="Student Name"
        >
          <template
            v-if="!student.id"
            #id
          >
            <v-dialog
              v-model="idDialog"
              width="300"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  color="red"
                >
                  Add Student ID
                </v-btn>
              </template>
              <div class="student-id-dialog pa-4">
                <v-icon color="red">mdi-alert</v-icon>
                <p
                  style="color: red"
                  class="mb-2"
                >
                  Warning: Student IDs are unique and cannot be changed once
                  set!
                </p>
                <v-text-field
                  v-model="tempStudentId"
                  :rules="[studentIdRule]"
                  variant="solo"
                  label="Student ID"
                  class="mb-2"
                ></v-text-field>
                <div class="d-flex">
                  <v-btn
                    @click="saveId"
                    :disabled="typeof studentIdRule(tempStudentId) === 'string'"
                    color="green"
                  >
                    Save
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="idDialog = false"
                    color="red"
                  > Cancel </v-btn>
                </div>
              </div>
            </v-dialog>
          </template>
        </DetailHeader>
        <v-btn
          v-if="!student.email"
          @click="student.email = getStudentEmail(student.name)"
          size="x-small"
          color="blue-darken-2"
          class="mb-3"
          >new student email</v-btn
        >
        <div class="d-flex align-center">
          <v-text-field
            v-model="student.email"
            :rules="[(v) => emailValidator(v) || 'Invalid email']"
            clearable
            label="Email"
            prepend-icon="mdi-email"
          ></v-text-field>
          <v-btn
            v-if="student.email"
            @click="sendEmail(student.email)"
            class="ml-4"
            size="small"
            color="blue-darken-2"
          >
            email
          </v-btn>
        </div>
        <v-text-field
          v-model.number="student.points"
          label="Points"
          type="number"
          prepend-icon="mdi-ticket"
        ></v-text-field>
        <div class="d-flex flex-row">
          <v-select
            v-model="student.activeStatus"
            :items="statusOptionLabels"
            :prepend-icon="statusOptionIcon"
            label="Active Status"
            style="width: 15%"
            class="mr-4"
          ></v-select>
          <v-select
            v-model="student.year"
            :items="yearOptions"
            label="Year"
            style="width: 15%"
            prepend-icon="mdi-calendar"
          >
          </v-select>
        </div>
        <!-- clearable on this auto-complete is incompatible with state syncing to google drive -->
        <v-autocomplete
          v-model="student.athletics"
          :items="Object.keys(athleticOptions)"
          :prepend-icon="`mdi-${athleticOptions[student.athletics]}`"
          label="Athletics"
          class="mt-2"
        ></v-autocomplete>

        <div class="d-flex flex-wrap">
          <div
            v-for="(value, key) in student.misc"
            :key="key"
            style="width: calc(50% - 15px); margin-right: 15px;"
          >
            <v-text-field
              v-model="student.misc[key]"
              :label="key"
              outlined
            ></v-text-field>
          </div>
        </div>
      </template>
      <template #notes-button>
        <v-btn
          @click="showAddNote = true"
          size="x-small"
          color="blue-darken-2"
          class="mb-3"
          >Add Meeting Note</v-btn
        >
      </template>
      <template #buttons>
        <div class="d-flex flex-row justify-space-between" style="width: 100%">
          <v-btn
            @click="viewThesis"
            :color="getPanel('THESES').color"
            size="large"
            style="width: 49%"
          >
            <v-icon
              class="mr-4"
              size="x-large"
            >
              {{ getPanel("THESES").icon }}
            </v-icon>
            View Thesis
          </v-btn>
          <v-btn
            @click="graduate"
            :loading="movingStudent"
            :color="getPanel('GRADUATES').color"
            size="large"
            style="width: 49%"
          >
            <v-icon
              class="mr-4"
              size="x-large"
            >
              {{ getPanel("GRADUATES").icon }}
            </v-icon>
            Graduate
          </v-btn>
        </div>
      </template>
    </DetailFrame>
    <AddStudentNote
      @success="addStudentNote($event)"
      @close="showAddNote = false"
      :show="showAddNote"
    />
  </div>
</template>


<script setup lang="ts">
import DetailFrame from "./Helper/DetailFrame.vue";
import DetailHeader from "./Helper/DetailHeader.vue";
import AddStudentNote from "./Helper/AddStudentNote.vue";
import {
  emailValidator,
  getStudentEmail,
  sendEmail,
} from "../../EmailUtilities";
import { getPanel } from "../../Panels";
import {
  moveToGraduates,
  yearOptions,
  statusOptions,
  athleticOptions,
} from "../../StudentTools";
import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { useDialog } from "../../store/useDialog";
import { useUpdateItem } from "../../TrackItemForUpdate";
import { warn } from '../../Warn'
import { toRefs, ref, computed, Ref } from 'vue'
import { Student } from '../../SheetTypes'

const { open, close } = useDialog();
const { setPanel, newSysId } = useSheetManager();

const { Students, addItem } = useDocumentCache();
const { list: items, selected } = toRefs(Students);
const student = selected as Ref<Student>;

useUpdateItem(student);

const statusOptionIcon = computed(() => `mdi-${statusOptions.find((option) => option.label === student.value.activeStatus)?.icon ?? "help"}`);
const statusOptionLabels = computed(() => statusOptions.map((option) => option.label));

const tempStudentId = ref("");

const idDialog = ref(false);
const movingStudent = ref(false);

const showAddNote = ref(false);

function studentIdRule(studentId: string) {
  if (!studentId) return "Enter Student ID";
  const existingStudent = items.value.find(
    (item) => item.id === studentId
  );
  if (existingStudent) return `Student ID already occupied by ${existingStudent.name || "(no name)"}`;
  if (/^\d{7}$/.test(studentId)) return true;
  return "Invalid Student ID";
}

async function saveId() {
  student.value.id = tempStudentId.value;
  idDialog.value = false;
}

function viewThesis() {
  if (!student.value.id) {
    open({
      body: {
        title: "Student Must Have ID",
        description: "A thesis is connected to each student using their Student ID number. Please add a student ID to this student before viewing their thesis.",
        buttons: [
          {
            text: "Dismiss",
            color: "blue",
            onClick: () => close(),
          },
          {
            text: "Add ID",
            color: "green",
            onClick: () => {
              idDialog.value = true;
              close();
            },
          }
        ]
      }
    })
    return;
  }

  setPanel('THESES', {
    key: "studentId",
    value: student.value.id,
    fallbackFn: () => {
      open({
        body: {
          title: `${student.value.name} Does Not Have a Thesis`,
          description: ``,
          buttons: [
            {
              text: "Create New Thesis",
              color: "green",
              onClick: () => {
                addItem({
                  panel: getPanel("THESES"),
                  postToSheet: true,
                  columns: [
                    newSysId(),
                    student.value.id,
                    student.value.name,
                    student.value.email,
                  ],
                });
                close();
              },
            },
            {
              text: 'Back to Student Profile',
              color: getPanel("STUDENTS").color,
              onClick: () => {
                setPanel('STUDENTS', {
                  value: student.value.sysId,
                });
                close();
              },
            },
          ],
        },
      });
    },
  });
}

async function graduate() {
  if (typeof student.value.row !== "number") return;

  const _student = JSON.parse(JSON.stringify(student.value));
  movingStudent.value = true;
  try {
    await warn(null, null, `Are you sure you want to graduate ${_student.name}? Graduating a student will remove them from the student list and add them to the graduates list. This action will permanently erase data such as ${_student.name}s student email address (${_student.email || 'no email'}), points (${_student.points || 'no points'}), athletic affiliation (${_student.athletics || 'no athletics'}), and more.`)
  } catch {
    movingStudent.value = false;
    return;
  }

  try {
    await moveToGraduates(_student);
  } catch (e) {
    movingStudent.value = false;
    console.error(e);
    return;
  }

  open({
    body: {
      title: "Student Graduated",
      description: `${_student.name} has been successfully graduated.`,
      buttons: [
        {
          text: "Dismiss",
          color: "blue",
          onClick: close,
        },
        {
          text: `View new graduate profile`,
          color: getPanel("GRADUATES").color,
          onClick: () => {
            setPanel('GRADUATES', {
              value: _student.sysId
            });
            close();
          },
        },
      ],
    },
  });
}

function addStudentNote(event: { initials: string; note: string, date: string }) {
  const { initials, note, date } = event;
  if (student.value.note) student.value.note += "\n\n";
  student.value.note += `${initials} (${date}): ${note}`;
}
</script>

<style scoped>
.student-id-dialog {
  background: rgb(244, 244, 244);
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
}
</style>