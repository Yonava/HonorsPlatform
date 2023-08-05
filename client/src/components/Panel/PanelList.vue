<template>
  <div style="height: calc(100vh - 64px); position: relative;">
    <div
      v-if="!loadingItems"
      v-bind="containerProps"
      style="height: 100%;"
    >
      <div v-bind="wrapperProps">
        <!-- <TransitionGroup :name="listTransitionActive ? 'list' : ''"> -->
          <div
            v-for="{ data: item } in list"
            :key="item.sysId"
            @click="setSelectedItem(item)"
            style="height: 105px; overflow: hidden;"
          >
            <component
              :is="getActivePanel.components.list"
              :item="item"
              :styled="true"
            />
          </div>
        <!-- </TransitionGroup> -->
      </div>
      <v-sheet
        v-if="filteredItems.length === 0"
        class="mt-2"
        style="width: 90%; border-radius: 10px; margin: 0 auto;"
        :color="`${getActivePanel.color}-darken-1`"
        elevation="3"
      >
        <div
          style="text-align: center;"
          class="d-flex justify-center flex-column pa-4"
        >
          <h3>
            <v-icon class="mr-1 mb-1">
              {{ getActivePanel.icon }}
            </v-icon>
            no {{ getActivePanel.title.plural.toLowerCase() }} in system
          </h3>
          <span v-if="searchFilter">
            try clearing "{{ searchFilter }}" from the search filter
            to view all {{ getActivePanel.title.plural.toLowerCase() }}
          </span>
        </div>
      </v-sheet>
    </div>
    <div v-else>
      <div class="d-flex justify-center">
        <v-progress-circular
          :color="`${getActivePanel.color}-darken-4`"
          size="32"
          indeterminate
          class="mt-12"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'
import { setSelectedItem } from './SetSelectedItem'
import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const sheetManager = useSheetManager()
const { filteredItems, loadingItems, getActivePanel, searchFilter, listTransitionActive } = storeToRefs(sheetManager)

watch(searchFilter, () => {
  scrollTo(0)
})

watch(getActivePanel, () => {
  scrollTo(0)
})

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
  filteredItems,
  {
    itemHeight: 105
  }
)
</script>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>