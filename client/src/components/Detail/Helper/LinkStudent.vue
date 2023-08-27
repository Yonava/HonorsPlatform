<template>
  <v-sheet
    class="px-4"
    style="max-height: 700px; position: relative;"
  >
    <div class="d-flex flex-row align-center">
      <h1 class="my-2">
        Select {{ panel.title.singular }}:
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
        v-for="item in filteredItems"
        :key="item.sysId"
        @click="link(item.sysId)"
        class="d-flex flex-row align-center clickable"
      >
        <h2>
          {{ item.name || '(No Name)' }}
        </h2>
        <span style="font-size: 0.9rem;">
          ({{ item.id || 'No ID' }})
        </span>
      </div>
      <div
        v-if="filteredItems.length === 0 && filterQuery.length > 0"
        class="mt-1"
      >
        <h2 style="color: red">
          No {{ panel.title.plural }} Found
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
import { getPanel, type PanelName } from '../../../Panels'
import { SheetItem } from '../../../SheetTypes'

const { getItems, getItemBySysId } = useDocumentCache()

const filterQuery = ref('')

const props = defineProps<{
  props: {
    onUpdate: () => void,
    panelNames: PanelName | PanelName[],
  }
}>()

const panelNames = computed(() => {
  if (Array.isArray(props.props?.panelNames)) {
    return props.props?.panelNames
  } else {
    return [props.props?.panelNames]
  }
})

const panel = computed(() => {
  return getPanel(panelNames.value[0])
})

console.log(panel.value)

const items = computed(() => {
  const allItems = [] as SheetItem[]
  for (const panelName of panelNames.value) {
    const panelItems = getItems(panelName)
    allItems.push(...panelItems)
  }

  return allItems
})

const filteredItems = computed(() => {
  return filterItems(items.value, filterQuery.value)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const link = (sysId: string) => {
  const { focusedItemSysId } = useSheetManager()
  const itemToModify = getItemBySysId(focusedItemSysId)

  // if itemToModify does not have a studentSysId return and log an error
  if (itemToModify?.studentSysId === undefined) {
    console.error('Link Student: No studentSysId found on itemToModify')
    return
  }

  itemToModify.studentSysId = sysId
  props.props?.onUpdate()
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