<template>
  <div>
    <DetailFrame
      v-model="student.note"
      :item="student"
    >
      <template #main>
        <DetailHeader
          v-model="student.name"
          :item="student"
          :placeholder="`${getActivePanel.title.singular} Name`"
        >
          <v-dialog
            v-model="idDialog"
            width="300"
          >
            <template #activator="{ props }">
              <v-btn
                v-if="!student.id"
                v-bind="props"
                @click="tempStudentId = ''"
                :color="getActivePanel.color"
                size="x-small"
              >
                Add {{ getActivePanel.title.singular }} ID
              </v-btn>
              <div
                v-else
                v-bind="props"
                @click="tempStudentId = student.id;"
                class="d-flex align-center px-2 py-1 edit-student-id"
              >
                <div>{{ student.id }}</div>
                <v-icon
                  size="small"
                  style="opacity: 0.5;"
                >
                  mdi-pencil
                </v-icon>
                <v-tooltip
                  :disable="xs"
                  activator="parent"
                >
                  Edit Student ID
                </v-tooltip>
              </div>
            </template>
            <v-sheet
              class="student-id-dialog pa-4"
            >
              <v-text-field
                v-model="tempStudentId"
                :rules="[studentIdRule]"
                :label="`${getActivePanel.title.singular} ID`"
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
                  @click="idDialog = false; tempStudentId = student.id;"
                  color="red"
                >
                  Cancel
                </v-btn>
              </div>
            </v-sheet>
          </v-dialog>
        </DetailHeader>
        <v-btn
          v-if="!student.email"
          @click="student.email = getStudentEmail(student.name)"
          :color="getActivePanel.color"
          size="x-small"
          class="mb-3"
        >
          new {{ getActivePanel.title.singular }} email
        </v-btn>
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
            :color="getActivePanel.color"
            class="ml-4"
            size="small"
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
            prepend-icon="mdi-briefcase"
          >
          </v-select>
        </div>
        <!-- clearable on this auto-completes incompatible with state syncing to google drive -->
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
          :color="getActivePanel.color"
          size="x-small"
          class="mb-3"
          >
            Add Meeting Note
          </v-btn>
      </template>
      <template #buttons>
        <div
          class="d-flex flex-row justify-space-between"
          style="width: 100%"
        >
          <v-btn
            @click="viewThesis"
            :color="thesisButton.color"
            size="large"
            style="width: 49%"
          >
            <v-icon
              class="mr-2"
              size="x-large"
            >
              {{ thesisButton.icon }}
            </v-icon>
            {{ thesisButton.text }}
          </v-btn>
          <v-btn
            @click="move"
            :loading="movingStudent"
            :color="moveItem.STUDENTS.to.color"
            size="large"
            style="width: 49%"
          >
            <v-icon
              class="mr-2"
              size="x-large"
            >
              {{ moveItem.STUDENTS.to.icon }}
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
  yearOptions,
  statusOptions,
  athleticOptions,
} from "../../StudentTools";
import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { useUpdateItem } from "../../TrackItemForUpdate";
import { ref, computed } from 'vue'
import { Student } from '../../SheetTypes'
import { useDisplay } from 'vuetify'
import { getMoveItem } from '../../MoveItems'

const { setPanel, getActivePanel } = useSheetManager();
const { Students, Theses, addItem } = useDocumentCache();

const props = defineProps<{
  item: Student;
}>();

const student = computed(() => props.item);

useUpdateItem(student);

const { xs } = useDisplay();

const statusOptionIcon = computed(() => {
  const optionIcon = statusOptions.find((option) => option.status === student.value.activeStatus)?.icon
  const fallbackIcon = 'help'
  const icon = optionIcon ?? fallbackIcon
  return `mdi-${icon}`
});

const statusOptionLabels = computed(() => statusOptions.map((option) => option.status));

const idDialog = ref(false);
const movingStudent = ref(false);

const showAddNote = ref(false);

function studentIdRule(studentId: string) {
  if (!studentId) {
    return true;
  }
  const existingStudent = Students.list.find(
    (item) => item.id === studentId
  );
  if (existingStudent) {
    if (existingStudent.sysId === student.value.sysId) {
      return true;
    }
    else if (existingStudent.name) {
      return `${getActivePanel.title.singular} ID already in use by ${existingStudent.name}`;
    } else {
      return `${getActivePanel.title.singular} ID already in use`;
    }
  };
  if (/^\d{7}$/.test(studentId)) {
    return true;
  }
  return `Invalid ${getActivePanel.title.singular} ID`;
}

const tempStudentId = ref("");
const saveId = () => {
  student.value.id = tempStudentId.value;
  idDialog.value = false;
}

const thesisPanel = getPanel("THESES");

const thesis = computed(() => Theses.list.find((thesis) => thesis.studentSysId === student.value.sysId));

const thesisButton = computed(() => {
  if (!thesis.value) {
    return {
      text: `Create ${thesisPanel.title.singular}`,
      icon: "mdi-plus",
      color: thesisPanel.color,
    };
  }

  return {
    text: `View ${thesisPanel.title.singular}`,
    icon: thesisPanel.icon,
    color: thesisPanel.color,
  };
});

const viewThesis = () => {
  if (!thesis.value) {
    addItem({
      panel: thesisPanel,
      postToSheet: true,
      columns: [
        student.value.sysId,
      ]
    });
  }
  setPanel(thesisPanel.panelName, {
    key: 'studentSysId',
    value: student.value.sysId,
  });
}

const addStudentNote = (event: { initials: string; note: string, date: string }) => {
  const { initials, note, date } = event;
  if (student.value.note) student.value.note += "\n\n";
  student.value.note += `${initials} (${date}): ${note}`;
}

const moveItem = getMoveItem();
const move = async () => {
  movingStudent.value = true;
  try {
    await moveItem.STUDENTS.handler(student.value);
  } catch (error) {
    console.error(error);
  } finally {
    movingStudent.value = false;
  }
}
</script>

<style scoped>
.student-id-dialog {
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
}

.edit-student-id:hover {
  background: rgba(0, 0, 0, 0.1);
}

.edit-student-id {
  transition: 0.3s;
  cursor: pointer;
  gap: 5px;
  border-radius: 5px;
  transform: translateX(-6px)
}
</style>