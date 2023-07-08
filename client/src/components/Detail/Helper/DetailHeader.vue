<template>
  <div>

    <v-sheet
      v-if="getPanelCover.selectedForDelete.includes(getSelectedItem().sysId)"
      color="red"
      elevation="2"
      class="px-4 mb-2 d-flex flex-row align-center"
      style="border-radius: 50px; gap: 5px;"
    >
      <v-icon size="x-small">
        mdi-alert
      </v-icon>
      <p>
        Marked For Deletion
      </p>
    </v-sheet>

    <div class="d-flex flex-row align-center">
      <p style="font-weight: 200">
        {{ id }}
      </p>
      <slot></slot>
      <v-spacer></v-spacer>
      <SyncStatus />
    </div>
    <div class="d-flex flex-row align-center">
      <input
        v-model="title"
        :placeholder="placeholder"
        type="text"
        class="header-input"
      >
    </div>
    <v-divider class="my-2"></v-divider>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDialog } from '../../../store/useDialog';
import { useDocumentCache } from '../../../store/useDocumentCache';
import { storeToRefs } from "pinia";
import SyncStatus from "./SyncStatus.vue";

const { getPanelCover } = storeToRefs(useDialog());
const { getSelectedItem } = useDocumentCache();

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  id?: string;
}>();

const emits = defineEmits([
  "update:modelValue",
]);

const title = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emits("update:modelValue", value);
  },
});

const placeholder = computed(() => {
  return props.placeholder ?? "";
});

const id = computed(() => {
  return props.id ?? "";
});
</script>

<style scoped>
input.header-input {
  font-weight: 900;
  font-size: 3em;
  line-height: 0.9;
  width: 100%;
}

input.header-input:focus {
  outline: none;
}
</style>