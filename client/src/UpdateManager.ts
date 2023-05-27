import { updateByRow } from "./SheetsAPI";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import type { Panel } from "./SwitchPanel";
import { watch, provide, ref, onUnmounted } from "vue";

export function useUpdateManager(
  selectedItemRef: Ref<SheetItem>,
  panel: Ref<Panel<SheetItem>>,
  fetchItems: () => Promise<void>,
) {

  const syncState = ref<SyncState>({
    status: true,
    processing: false,
    lastSynced: new Date()
  });
  provide('syncState', syncState);

  let startingItem = '';
  let switchedStudentProfile = false;

  const updateItem = async () => {

    // for fetch interval
    if (syncState.value.status) {
      return;
    }

    if (syncState.value.processing || !selectedItemRef.value) {
      return;
    }
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
    if (!newItem) {
      return;
    }
    startingItem = JSON.stringify(newItem);
  });

  watch(selectedItemRef, async (newItem, oldItem) => {
    switchedStudentProfile = newItem !== oldItem;
    if (switchedStudentProfile) {
      syncState.value = {
        status: true,
        processing: false,
        lastSynced: new Date()
      }
    } else {
      syncState.value.status = false;
    }
  }, { deep: true });

  const syncInterval = setInterval(async () => {
    if (syncState.value.status) {
      return;
    }
    await updateItem();
  }, 3500);

  onUnmounted(() => {
    clearInterval(syncInterval);
  });

  return {
    syncState,
  }
}