<template>
  <v-sheet class="pa-5">

    <v-sheet v-if="!success">
      <h1>Increment Student Year</h1>
      <div
        class="d-flex flex-row mt-2"
        style="gap: 10px;"
      >
        <h3>Select students to exclude: </h3>
        <v-spacer></v-spacer>
        <v-btn
          @click="studentsToIncrement = [...Students.list]"
          :disabled="studentsToIncrement.length === Students.list.length"
          size="small"
          color="green"
          variant="outlined"
        >Include All</v-btn>
        <v-btn
          @click="studentsToIncrement = []"
          :disabled="!studentsToIncrement.length"
          size="small"
          color="red"
          variant="outlined"
        >Exclude All</v-btn>
      </div>
      <p style="font-size: 0.85rem">
        {{ studentsToIncrement.length }} out of {{ Students.list.length }} students included
      </p>
      <div style="overflow: auto; height: 600px;">
        <v-sheet
          v-for="student in [...Students.list].sort((a, b) => a.name.localeCompare(b.name))"
          :key="student.sysId"
          @click="toggleStudentToIncrement(student)"
          :color="isStudentOnIncrementList(student) ? 'blue-darken-1' : 'white'"
          style="cursor: pointer; font-size: 1.5rem; border-radius: 10px; transition: 0.3s; user-select: none;"
          class="px-3 py-1 my-1 d-flex flex-row align-center"
        >
          <div>
            <span style="font-weight: 900">
              {{ student.name || '(No Name)' }}
            </span>
            <span
              style="font-size: 1rem;"
              class="ml-2"
            >
              {{ student.year || '(No Class Year)' }}
            </span>
          </div>
          <v-spacer></v-spacer>
          <span style="font-weight: 200; font-size: 1rem">
            {{ student.id || '(No ID)' }}
          </span>
        </v-sheet>
      </div>
      <v-btn
        @click="initiateIncrement"
        :disabled="!studentsToIncrement.length"
        :loading="loading"
        :color="initiateButtonDisplay.color"
        class="mt-3"
        block
      >
        {{ initiateButtonDisplay.text }}
      </v-btn>
    </v-sheet>

    <v-sheet v-else>
      <h1>
        Done Incrementing Student Year!
      </h1>
      <div style="overflow: auto; max-height: 600px">
        <div v-if="graduatingSeniors.length">
          <h3 style="position: sticky; top: 0; background: white;">
            Congratulations to the following students who have graduated:
          </h3>
          <v-sheet
            class="d-flex flex-row flex-wrap"
            style="gap: 10px;"
          >
            <v-sheet
              v-for="graduate in graduatingSeniors"
              :key="graduate.sysId"
              @click="select(graduate.sysId, 'GRADUATES')"
              :color="getPanel('GRADUATES').color"
              class="px-3 py-1 hoverable"
              style="cursor: pointer;"
            >
              {{ graduate.name }}
            </v-sheet>
          </v-sheet>
        </div>
        <div v-if="failedToIncrement.length">
          <div style="position: sticky; top: 0; background: white;">
            <h3>
              Unfortunately, the following students failed to increment:
            </h3>
            <h4>
              We couldn't figure out what year they were in. Please manually update their year.
            </h4>
          </div>
          <v-sheet
            class="d-flex flex-row flex-wrap"
            style="gap: 10px;"
          >
            <v-sheet
              v-for="failure in failedToIncrement"
              :key="failure.sysId"
              @click="select(failure.sysId, 'STUDENTS')"
              class="px-3 py-1 hoverable"
              style="cursor: pointer;"
              color="red lighten-2"
            >
              {{ failure.name }}
              <b>
                {{ failure.year || '(No Year)' }}
              </b>
            </v-sheet>
          </v-sheet>
        </div>
      </div>
      <v-btn
        @click="close"
        color="blue"
        class="mt-3"
        block
      >
        Done
      </v-btn>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { incrementStudentYear } from "../StudentTools";
import type { Student } from "../SheetTypes";
import { useDialog } from "../store/useDialog";
import { useSheetManager } from "../store/useSheetManager";
import { ref, computed, watch } from "vue";
import { getPanel, PanelName } from '../Panels'
import { useDocumentCache } from '../store/useDocumentCache'

const { setPanel } = useSheetManager();
const { close } = useDialog();

const graduatingSeniors = ref<Student[]>([]);
const failedToIncrement = ref<Student[]>([]);
const success = ref(false);
const initiationConfirmed = ref(false);
const loading = ref(false);
const { Students } = useDocumentCache()
const studentsToIncrement = ref<Student[]>([...Students.list]);

watch(studentsToIncrement, (newStudents, oldStudent) => {
  if (newStudents.length !== oldStudent.length) {
    initiationConfirmed.value = false;
  }
}, { deep: true });

const initiateButtonDisplay = computed(() => {
  if (initiationConfirmed.value) {
    return {
      text: `Click again to confirm (${studentsToIncrement.value.length} student${studentsToIncrement.value.length === 1 ? '' : 's'} effected)`,
      color: "red",
    };
  } else {
    return {
      text: "Initiate Student Increment",
      color: "blue",
    };
  }
});

const toggleStudentToIncrement = (student: Student) => {
  const index = indexOfStudentOnIncrementList(student);
  if (index === -1) {
    studentsToIncrement.value.push(student);
  } else {
    studentsToIncrement.value.splice(index, 1);
  }
};

const indexOfStudentOnIncrementList = (student: Student) => {
  return studentsToIncrement.value.findIndex((s) => s.sysId === student.sysId);
};

const isStudentOnIncrementList = (student: Student) => {
  return indexOfStudentOnIncrementList(student) !== -1;
};

const initiateIncrement = async () => {

  if (!initiationConfirmed.value) {
    initiationConfirmed.value = true;
    return;
  }

  loading.value = true;

  try {

    const {
      failedToIncrement: failed,
      graduatingSeniors: graduated
    } = await incrementStudentYear([...studentsToIncrement.value]);

    graduatingSeniors.value = graduated;
    failedToIncrement.value = failed;
    success.value = true;

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
    initiationConfirmed.value = false;
  }
};

const select = (sysId: string, panelName: PanelName) => {
  setPanel(panelName, {
    value: sysId
  })
  close();
};
</script>

<style scoped>
.hoverable {
  transition: 0.2s;
  border: 2px solid transparent;
}

.hoverable:hover {
  border: 2px solid black;
}
</style>
