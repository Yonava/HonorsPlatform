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
      {{ student.text }}
    </p>
    <v-tooltip
      :disabled="xs"
      activator="parent"
    >
      Link Student
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import LinkStudent from './LinkStudent.vue'
import LinkGraduate from './LinkGraduate.vue'
import { useStudentInfo } from '../../ListItem/useStudentInfo'
import { useDialog } from '../../../store/useDialog'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

const props = defineProps<{
  item: Object & { studentSysId: string },
  linkFrom?: 'students' | 'graduates'
}>()

const emits = defineEmits<{
  'update': [void]
}>()

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})

const linkStudent = () => {
  useDialog().open({
    component: {
      render: props.linkFrom === 'graduates' ? LinkGraduate : LinkStudent,
      props: {
        onUpdate: () => emits('update'),
      }
    },
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