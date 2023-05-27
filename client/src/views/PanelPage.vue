<template>
  <div id="panel-parent">
    <v-sheet
      class="background-matte"
      :color="`${panel.color}-lighten-4`"
    ></v-sheet>
    <AppBar
      v-model="filterQuery"
      @showAddModal="showAddModal = true"
      :loading="loadingItems"
      :displayItemsLength="displayItems.length"
    />
    <v-main>
      <div
        :style="{
          position: 'relative',
          height: smAndUp ? 'calc(100vh - 64px)' : ''
        }"
        class="d-flex flex-row"
      >
        <v-sheet
          v-if="smAndUp"
          :color="`${panel.color}-darken-2`"
          class="d-flex align-center flex-column flex-start pt-3"
          style="min-width: 80px; max-width: 80px; height: 100%; background: green"
        >
          <SortPanel />
          <v-spacer></v-spacer>
          <div class="mb-4 d-flex flex-column align-center">
            <v-btn
              @click="$router.push({ name: 'registrar' })"
              icon
            >
              <v-icon>
                mdi-list-box-outline
              </v-icon>
              <v-tooltip
                activator="parent"
                location="end"
              >Create Registrar List</v-tooltip>
            </v-btn>
            <v-btn
              @click="$router.push({ name: 'email' })"
              icon
              class="mt-3"
            >
              <v-icon>
                mdi-email-fast-outline
              </v-icon>
              <v-tooltip
                :disabled="smAndDown"
                activator="parent"
                location="end"
              >Compose Mass Email</v-tooltip>
            </v-btn>
          </div>
        </v-sheet>
        <div
          ref="panelList"
          :style="{
            overflow: 'auto',
            minWidth: mdAndUp ? `${panelListWidth}px` : '',
            maxWidth: mdAndUp ? `${panelListWidth}px` : '',
          }"
          class="d-flex flex-grow-1 flex-column align-center"
        >
          <v-sheet
            :color="`${panel.color}-lighten-4`"
            style="width: 100%;"
          >
            <PanelList
              :items="displayItems"
              :pinnedItem="pinnedItem"
              :filterQuery="filterQuery"
              :loading="loadingItems"
            />
          </v-sheet>
        </div>
        <v-sheet
          v-if="mdAndUp"
          @mousedown="resizeStart"
          :color="resizing ? panel.color : 'transparent'"
          :style="{
            width: '3px',
            height: '100%',
            cursor: 'col-resize',
            position: 'absolute',
            zIndex: 2,
            left: `${proposedWidth + sortPanelWidth}px`,
          }"
        ></v-sheet>
        <v-sheet
          v-if="mdAndUp"
          :color="`white`"
          style="height: 100%; overflow: auto;"
          class="d-flex flex-grow-1 flex-column align-center"
        >
          <div
            v-if="selectedItem"
            style="width: 100%"
          >
            <component
              @delete="reqDelete"
              @update="selectedItem = $event"
              @unselect="unselect"
              @changePanel="changePanel(...Object.values($event))"
              :is="panel.components.detail"
              :item="selectedItem"
            />
          </div>
          <div
            v-else
            class="d-flex flex-column align-center justify-center"
          >
            <v-icon style="font-size: 35vw; opacity: 0.1;">
              {{ panel.icon }}
            </v-icon>
          </div>
        </v-sheet>
      </div>
      <img
        v-if="lgAndUp && !selectedItem"
        src="../assets/honorsLogo.jpeg"
        class="honors-logo"
      >
    </v-main>
    <AddModal
      @close="showAddModal = false"
      @success="itemAdded($event)"
      :panel="panel"
      :show="showAddModal"
    />
    <v-navigation-drawer
      v-if="smAndDown"
      v-model="showDetailDrawer"
      temporary
      touchless
      rounded
      location="bottom"
      style="width: 100%; height: calc(100% - 120px);"
    >
      <component
        v-if="selectedItem"
        :is="panel.components.detail"
        :item="selectedItem"
      />
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
} from 'vue'
import { useRoute } from 'vue-router'
import AddModal from '../components/AddModal.vue'
import PanelList from '../components/Panel/PanelList.vue'
import StudentDetail from '../components/Detail/StudentDetail.vue'
import SortPanel from '../components/Panel/SortPanel.vue'
import AppBar from '../components/Panel/AppBar.vue'
import { useKeyBindings } from '../KeyBindings'
import { useDisplay } from 'vuetify'
import { useUpdateManager } from '../UpdateManager'

import { useSheetManager } from '../store/useSheetManager'

const route = useRoute()

const {
  smAndUp,
  mdAndUp,
  lgAndUp,
  smAndDown
} = useDisplay()

const showAddModal = ref(false)

const showDetailDrawer = computed({
  get: () => !!selectedItem.value,
  set: (v) => {
    if (!v) {
      selectedItem.value = null
    }
  }
})

useKeyBindings({
  's': () => showAddModal.value = !showAddModal.value,
  'r': () => fetchData(),
  '1': () => keyBindToggle(PanelType.STUDENTS),
  '2': () => keyBindToggle(PanelType.GRADUATES),
  '3': () => keyBindToggle(PanelType.MODULES),
  '4': () => keyBindToggle(PanelType.COMPLETED_MODULES),
  '5': () => keyBindToggle(PanelType.THESES),
})

function getDefaultWidth() {
  const local = localStorage.getItem('panelListWidth')
  if (local) return parseInt(local)
  return 420
}

const resizing = ref(false)
const panelListWidth = ref(getDefaultWidth())
const proposedWidth = ref(panelListWidth.value)
const sortPanelWidth = 80

const resizeStart = (e: MouseEvent) => {
  resizing.value = true
  const panelParent = document.getElementById('panel-parent')
  panelParent.style.userSelect = 'none'
  proposedWidth.value = panelListWidth.value
  document.addEventListener('mousemove', resizeMove)
  document.addEventListener('mouseup', resizeEnd)
}

const resizeMove = (e: MouseEvent) => {
  if (!resizing.value) return
  const newWidth = e.clientX - sortPanelWidth
  if (newWidth < 300 || newWidth > 800) return
  proposedWidth.value = newWidth
}

const resizeEnd = (e: MouseEvent) => {
  resizing.value = false
  const panelParent = document.getElementById('panel-parent')
  panelParent.style.userSelect = 'auto'
  panelListWidth.value = proposedWidth.value
  localStorage.setItem('panelListWidth', panelListWidth.value.toString())
  document.removeEventListener('mousemove', resizeMove)
  document.removeEventListener('mouseup', resizeEnd)
}
</script>

<style scoped>
img.honors-logo {
  position: absolute;
  z-index: 1;
  bottom: 0;
  right: 0;
  width: 225px;
  mix-blend-mode: multiply;
  margin: 10px;
  margin-right: 20px
}

.background-matte {
  position: fixed;
  top: 0;
  left: 0;
  height: 130%;
  width: 130%;
}
</style>