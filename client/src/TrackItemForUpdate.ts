import { useSheetManager } from "./store/useSheetManager";
import { storeToRefs } from "pinia";
import { useSyncState } from "./store/useSyncState";
import { watch } from "vue";
import type { Ref } from "vue";

export function useUpdateItem(item: Ref<any>) {
  const { updateItem, setItems } = useSheetManager();
  const { items, panel } = storeToRefs(useSheetManager());
  const { setProcessing } = useSyncState();

  let timeout = setTimeout(() => { }, 0)
  watch(item, async (newItem, oldItem) => {
    if (oldItem.row === null) {
      const { sysId, row, ...rest } = oldItem
      // creates a new item to test if the item is the same as the default item, if it is, that means the user has not changed anything and we can nuke it
      const [defaultItem] = await panel.value.mappers.map([['sysId']])
      const { sysId: newSysId, row: newRow, ...newRest } = defaultItem
      if (JSON.stringify(rest) === JSON.stringify(newRest)) {
        setItems([...items.value].filter(i => i.sysId !== oldItem.sysId))
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