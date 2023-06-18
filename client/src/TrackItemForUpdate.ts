import { useSheetManager } from "./store/useSheetManager";
import { storeToRefs } from "pinia";
import { useSyncState } from "./store/useSyncState";
import { useDocumentCache } from "./store/useDocumentCache";
import { watch } from "vue";
import type { Ref } from "vue";

export function useUpdateItem(item: Ref<any>) {
  const { updateItem } = useSheetManager();
  const { panel } = storeToRefs(useSheetManager());
  const { removeItemBySysId } = useDocumentCache();
  const { setProcessing } = useSyncState();

  let timeout = setTimeout(() => { }, 0)
  watch(item, async (newItem, oldItem) => {
    if (oldItem.row === null) {
      const { sysId, row, ...rest } = oldItem
      // creates a new item to test if the item is the same as the default item, if it is, that means the user has not changed anything and we can nuke it
      const [defaultItem] = await panel.value.mappers.map([['sysId']])
      const { sysId: newSysId, row: newRow, ...newRest } = defaultItem
      if (JSON.stringify(rest) === JSON.stringify(newRest)) {
        removeItemBySysId(sysId)
        return
      }
    }
    if (newItem !== oldItem) {
      return
    }
    setProcessing(true)
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      await updateItem(newItem)
    }, 2000)
  }, { deep: true })
}