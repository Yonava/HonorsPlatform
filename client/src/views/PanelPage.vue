<template>
  <div id="panel-parent">
    <v-sheet
      class="background-matte"
      :color="`${getActivePanel.color}-lighten-4`"
    ></v-sheet>
    <transition>
      <v-app-bar
        v-if="panelCover"
        :color="`${getActivePanel.color}-darken-2`"
        class="px-5"
      >
        <v-icon
          @click="setPanelCover(false)"
          icon="mdi-chevron-left"
          size="x-large"
          class="mr-2"
        ></v-icon>
        <h1>{{ getActivePanel.title.singular }} Report</h1>
      </v-app-bar>
      <AppBar v-else />
    </transition>
    <v-main>
      <div
        :style="{
          position: 'relative',
          height: smAndUp ? 'calc(100vh - 64px)' : ''
        }"
        class="d-flex flex-row"
      >
        <v-sheet
          :style="{
            zIndex: '99',
            position: 'absolute',
            width: (panelListWidth + 80) + 'px',
            height: '100%',
            transform: panelCover ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease-in-out',
          }"
          :color="`${getActivePanel.color}-lighten-4`"
        ></v-sheet>
        <v-sheet
          v-if="smAndUp"
          :color="`${getActivePanel.color}-darken-2`"
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
            :color="`${getActivePanel.color}-lighten-4`"
            style="width: 100%;"
          >
            <PanelList />
          </v-sheet>
        </div>
        <v-sheet
          v-if="mdAndUp"
          @mousedown="resizeStart"
          :color="resizing ? getActivePanel.color : 'transparent'"
          :style="{
            width: '3px',
            height: '100%',
            cursor: 'col-resize',
            position: 'absolute',
            zIndex: 100,
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
            v-if="getSelectedItem()"
            style="width: 100%"
          >
            <component :is="getActivePanel.components.detail" />
          </div>
          <div
            v-else
            class="d-flex flex-column align-center justify-center"
          >
            <v-icon style="font-size: 35vw; opacity: 0.1;">
              {{ getActivePanel.icon }}
            </v-icon>
          </div>
        </v-sheet>
      </div>
      <div v-if="mdAndUp && !getSelectedItem()">
        <img
          src="../assets/honorsLogo.jpeg"
          class="honors-logo"
        >
        <span class="software-version">
          {{ version }}
        </span>
      </div>
    </v-main>
    <ServeDialog />
    <v-navigation-drawer
      v-if="smAndDown"
      v-model="showDetailDrawer"
      temporary
      touchless
      rounded
      location="bottom"
      style="width: 100%; height: calc(100vh - 125px);"
    >
      <component
        v-if="getSelectedItem()"
        :is="getActivePanel.components.detail"
      />
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted
} from 'vue'
import { useRoute } from 'vue-router'
import PanelList from '../components/Panel/PanelList.vue'
import StudentDetail from '../components/Detail/StudentDetail.vue'
import SortPanel from '../components/Panel/SortPanel.vue'
import AppBar from '../components/Panel/AppBar.vue'
import ServeDialog from '../components/Panel/ServeDialog.vue'
import { useKeyBindings } from '../KeyBindings'
import { useDisplay } from 'vuetify'

import { useSheetManager } from '../store/useSheetManager'
import { useDocumentCache } from '../store/useDocumentCache'
import { storeToRefs } from 'pinia'
import { getPanel, panels, version } from '../Panels'

const { setPanel, fetchItems, setPanelCover } = useSheetManager()
const { getActivePanel, panelCover } = storeToRefs(useSheetManager())
const { getSelectedItem, setSelectedItem } = useDocumentCache()

const route = useRoute()
if (route.query.type) {
  const panelIndex = Object.values(panels).findIndex((p) => p.title.plural.toLowerCase() === route.query.type)
  const panelKeys = Object.keys(panels) as (keyof typeof panels)[]
  if (panelIndex !== -1) setPanel(panelKeys[panelIndex])
} else {
  document.title = getActivePanel.value.title.plural + ' - Honors Program'
  fetchItems()
}

const {
  smAndUp,
  mdAndUp,
  lgAndUp,
  smAndDown
} = useDisplay()

const showDetailDrawer = computed({
  get: () => !!getSelectedItem(),
  set: (v) => {
    if (!v) {
      setSelectedItem()
    }
  }
})

const panelHopBindings = () => {
  const panelKeys = Object.keys(panels) as (keyof typeof panels)[]
  return panelKeys.reduce((acc, key, i) => {
    acc[i + 1] = () => setPanel(key)
    return acc
  }, {})
}

useKeyBindings({
  'r': () => fetchItems(true),
  ...panelHopBindings(),
  ' ': () => setPanelCover(!panelCover.value),
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
  width: 225px;
  mix-blend-mode: multiply;
  z-index: 1;
  bottom: 0;
  right: 0;
  margin: 10px;
  margin-right: 20px;
  position: absolute;
}

.software-version {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 5px;
}

.background-matte {
  position: fixed;
  top: 0;
  left: 0;
  height: 130%;
  width: 130%;
}

.v-enter-active,
.v-leave-active {
  transition: 200ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>