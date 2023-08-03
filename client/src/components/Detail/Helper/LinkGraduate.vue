<template>
  <v-sheet class="px-4">
    <h1 class="my-2">
      Select Graduate:
    </h1>
    <div
      class="mb-6"
      style="overflow: auto; max-height: 600px;"
    >
      <div
        v-for="graduate in filteredItems.sort((a, b) => a.name.localeCompare(b.name))"
        :key="graduate.sysId"
        @click="graduateLinked(graduate.sysId)"
        class="d-flex flex-row align-center clickable"
      >
        <h2>
          {{ graduate.name || '(No Name)' }}
        </h2>
        <span style="font-size: 0.9rem;">
          ({{ graduate.id || 'No ID' }})
        </span>
      </div>
      <div
        v-if="filteredItems.length === 0 && filterQuery.length > 0"
        class="mt-1"
      >
        <h2 style="color: red">
          No Graduates Found
        </h2>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { filterItems } from '../../../FilterObjects';
import { ref, computed } from 'vue';
import { useDialog } from '../../../store/useDialog'
import { useDocumentCache } from '../../../store/useDocumentCache'
import { useSheetManager } from '../../../store/useSheetManager'

const { Graduates, getItemBySysId } = useDocumentCache()

const filterQuery = ref('')

const props = defineProps<{
  props: {
    onUpdate: () => void
  }
}>()

const filteredItems = computed(() => {
  return filterItems(
    [...Graduates.list].filter(item => !!item.name || !!item.id),
    filterQuery.value
  )
})

const graduateLinked = (sysId: string) => {
  const { focusedItemSysId } = useSheetManager()
  const itemToModify = getItemBySysId(focusedItemSysId)

  // if itemToModify does not have a studentSysId return and log an error
  if (!itemToModify?.studentSysId === undefined) {
    console.error('Link Student: No studentSysId found on itemToModify')
    return
  }

  itemToModify.studentSysId = sysId
  props.props.onUpdate()
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