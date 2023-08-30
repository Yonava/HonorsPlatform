<template>
  <div
    v-if="getActivePanel.sortOptions.length > 0"
    style="width: 100%"
  >
    <div class="d-flex flex-column align-center">
      <v-icon>
        mdi-sort
      </v-icon>
      <p style="font-size: 0.9rem; font-weight: 900">
        Sort By
      </p>
      <div
        class="mt-2"
        style="background: white; width: 75%; height: 1px"
      ></div>
    </div>
    <div>
      <div
        v-for="sortOption in getActivePanel.sortOptions"
        :key="sortOption.label"
        @click="setSort(sortOption.func, sortOption.prop)"
        :style="{
          transition: 'background 200ms ease-in-out',
          background: isSelected(sortOption) ? 'rgba(255, 255, 255, 0.1)' : '',
        }"
        class="sort-box d-flex justify-center align-center flex-column"
      >
        <v-icon v-if="isSelected(sortOption)">
          {{ activeSort.ascending ? sortOption.icon.asc : sortOption.icon.desc }}
        </v-icon>
        <v-icon v-else>
          {{ sortOption.icon.asc }}
        </v-icon>
        <p style="font-size: 0.9rem; line-height: 1.1; user-select: none">
          {{ sortOption.label }}
        </p>
        <v-tooltip
          activator="parent"
          :disabled="xs || isSelected(sortOption)"
        >
          {{ sortOption.tooltip }}
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSheetManager } from "../../store/useSheetManager";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { ref } from "vue";

const { xs } = useDisplay();

const sheetManager = useSheetManager();
const { setSort: setSortPinia } = sheetManager;
const { activeSort, getActivePanel } = storeToRefs(sheetManager);

const ascending = ref(true);

const setSort = (func: (a: any, b: any) => number, prop: string) => {
  setSortPinia({
    func,
    prop,
    ascending: ascending.value,
  });
  ascending.value = !ascending.value;
};

const isSelected = (sort) => activeSort.value.func === sort.func;
</script>

<style scoped>
.sort-box {
  width: 100%;
  height: 65px;
  cursor: pointer;
  text-align: center;
}

.sort-box:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
