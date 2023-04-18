import { updateByRow } from "./SheetsAPI";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import type { Panel } from "./SwitchPanel";
import { watch, provide, ref, onUnmounted } from "vue";

export type SyncState = {
  status: boolean;
  processing: boolean;
  lastSynced: Date;
}

export function useUpdateManager(selectedItemRef: Ref<SheetItem>, panel: Ref<Panel<SheetItem>>) {

  const syncState = ref<SyncState>({
    status: false,
    processing: false,
    lastSynced: new Date()
  });
  provide('syncState', syncState);

  let startingItem = '';
  let switchedStudentProfile = false;

  async function updateItem() {
    if (syncState.value.processing || !selectedItemRef.value) return;
    syncState.value.processing = true;
    await updateByRow(
      panel.value.sheetRange, 
      selectedItemRef.value.row, 
      await panel.value.mappers.unmap([
        selectedItemRef.value
      ])
    )
    startingItem = JSON.stringify(selectedItemRef.value);
    syncState.value = {
      status: true,
      processing: false,
      lastSynced: new Date()
    }
  }

  watch(selectedItemRef, async (newItem, oldItem) => {
    if (!oldItem) {
      startingItem = JSON.stringify(newItem);
      return;
    };
    if (startingItem !== JSON.stringify(oldItem))  {
      await updateByRow(
        panel.value.sheetRange, 
        oldItem.row, 
        await panel.value.mappers.unmap([
          oldItem
        ])
      )
    }
    if (!newItem) return;
    startingItem = JSON.stringify(newItem);
  });

  watch(selectedItemRef, async (newItem, oldItem) => {
    switchedStudentProfile = newItem !== oldItem;
    syncState.value.status = false;
  }, { deep: true });

  const syncInterval = setInterval(async () => {
    if (syncState.value.status || switchedStudentProfile) return;
    await updateItem();
  }, 3500);

  onUnmounted(() => {
    clearInterval(syncInterval);
  });
}