<template>
  <div 
    v-if="sortOptions.length > 0"
    class="pa-2"
    style="width: 100%"
  >
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
      v-for="(sort, index) in sortOptions"
      :key="sort"
      @click="sortItems(sort, index)"
      class="mt-1 sort-box d-flex justify-center align-center flex-column px-2"
      :style="{
        background: activeSort === sort ? 'rgba(255, 255, 255, 0.2)' : '',
        borderRadius: '10px'
      }"
    >
      <v-icon>
        {{ activeIcons[index] }}
      </v-icon>
      <p style="font-size: 0.9rem; line-height: 1.1; user-select: none">
        {{ sort.label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  watch
} from 'vue'
import { SortOption, switchSortOptions } from '../../SortOptions'
import { PanelType } from '../../SwitchPanel'
import { SheetItem } from '../../SheetTypes'

const props = defineProps<{
  items: SheetItem[],
  panelType: PanelType
}>()

const emit = defineEmits(['update'])

const activeSort = ref(undefined)
const ascending = ref(true)

const itemList = computed({
  get: () => props.items,
  set: val => emit('update', val)
})

function sortItems(sort: SortOption<SheetItem>, index: number) {
  if (activeSort.value === sort) {
    ascending.value = !ascending.value
  } else {
    activeSort.value = sort
  }
  itemList.value = [...itemList.value].sort(sort.func[ascending.value ? 'asc' : 'desc'])
  activeIcons.value[index] = sort.icon[ascending.value ? 'asc' : 'desc']
}

const sortOptions = ref<SortOption<SheetItem>[]>([])
const activeIcons = ref<string[]>([])

watch(() => props.panelType, newVal => {
  activeSort.value = undefined
  sortOptions.value = switchSortOptions(newVal)
  activeIcons.value = sortOptions.value.map(sort => sort.icon.asc)
}, { immediate: true })

watch(() => props.items, () => {
  if (activeSort.value) {
    console.log('actively sorting')
    itemList.value.sort(activeSort.value.func[ascending.value ? 'asc' : 'desc'])
  }
})
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
