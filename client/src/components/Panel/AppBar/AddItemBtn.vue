<template>
  <div>
    <NavDrawerBlockBtn
      @click="action"
      :style="style"
      :icon="icon"
    >
      {{ text }}
    </NavDrawerBlockBtn>
  </div>
</template>

<script setup lang="ts">
import { useSheetManager } from '@store/useSheetManager';
import { useDocumentCache } from '@store/useDocumentCache';
import { storeToRefs } from 'pinia';
import NavDrawerBlockBtn from './NavDrawerBlockBtn.vue';
import { computed, ref, watch } from 'vue';
import { useKeyBindings } from '../../../KeyBindings';

const { getActivePanel } = storeToRefs(useSheetManager());
const { addItem } = useDocumentCache();

const success = ref(false);

const text = computed(() => `Add ${getActivePanel.value.title.singular}`)
const icon = computed(() => success.value ? 'mdi-check' : 'mdi-plus')
const style = computed(() => (success.value ? { background: 'rgb(34, 159, 34)' } : {}))

const action = async () => {
  if (success.value) return;
  try {
    await addItem();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to add item');
  }
  success.value = true;
  setTimeout(() => success.value = false, 2000);
}

useKeyBindings({ 'a': action })

watch(getActivePanel, () => success.value = false)
</script>