<template>
  <v-sheet class="pa-5">
    <v-sheet v-if="loading">
      <h1>
        Incrementing Student Year...
      </h1>
      <v-progress-linear
        v-if="loading"
        indeterminate
      ></v-progress-linear>
    </v-sheet>
    <v-sheet v-else>
      <h1>
        Done Incrementing Student Year!
      </h1>
      <div style="overflow: auto; height: 500px;">
        <div v-if="graduatingSeniors.length">
          <h2>
            Congratulations to the following students who have graduated:
          </h2>
          <div
            v-for="senior in graduatingSeniors"
            :key="senior.sysId"
            class="d-flex flex-wrap"
          >
            {{ senior.name }}
          </div>
        </div>
        <div v-if="failedToIncrement.length">
          <h2>
            Unfortunately, the following students failed to increment (year must either be 'Freshman', 'Sophomore', 'Junior', or 'Senior' to increment):
          </h2>
          <div
            v-for="failure in failedToIncrement"
            :key="failure.sysId"
          >
            {{ failure.name }} - Year: {{ failure.year }}
          </div>
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
import { incrementStudentYear } from '../StudentTools'
import type { Student } from '../SheetTypes'
import { useDialog } from '../store/useDialog'
import { useSheetManager } from '../store/useSheetManager'
import { ref } from 'vue'

const { fetchItems } = useSheetManager()
const { close } = useDialog()

const loading = ref(true)
const graduatingSeniors = ref<Student[]>([])
const failedToIncrement = ref<Student[]>([])

incrementStudentYear().then(({ failedToIncrement: failed, graduatingSeniors: graduated }) => {
  fetchItems()
  graduatingSeniors.value = graduated
  failedToIncrement.value = failed
  loading.value = false
})
</script>