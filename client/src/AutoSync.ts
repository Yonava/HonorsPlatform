import { onUnmounted } from "vue";
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