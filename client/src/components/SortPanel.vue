<template>
  <div>
    <div class="d-flex flex-column align-center">
      <v-icon 
        icon="mdi-sort"  
      ></v-icon>
      <b style="font-size: 0.9rem;">
        Sort By
      </b>
      <div
        class="mt-2"
        style="background: white; width: 75%; height: 1px"
      ></div>
    </div>
    <div
      v-for="sort in sortOptions"
      :key="sort"
      @click="sortItems(sort)"
      class="sort-box d-flex justify-center align-center flex-column px-2"
      :style="{
        background: activeSort === sort ? 'rgba(255, 255, 255, 0.2)' : ''
      }"
    >
      <v-icon>{{ sort.icon() }}</v-icon>
      <p style="font-size: 0.9rem; line-height: 1.1; user-select: none">{{ sort.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  defineProps, 
  defineEmits,
  watch
} from 'vue'
import { SortOption, switchSortOptions } from '../SortOptions'
import { PanelType } from '../SwitchPanel'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  panelType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update'])

const activeSort = ref(undefined)

const itemList = computed({
  get: () => props.items,
  set: (val: any) => emit('update', val)
})

function sortItems(sort: SortOption) {
  if (activeSort.value === sort) {
    sort.ascending = !sort.ascending
  } else {
    activeSort.value = sort
  }
  itemList.value = itemList.value.sort(sort.func)
}

const sortOptions = ref<SortOption[]>([])
watch(() => props.panelType, (newPanelType: PanelType) => {
  sortOptions.value = switchSortOptions(newPanelType)
}, { immediate: true })
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
