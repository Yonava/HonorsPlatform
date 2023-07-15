<template>
  <div>
    <div v-if="!loadingItems">
      <div
        style="position: relative; width: 100%"
        class="d-flex flex-column align-center"
      >
        <div
          v-for="item in incrementallyRenderedItems"
          :key="item"
          @click="setSelectedItem(item)"
          style="width: 100%"
        >
          <component
            :is="panel.components.list"
            :item="item"
            :styled="true"
          />
        </div>
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
import { useSheetManager } from '../../store/useSheetManager'
import { useIncrementalRender } from '../../useIncrementalRender'
import { storeToRefs } from 'pinia'

const sheetManager = useSheetManager()
const { filteredItems, loadingItems, panel, searchFilter } = storeToRefs(sheetManager)

const { incrementallyRenderedItems } = useIncrementalRender(filteredItems)
</script>