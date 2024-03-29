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
        @click.stop
        placeholder="Quick Lookup"
        style="border: 1px solid black; border-radius: 50px; height: 40px; width: 50%;"
        class="px-3 py-1"
        type="text"
      />
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

        <h2
          class="mb-2"
          style="color: red"
        >
          No {{ panel.title.plural }} Found
        </h2>

        <v-btn
          v-if="panel.panelName === studentPanel.panelName && additionalPanel === null"
          @click="additionalPanel = graduatePanel.panelName"
          :color="graduatePanel.color + '-darken-1'"
        >
          <v-icon
            size="24"
            class="mr-2"
          >
            {{ graduatePanel.icon }}
          </v-icon>
          Try Searching In {{ graduatePanel.title.plural }}
        </v-btn>

        <v-btn
          v-else-if="panel.panelName === graduatePanel.panelName && additionalPanel === null"
          @click="additionalPanel = studentPanel.panelName"
          :color="studentPanel.color + '-darken-1'"
        >
          <v-icon
            size="24"
            class="mr-2"
          >
            {{ studentPanel.icon }}
          </v-icon>
          Try Searching In {{ studentPanel.title.plural }}
        </v-btn>

      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDialog } from '@store/useDialog'
import { useDocumentCache } from '@store/useDocumentCache'
import { useSheetManager } from '@store/useSheetManager'
import { useUpdateManager } from '@store/useUpdateManager'
import { useSocket } from '@store/useSocket'
import { getPanel, type PanelName } from '@panels'
import { filterItems } from '@utils/FilterObjects'

const studentPanel = getPanel('STUDENTS')
const graduatePanel = getPanel('GRADUATES')

const additionalPanel = ref<PanelName | null>(null)

const { getItems, getItemBySysId } = useDocumentCache()

const filterQuery = ref('')

const props = defineProps<{
  panelName: PanelName,
}>()

const panel = computed(() => {
  return getPanel(props.panelName)
})

const items = computed(() => {
  if (additionalPanel.value) {
    return [
      ...getItems(props.panelName) ?? [],
      ...getItems(additionalPanel.value) ?? [],
    ]
  }

  return getItems(props.panelName) ?? []
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

  const { trackItemForUpdate } = useUpdateManager()

  const { getActivePanel } = useSheetManager()
  trackItemForUpdate({
    item: itemToModify,
    panelName: getActivePanel.panelName,
  })

  itemToModify.studentSysId = sysId

  const { emitUserAction } = useSocket()
  emitUserAction({
    action: 'prop-update',
    payload: {
      panelName: getActivePanel.panelName,
      sysId: itemToModify.sysId,
      prop: 'studentSysId',
      value: itemToModify.studentSysId,
    }
  })

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