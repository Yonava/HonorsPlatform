<template>
  <v-sheet class="pa-5">
    <v-sheet v-if="loading">
      <h1>Incrementing Student Year...</h1>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    </v-sheet>
    <v-sheet v-else>
      <h1>Done Incrementing Student Year!</h1>
      <div style="overflow: auto; height: 500px">
        <div v-if="graduatingSeniors.length">
          <h3 style="position: sticky; top: 0; background: white;">
            Congratulations to the following students who have graduated:
          </h3>
          <v-sheet
            class="d-flex flex-row flex-wrap"
            style="gap: 10px;"
          >
            <v-sheet
              v-for="senior in graduatingSeniors"
              :key="senior.sysId"
              @click="selectGrad(senior.sysId)"
              class="px-3 py-1 hoverable"
              style="cursor: pointer;"
              color="blue"
            >
              {{ senior.name }}
            </v-sheet>
          </v-sheet>
        </div>
        <div v-if="failedToIncrement.length">
          <div style="position: sticky; top: 0; background: white;">
            <h3>
              Unfortunately, the following students failed to increment:
            </h3>
            <h4>
              year must either be 'Freshman', 'Sophomore', 'Junior', or 'Senior' to
              increment
            </h4>
          </div>
          <v-sheet
            class="d-flex flex-row flex-wrap"
            style="gap: 10px;"
          >
            <v-sheet
              v-for="failure in failedToIncrement"
              :key="failure.sysId"
              @click="selectStudent(failure)"
              class="px-3 py-1 hoverable"
              style="cursor: pointer;"
              color="red lighten-2"
            >
              {{ failure.name }}
              <b>
                <span v-if="failure.year">
                  {{ failure.year }}
                </span>
                <span v-else>
                  No Year
                </span>
              </b>
            </v-sheet>
          </v-sheet>
        </div>
      </div>
      <v-btn @click="close" color="blue" class="mt-3" block> Done </v-btn>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { incrementStudentYear } from "../StudentTools";
import type { Student } from "../SheetTypes";
import { useDialog } from "../store/useDialog";
import { useSheetManager } from "../store/useSheetManager";
import { ref } from "vue";
import { getPanel } from '../Panels'

const { fetchItems, setItem, setPanel } = useSheetManager();
const { close } = useDialog();

const loading = ref(true);
const graduatingSeniors = ref<Student[]>([]);
const failedToIncrement = ref<Student[]>([]);

incrementStudentYear().then(
  ({ failedToIncrement: failed, graduatingSeniors: graduated }) => {
    fetchItems();
    graduatingSeniors.value = graduated;
    failedToIncrement.value = failed;
    loading.value = false;
  }
);

const selectStudent = (student: Student) => {
  setItem(student);
  close();
};

const selectGrad = (sysId: string) => {
  setPanel(getPanel('GRADUATES'), {
    key: 'sysId',
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