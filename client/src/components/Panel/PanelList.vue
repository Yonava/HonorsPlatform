<template>
  <div>
    <div v-if="!loadingItems">
      <div
        style="position: relative; width: 100%;"
        class="d-flex flex-column align-center"
      >
        <TransitionGroup :name="listTransitionActive ? 'list' : ''">
          <div
            v-for="item in incrementallyRenderedItems"
            :key="item"
            @click="itemSelected(item)"
            style="width: 100%; height: 100%; position: relative;"
          >
            <component
              :is="panel.components.list"
              :item="item"
              :styled="true"
            />
          </div>
        </TransitionGroup>
      </div>
      <v-sheet
        v-if="filteredItems.length === 0"
        class="mt-2"
        style="width: 90%; border-radius: 10px; margin: 0 auto;"
        :color="`${panel.color}-darken-1`"
        elevation="3"
      >
        <div
          style="text-align: center;"
          class="d-flex justify-center flex-column pa-4"
        >
          <h3>
            <v-icon class="mr-1 mb-1">
              {{ panel.icon }}
            </v-icon>
            no {{ panel.title.plural.toLowerCase() }} in system
          </h3>
          <span v-if="searchFilter">
            try clearing "{{ searchFilter }}" from the search filter
            to view all {{ panel.title.plural.toLowerCase() }}
          </span>
        </div>
      </v-sheet>
    </div>
    <div v-else>
      <div class="d-flex justify-center">
        <v-progress-circular
          :color="`${panel.color}-darken-4`"
          size="32"
          indeterminate
          class="mt-12"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setSelectedItem } from './SetSelectedItem'
import type { SheetItem } from '../../SheetTypes'
import { useSheetManager } from '../../store/useSheetManager'
import { useIncrementalRender } from '../../useIncrementalRender'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'

const { smAndDown } = useDisplay()

const itemSelected = (item: SheetItem) => {
  if (smAndDown.value) {
    useSheetManager().setFocusedItem(item)
  } else {
    setSelectedItem(item)
  }
}

const sheetManager = useSheetManager()
const { filteredItems, loadingItems, panel, searchFilter, listTransitionActive } = storeToRefs(sheetManager)

const { incrementallyRenderedItems } = useIncrementalRender(filteredItems)
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