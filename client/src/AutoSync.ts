import { onUnmounted, inject } from "vue";
import type { Ref } from "vue";

const syncIntervalDefault = 3000;

export function useAutoSync(
  sync: () => Promise<void>, 
  syncInterval: number = syncIntervalDefault
) {
  const autoSync = inject("autoSync") as Ref<boolean>;

  const interval = setInterval(() => {
    if (autoSync.value) {
      sync();
    }
  }, syncInterval);

  onUnmounted(() => {
    clearInterval(interval);
  });
}