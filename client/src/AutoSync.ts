import { onUnmounted, watch, ref } from "vue";
import type { Ref } from "vue";

const syncInterval = 3000;

export function useAutoSync(autoSync: Ref<boolean>, sync: () => void) {
  const interval = setInterval(() => {
    if (autoSync.value) {
      sync();
    }
  }, syncInterval);

  onUnmounted(() => {
    clearInterval(interval);
  });
}

export function useChangeWatcher(item: Ref<Object>) {
  let changeWatcher = () => {};
  const upToDate = ref(false)

  watch(item, () => {
    upToDate.value = false
  })

  watch(upToDate, (val) => {
    if (val) {
      changeWatcher = watch(item, () => {
        upToDate.value = false
      }, { deep: true })
    } else {
      changeWatcher()
    }
  })

  return {
    upToDate
  }
}