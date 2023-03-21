<template>
  <div style="width: 100%">
    <div
      v-if="!loading"
      style="position: relative; width: 100%"
      class="d-flex flex-column align-center mt-2"
    >
      <div
        v-for="student in students"
        :key="student"
        @click="selectedStudent = student"
        :class="[
          'mb-2',
          'student-card',
          selectedStudent === student ? 'selected-student-card' : ''
        ]"
      >
        <div style="font-weight: 900; font-size: 1.25em;">
          {{ student.name || '(No Name)' }}
        </div>
        <div style="font-size: 0.9em;">
          {{ student.id || '(No ID)' }} - 
          {{ student.email || '(No Email)' }} - 
          {{ student.activeStatus || '(No Active Status)' }}
        </div>
      </div>
      <div v-if="students.length === 0">
        <div class="d-flex justify-center">
          no students in system
        </div>
      </div>
    </div>
    <div v-else-if="loading">
      <div class="d-flex justify-center">
        <v-progress-circular 
          color="blue darken-4"
          size="32"
          indeterminate
          class="mt-12" 
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ref, 
  defineProps,
  defineEmits,
  computed
} from 'vue'

const props = defineProps({
  students: {
    type: Array,
    required: true
  },
  selected: {
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits(['select'])

const selectedStudent = computed({
  get: () => props.selected,
  set: student => emits('select', student)
})

</script>

<style scoped>
.student-card {
  width: 92%;
  background: rgba(255,255,255, 0.5);
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: 350ms;
}

.selected-student-card {
  background: rgba(255,255,255, 0.7);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.student-card:hover {
  background: rgba(255,255,255, 0.7);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  transform: scale(0.98)
}
</style>