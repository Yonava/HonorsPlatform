<template>
  <v-dialog
    v-model="showModal"
    max-width="500"
  >
    <v-card
      v-if="!success"
      class="d-flex flex-column align-center pa-3"
    >
      <h1>
        Let's Finish It Up!
      </h1>
      <div 
        v-if="!loading"
        style="width: 90%;"
      >
        <div
          class="d-flex flex-column mt-5"
          style="width: 100%;"
        >
          <div>
            <v-btn
              v-if="!completedModuleData.completedDate"
              @click="completedModuleData.completedDate = new Date().toLocaleDateString()"
              :color="color"
              size="small"
              class="mb-3"
            >Completed Now</v-btn>
            <v-text-field
              v-model="completedModuleData.completedDate"
              label="Date Completed"
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
              class="mx-2"
            ></v-text-field>
          </div>
          <div class="d-flex flex-column mb-7 mt-3">
            <v-btn
              v-for="grade in grades"
              :key="grade"
              @click="completedModuleData.grade = grade"
              :color="color"
              class="mx-10 mt-2"
            >{{ grade || "Leave Ungraded" }}</v-btn>
          </div>
        </div>
      </div>
      <div 
        v-else
        class="mt-7"
      >
        <v-progress-circular
          indeterminate
          :color="color"
        ></v-progress-circular>
      </div>
      <v-card-actions>
        <v-btn
          v-if="!loading"
          @click="moveToCompleted"
          :color="color"
        >
          <v-icon class="mr-2">mdi-check</v-icon>
          Mark As Complete
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      v-else
      class="d-flex flex-column align-center flex-start pa-3"
    >
      <div class="d-flex flex-row align-center">
        <v-icon
          size="x-large"
          :color="color"
          class="mr-4 mb-2"
        >mdi-check</v-icon>
        <h2 style="font-size: 1.5em">
          Module Completed Successfully!
        </h2>
        </div>
        <p>
          Moved <strong>{{ movedModule.courseCode }}</strong> to completed modules 
          with a grade of <strong>{{ movedModule.grade || "ungraded" }}</strong>. 
          This module is now accessible through the completed modules tab.
        </p>
      <v-btn
        @click="showModal = false"
        :color="color"
        class="mt-5"
      >
        Finish
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Grade, Module, CompletedModule } from '../SheetTypes'
import { moveRowToRange, Range } from '../SheetsAPI'
import { unmapCompletedModules } from '../DataMappers'

const props = defineProps<{
  show: boolean;
  module: Module;
  color?: string;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const showModal = computed({
  get: () => props.show,
  set: (val) => {
    if (!val) {
      if (success.value) emits('success')
      emits('close')
    }
  },
});

const color = computed(() => props.color || 'orange-darken-2')

const grades: Grade[] = [
  null,
  'High Pass',
  'Pass',
  'Low Pass',
  'Fail'
]

const loading = ref(false);
const success = ref(false);
const movedModule = ref<CompletedModule>(null);
const completedModuleData = ref({
  completedDate: "",
  grade: null,
});

async function moveToCompleted() {
  loading.value = true
  movedModule.value = {
    ...props.module,
    ...completedModuleData.value
  }
  await moveRowToRange(
    Range.MODULES, 
    Range.COMPLETED_MODULES, 
    props.module.row, 
    unmapCompletedModules([movedModule.value])
  )
  loading.value = false
  success.value = true
}
</script>