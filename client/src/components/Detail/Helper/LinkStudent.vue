<template>
  <v-sheet
    class="px-4"
    style="max-height: 700px; position: relative;"
  >
    <div class="d-flex flex-row align-center">
      <h1 class="my-2">
        Select {{ studentPanel.title.singular }}:
      </h1>
      <v-spacer></v-spacer>
      <input
        v-model="filterQuery"
        placeholder="Quick Lookup"
        style="border: 1px solid black; border-radius: 50px; height: 40px; width: 50%;"
        class="px-3 py-1"
        type="text"
      >
    </div>
    <div
      class="mb-6"
      style="overflow: auto; height: 420px;"
    >
      <div
        v-for="student in filteredItems.sort((a, b) => a.name.localeCompare(b.name))"
        :key="student.sysId"
        @click="studentLinked(student.sysId)"
        class="d-flex flex-row align-center clickable"
      >
        <h2>
          {{ student.name || '(No Name)' }}
        </h2>
        <span style="font-size: 0.9rem;">
          ({{ student.id || 'No ID' }})
        </span>
      </div>
      <div
        v-if="filteredItems.length === 0 && filterQuery.length > 0"
        class="mt-1"
      >
        <h2 style="color: red">
          No {{ studentPanel.title.plural }} Found
        </h2>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../../../store/useDialog'
import { useDocumentCache } from '../../../store/useDocumentCache'
import { useSheetManager } from '../../../store/useSheetManager'
import { filterItems } from '../../../FilterObjects'
import { ref, computed } from 'vue'
import { getPanel } from '../../../Panels'

const { Students, getItemBySysId } = useDocumentCache()

const studentPanel = getPanel('STUDENTS')

const filterQuery = ref('')

const props = defineProps<{
  props: {
    onUpdate: () => void
  }
}>()

const filteredItems = computed(() => {
  return filterItems(
    [...Students.list].filter(item => !!item.name || !!item.id),
    filterQuery.value
  )
})

const studentLinked = (sysId: string) => {
  const { focusedItemSysId } = useSheetManager()
  const itemToModify = getItemBySysId(focusedItemSysId)

  // if itemToModify does not have a studentSysId return and log an error
  if (!itemToModify?.studentSysId === undefined) {
    console.error('Link Student: No studentSysId found on itemToModify')
    return
  }

  itemToModify.studentSysId = sysId
  props.props?.onUpdate()
  console.log('closing')
  useDialog().close()
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s;
  padding: 5px;
  gap: 10px;
}

.clickable:hover {
  background-color: #e0e0e0;
}
</style>