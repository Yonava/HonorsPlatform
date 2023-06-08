<template>
  <div
    v-if="panel.sortOptions.length > 0"
    class="pa-2"
    style="width: 100%"
  >
    <div class="d-flex flex-column align-center">
      <v-icon icon="mdi-sort"></v-icon>
      <b style="font-size: 0.9rem"> Sort By </b>
      <div
        class="mt-2"
        style="background: white; width: 75%; height: 1px"
      ></div>
    </div>
    <div>
      <div
        v-for="sortOption in panel.sortOptions"
        :key="sortOption.label"
        @click="setSort(sortOption.func)"
        :style="{
          background: isSelected(sortOption) ? 'rgba(255, 255, 255, 0.2)' : '',
          borderRadius: '10px',
        }"
        class="mt-1 sort-box d-flex justify-center align-center flex-column px-2"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSheetManager } from "../../store/useSheetManager";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const sheetManager = useSheetManager();
const { setSort: setSortPinia } = sheetManager;
const { activeSort, panel } = storeToRefs(sheetManager);

const ascending = ref(true);
const setSort = (func: (a: any, b: any) => number) => {
  setSortPinia({
    func,
    ascending: ascending.value
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
