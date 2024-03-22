<template>
  <div>

    <!-- edit linked student -->
    <div
      v-if="!readOnlyMode"
      @click="linkStudent"
      :style="buttonStyle"
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

    <!-- view linked student -->
    <div
      v-else
      :style="buttonStyle"
      class="d-flex flew-row align-center read-only"
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
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useDialog } from '@store/useDialog'
import { useSheetManager } from '@store/useSheetManager'
import { useStudentInfo } from '@composables/useStudentInfo'
import LinkStudent from './LinkStudent.vue'

const { xs } = useDisplay()

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const props = defineProps<{
  item: Object & { studentSysId: string },
  linkFrom?: 'STUDENTS' | 'GRADUATES',
}>()

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})

const buttonStyle = computed(() => {
  if (student.value.error) {
    return {
      color: 'red',
      fontWeight: 'bold',
    }
  } else {
    return {}
  }
})

const linkStudent = () => {
  useDialog().open({
    component: LinkStudent,
    props: {
      panelName: props.linkFrom || 'STUDENTS',
    }
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

.read-only {
  transform: translateX(-8px);
  padding: 4px 8px 4px 8px;
  border-radius: 5px;
  cursor: default;
}

.clickable:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>