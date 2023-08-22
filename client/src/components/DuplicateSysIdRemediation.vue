<template>
  <v-sheet class="px-5 py-3">
    <h1>
      Duplicate SysId Remediation
    </h1>
    <p>
      Below are all the {{ duplicateSysIds.length }} duplicate sysId{{ duplicateSysIds.length === 1 ? '' : 's' }} found along with their corresponding items. By clicking, you may review the items carefully to determine which to remove.
    </p>
    <v-divider class="my-3"></v-divider>
    <div
      v-for="sysId in duplicateSysIds"
      :key="sysId"
    >
      <h3 class="my-2">
        Items For SysId "{{ sysId }}":
      </h3>
      <div
        class="d-flex flex-row"
        :style="{
          gap: '10px',
          flexWrap: 'wrap',
        }"
      >
        <div
          v-for="item in allItems.filter(item => item.sysId === sysId)"
          :key="item.sysId"
        >

          <v-dialog max-width="550">

            <template v-slot:activator="{ props }">

              <v-btn
                v-bind="props"
                :color="panels[item.panelName].color + '-darken-1'"
                rounded
              >
                {{ title(item) || '(Untitled)' }}
              </v-btn>

            </template>

            <v-sheet class="pa-4">

                <h1>
                  {{ panels[item.panelName].title.singular }} - {{ title(item) || '(Untitled)' }}
                </h1>

                <v-divider class="my-2"></v-divider>

                <div
                  :style="{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                  }"
                >
                  <div
                    v-for="(headerField, index) in headerRow(item)"
                    :key="headerField"
                  >
                    <div>
                      <div>
                        <strong>{{ headerField }}:</strong>
                      </div>
                      <div v-if="unmappedItem(item)[index]">
                        {{ unmappedItem(item)[index] }}
                      </div>
                      <div
                        v-else
                        style="color: red;"
                      >
                        (No {{ headerField }})
                      </div>
                    </div>
                  </div>
                </div>

            </v-sheet>

          </v-dialog>

        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { panels, type PanelName } from '../Panels';
import type { SheetItem } from '../SheetTypes';
import { useDocumentCache } from '../store/useDocumentCache';
import { headerRowMemo } from '../SheetsAPI';
import { mappers } from '../DataMappers';

type SheetItemWithPanelName = SheetItem & { panelName: PanelName }

const duplicateSysIds = ref<string[]>([])
const allItems = ref<SheetItemWithPanelName[]>([])

const headerRow = (item: SheetItemWithPanelName) => {
  const panel = panels[item.panelName]
  const { sheetRange } = panel
  return headerRowMemo[sheetRange] ?? []
}

const unmappedItem = (item: SheetItemWithPanelName) => {
  const { panelName, ...rest } = item
  const unmapped = mappers[panelName].unmap([rest])
  return unmapped[0]
}

const getAllItems = () => {
  const { getItems } = useDocumentCache()
  const panelNames = Object.keys(panels) as PanelName[]
  const items = panelNames.reduce((acc, panelName) => {
    const panelItems = getItems(panelName)
      .map(item => ({ ...item, panelName }))
    return [...acc, ...panelItems]
  }, [] as SheetItemWithPanelName[])

  return items
}

const getDuplicateSysIds = () => {
  const seenSysIds = new Set<string>()
  const duplicateSysIds = new Set<string>()

  allItems.value.forEach(item => {
    if (seenSysIds.has(item.sysId)) {
      duplicateSysIds.add(item.sysId)
    } else {
      seenSysIds.add(item.sysId)
    }
  })

  return Array.from(duplicateSysIds)
}

allItems.value = getAllItems()
duplicateSysIds.value = getDuplicateSysIds()

const title = (item: SheetItemWithPanelName) => {
  const panel = panels[item.panelName]
  const { properties } = panel
  const { title } = properties
  return item[title]
}
</script>