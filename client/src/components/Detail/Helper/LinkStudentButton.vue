<template>
  <div
    @click="linkStudent"
    :style="linkFrom === 'graduates' ? '' : student.style"
    class="d-flex flew-row align-center clickable"
  >
    <v-icon
      class="mr-1"
      style="opacity: 0.75"
    >
      {{ student.icon }}
    </v-icon>
    <p>
      {{ student.text }} {{  getSelectedItem().studentSysId }}
    </p>
    <v-tooltip activator="parent">
      Link Student
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import LinkStudent from './LinkStudent.vue'
import LinkGraduate from './LinkGraduate.vue'
import { useStudentInfo } from '../../ListItem/useStudentInfo'
import { useDialog } from '../../../store/useDialog'
import { useDocumentCache } from '../../../store/useDocumentCache'
import { computed } from 'vue'

const { getSelectedItem } = useDocumentCache()

const props = defineProps<{
  linkFrom?: 'students' | 'graduates'
}>()

const student = computed(() => {
  const selectedItem = getSelectedItem()
  const { studentInfo } = useStudentInfo(selectedItem.studentSysId)
  return studentInfo.value
})

const linkStudent = () => {
  useDialog().open({
    component: props.linkFrom === 'graduates' ? LinkGraduate : LinkStudent,
  })
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
  transition: 0.3s;
  transform: translateX(-8px);
  padding: 4px 8px 4px 8px;
  border-radius: 5px;
}

.clickable:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>