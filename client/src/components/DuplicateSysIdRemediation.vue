<template>
  <v-sheet class="px-5 py-3">

    <h1>
      Duplicate SysId Remediation
    </h1>

    <p>
      Below {{ duplicateSysIds.length === 1 ? 'is' : 'are' }} the {{ duplicateSysIds.length }} duplicate sysId{{ duplicateSysIds.length === 1 ? '' : 's' }} found along with their corresponding items. By clicking, you may review the items to determine which to remove. SysId conflicts are often the result of a bug, bugs can be reported <a href="https://github.com/Yonava/HonorsPlatform/issues" target="_blank">here</a>.
    </p>

    <v-divider class="mt-3"></v-divider>

    <div
      :style="{
        overflowY: 'auto',
        maxHeight: '500px',
      }"
      class="pb-3"
    >
      <div
        v-for="sysId in duplicateSysIds"
        :key="sysId"
      >
        <h3 class="my-2">
          Items For SysId {{ sysId }}:
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

            <v-dialog
              v-model="item.dialog"
              max-width="550"
            >

              <template v-slot:activator="{ props }">

                <v-btn
                  v-bind="props"
                  :color="panels[item.panelName].color + '-darken-1'"
                  rounded
                >
                  {{ title(item) }}
                </v-btn>

              </template>

              <v-sheet
                :color="panels[item.panelName].color"
                style="width: 100%; height: 15px; border-radius: 10px 10px 0px 0px;"
              ></v-sheet>

              <v-sheet
                class="pa-4"
                style="border-radius: 0px 0px 10px 10px;"
              >

                <h1>
                  {{ panels[item.panelName].title.singular }} - {{ title(item) }}
                </h1>

                <v-divider class="mt-2"></v-divider>

                <div
                  :style="{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                  }"
                  class="py-2"
                >
                  <div
                    v-for="(headerField, index) in headerRow(item)"
                    :key="headerField"
                  >
                    <div>

                      <div>
                        <strong>
                          {{ headerField }}:
                        </strong>
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

                <v-divider></v-divider>

                <div class="d-flex flex-row mt-4">
                  <v-btn
                    @click="item.dialog = false"
                    :disabled="removingItem || !item.dialog"
                    :color="panels[item.panelName].color + '-darken-1'"
                  >
                    Done
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="removeItemFromSystem(item)"
                    :disabled="readOnlyMode"
                    :loading="removingItem || !item.dialog"
                    color="red"
                  >
                    Remove {{ title(item) }}
                  </v-btn>
                </div>

              </v-sheet>

            </v-dialog>

          </div>
        </div>
      </div>

      <div
        v-if="duplicateSysIds.length === 0"
        class="mt-3 d-flex align-center"
      >
        <h3
          class="my-2"
          style="color: green;"
        >
          <v-icon>
            mdi-check
          </v-icon>
          No Duplicate SysIds Found
        </h3>
      </div>

    </div>

    <v-divider></v-divider>

    <v-btn
      @click="close"
      :loading="syncing"
      block
      class="mt-4"
      variant="outlined"
      color="red"
    >
      Done Remediating
    </v-btn>

  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { panels, type PanelName } from '../Panels';
import type { SheetItem } from '../SheetTypes';
import { useDocumentCache } from '../store/useDocumentCache';
import { headerRowMemo } from '../SheetsAPI';
import { mappers } from '../DataMappers';
import { clearByRowData } from '../SheetsAPI';
import { useSheetManager } from '../store/useSheetManager';
import { useDialog } from '../store/useDialog';
import { storeToRefs } from 'pinia';

const sheetManager = useSheetManager();
const { readOnlyMode } = storeToRefs(sheetManager);

// panelName where the item is found + conflictId as a replacement to discern separate items with the same sysId
type SheetItemWithPanelName = SheetItem & { panelName: PanelName, conflictId: string, dialog: boolean }

const duplicateSysIds = ref<string[]>([])
const allItems = ref<SheetItemWithPanelName[]>([])
const removingItem = ref(false)
const itemHasBeenRemoved = ref(false)
const syncing = ref(false)

const headerRow = (item: SheetItemWithPanelName) => {
  const panel = panels[item.panelName]
  const { sheetRange } = panel
  return headerRowMemo[sheetRange] ?? []
}

const unmappedItem = (item: SheetItemWithPanelName) => {
  const { panelName, conflictId, ...rest } = item
  const unmapped = mappers[panelName].unmap([rest])
  return unmapped[0]
}

const getAllItems = () => {
  const { getItems } = useDocumentCache()
  const panelNames = Object.keys(panels) as PanelName[]
  const items = panelNames.reduce((acc, panelName) => {
    const panelItems = getItems(panelName)
      .map(item => ({
        ...item,
        panelName,
        conflictId: Math.random().toString(36).substring(7),
        dialog: false,
      }))
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
  return item[title] || '(Untitled)'
}

const removeItemFromSystem = async (item: SheetItemWithPanelName,) => {

  if (removingItem.value) {
    return
  }

  removingItem.value = true
  try {
    await clearByRowData(panels[item.panelName].sheetRange, unmappedItem(item))
    item.dialog = false
    allItems.value = allItems.value.filter(i => i.conflictId !== item.conflictId)
    itemHasBeenRemoved.value = true
  } catch (error) {
    console.error(error)
  } finally {
    removingItem.value = false
  }

}

const close = async () => {
  syncing.value = true
  if (itemHasBeenRemoved.value) {
    await useDocumentCache().forceConnectedClientsToRefresh()
  }
  useDialog().close()
}
</script>