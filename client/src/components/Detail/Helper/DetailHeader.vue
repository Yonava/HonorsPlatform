<template>
  <div>
    <v-sheet
      v-if="includedInDelete"
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
      <v-icon
        v-if="getSelectedItems().length > 1"
        @click.stop="removeFromSelected"
        class="mr-2 close"
        style="cursor: pointer;"
      >
        mdi-close
      </v-icon>
      <slot></slot>
      <v-spacer></v-spacer>
      <SyncStatus v-if="item.sysId === focusedItemSysId" />
    </div>
    <div
      v-if="getActivePanel.properties.title"
      class="d-flex flex-row align-center"
    >
      <DetailInput
        :input="{ type: 'title' }"
        :prop="getActivePanel.properties.title"
        :placeholder="placeholder"
      />
    </div>
    <v-divider class="my-2"></v-divider>
  </div>
</template>

<script setup lang="ts">
import SyncStatus from "./SyncStatus.vue";
import DetailInput from "./DetailInput.vue";
import { computed, ref, type Ref } from "vue";
import { useDialog } from '../../../store/useDialog';
import { useDocumentCache } from '../../../store/useDocumentCache';
import { useSheetManager } from "../../../store/useSheetManager";
import { storeToRefs } from "pinia";
import { SheetItem } from '../../../SheetTypes';

const { getPanelCover } = storeToRefs(useDialog());
const { focusedItemSysId, getFocusedItem, getActivePanel } = storeToRefs(useSheetManager());
const { getSelectedItems, removeSelectedItem } = useDocumentCache();

const item = ref(getFocusedItem.value ?? getSelectedItems()[0]) as Ref<SheetItem>;

const props = defineProps<{
  placeholder?: string;
}>();

const includedInDelete = computed(() => {
  return getPanelCover.value.selectedForDelete.some((sysId: string) => {
    return item.value.sysId === sysId
  });
});

const placeholder = computed(() => {
  return props.placeholder ?? "";
});

const removeFromSelected = () => {
  removeSelectedItem({
    item: item.value,
  })
}
</script>

<style scoped>
.close:hover {
  color: red;
}
</style>