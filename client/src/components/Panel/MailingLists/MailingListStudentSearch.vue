<template>
  <input
    v-model="search"
    @click.stop
    placeholder="Lookup Students or Graduates"
    style="border: 1px solid black; border-radius: 50px; height: 40px; width: 50%;"
    class="px-3 py-1 mb-4"
    type="text"
  />

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
    <h3
      v-if="!filteredStudents.length"
      class="text-red"
    >
      Cannot Find A Match For Your Search "{{ search }}"
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Student, Graduate } from '@apptypes/sheetItems';
import { filterItems } from '@utils/FilterObjects';

const search = ref('')
const hoveredStudentSysId = ref('')

const props = defineProps<{
  students: (Student | Graduate)[],
  recipientSysIds: Set<string>,
  color: string
}>()

const emits = defineEmits([
  'selected'
])

const filteredStudents = computed(() => filterItems(props.students, search.value))

const color = <T extends { sysId: string }>(student: T) => {
  if (props.recipientSysIds.has(student.sysId) && hoveredStudentSysId.value == student.sysId) {
    return `${props.color}-darken-2`
  } else if (props.recipientSysIds.has(student.sysId)) {
    return `${props.color}-darken-1`
  } else if (hoveredStudentSysId.value == student.sysId) {
    return 'grey-lighten-1'
  } else {
    return 'grey-lighten-2'
  }
}
</script>