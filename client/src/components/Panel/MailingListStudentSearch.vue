<template>
  <v-text-field
    v-model="search"
    class="mt-2"
    label="Students or Graduates"
    variant="solo"
  ></v-text-field>
  <div
    class="d-flex flex-column mb-4"
    style="height: 200px; overflow: auto; gap: 5px; user-select: none"
  >
    <v-sheet
      v-for="student in filteredStudents"
      @click="emits('selected', student)"
      @mouseenter="hoveredStudentSysId = student.sysId"
      @mouseleave="hoveredStudentSysId = ''"
      :key="student.sysId"
      :color="color(student)"
      class="d-flex align-center justify-space-between py-2 px-3 student-list-item"
      style="border-radius: 5px; cursor: pointer"
    >
      <h3>
        {{ student.name || "(No Name)" }}
        <span style="font-size: 0.75rem">
          ({{ student.id || "No ID" }})
        </span>
      </h3>
      <h5>
        {{ student.email || "No Email" }}
      </h5>
    </v-sheet>
    <h3 v-if="!filteredStudents.length" class="text-red">
      Cannot Find A Match For Your Search "{{ search }}"
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Student, Graduate } from '../../SheetTypes';
import { filterItems } from '../../FilterObjects';

const search = ref('')
const hoveredStudentSysId = ref('')

const props = defineProps<{
  students: (Student | Graduate)[],
  recipientSysIds: Set<string>,
}>()

const emits = defineEmits([
  'selected'
])

const filteredStudents = computed(() => filterItems(props.students, search.value))

const color = <T extends { sysId: string }>(student: T) => {
  if (props.recipientSysIds.has(student.sysId) && hoveredStudentSysId.value == student.sysId) {
    return 'blue-darken-2'
  } else if (props.recipientSysIds.has(student.sysId)) {
    return 'blue-darken-1'
  } else if (hoveredStudentSysId.value == student.sysId) {
    return 'grey-lighten-1'
  } else {
    return 'grey-lighten-2'
  }
}
</script>