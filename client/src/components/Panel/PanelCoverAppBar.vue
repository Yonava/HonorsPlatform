<template>
  <v-app-bar
    :color="`${getActivePanel.color}-darken-2`"
    class="px-5"
  >
    <v-icon
      @click="setPanelCover('close')"
      icon="mdi-chevron-left"
      size="x-large"
      class="mr-2"
    ></v-icon>
    <h1>Suggestions</h1>
    <div>
      <input
        v-model="getPanelCover.filter"
        type="text"
        placeholder="search suggestions"
        class="ml-5 filter-input"
      >
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useDialog } from "../../store/useDialog";
import { useSheetManager } from "../../store/useSheetManager";

const { getPanelCover } = useDialog();
const { getActivePanel } = useSheetManager();
</script>

<style scoped>
.filter-input {
  background: rgba(0, 0, 0, 0.3);
  color: rgb(240, 240, 240);
  border-radius: 50px;
  padding: 3px;
  padding-left: 15px;
  border: none;
  font-size: 1.4em;
  width: 450px;
  font-weight: 200;
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
}

.filter-input:focus {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.filter-input:focus::placeholder {
  color: transparent;
}

.filter-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}
</style>