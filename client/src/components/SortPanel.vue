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
      @click="sortStudents(sort)"
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
import { ref, computed, defineProps, defineEmits } from 'vue'

type SortOption = {
  label: string,
  icon: () => string,
  ascending: boolean,
  func: (a: any, b: any) => number
}

const props = defineProps({
  students: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update'])

const activeSort = ref(undefined)

const studentList = computed({
  get: () => props.students,
  set: (val: any) => emit('update', val)
})

function sortStudents(sort: SortOption) {
  if (activeSort.value === sort) {
    sort.ascending = !sort.ascending
  } else {
    activeSort.value = sort
  }
  studentList.value = studentList.value.sort(sort.func)
}

const sortOptions = ref<SortOption[]>([
  { 
    label: 'Name', 
    icon: () => {
      if (sortOptions.value[0].ascending) {
        return 'mdi-sort-alphabetical-ascending'
      } else {
        return 'mdi-sort-alphabetical-descending'
      }
    },
    ascending: true,
    func: (a: any, b: any) => {
      if (sortOptions.value[0].ascending) {
        return a.name.localeCompare(b.name)
      } else {
        return b.name.localeCompare(a.name)
      }
    }
  },
  { 
    label: 'Points',
    icon: () => {
      if (sortOptions.value[1].ascending) {
        return 'mdi-sort-numeric-ascending'
      } else {
        return 'mdi-sort-numeric-descending'
      }
    },
    ascending: true,
    func: (a: any, b: any) => {
      if (sortOptions.value[1].ascending) {
        return a.points - b.points
      } else {
        return b.points - a.points
      }
    }
  },
  { 
    label: 'Active Status', 
    icon: () => 'mdi-sort-variant',
    ascending: true,
    func: (a: any, b: any) => {
      if (sortOptions.value[2].ascending) {
        return a.activeStatus.localeCompare(b.activeStatus)
      } else {
        return b.activeStatus.localeCompare(a.activeStatus)
      }
    }
  },
])
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
