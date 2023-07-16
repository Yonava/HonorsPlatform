<template>
  <div id="panel-parent">
    <v-sheet
      class="background-matte"
      :color="`${getActivePanel.color}-lighten-4`"
    ></v-sheet>
    <transition>
      <PanelCoverAppBar v-if="getPanelCover.show" />
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
            width: mdAndUp ? (panelListWidth + 80) + 'px' : '100%',
            height: mdAndUp ? '100%' : '100vh',
            overflow: 'auto',
            transform: getPanelCover.show ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease-in-out',
          }"
          :color="getActivePanel.color + '-lighten-4'"
        >
          <PanelCover />
        </v-sheet>
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
            height: getPanelCover.show ? 'calc(100vh - 64px)' : '',
            overflow: getPanelCover.show ? 'hidden' : 'auto',
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
        <ItemDetail v-if="mdAndUp"/>
      </div>
      <div v-if="mdAndUp && !isItemSelected">
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
      v-model="showNavDrawer"
      temporary
      touchless
      rounded
      location="bottom"
      style="width: 100%; height: calc(100vh - 175px);"
    >
      <component
        v-if="isItemSelected"
        :is="getActivePanel.components.detail"
        :item="selectedItem"
      />
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watchEffect,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import PanelCoverAppBar from '../components/Panel/PanelCoverAppBar.vue'
import PanelList from '../components/Panel/PanelList.vue'
import SortPanel from '../components/Panel/SortPanel.vue'
import AppBar from '../components/Panel/AppBar.vue'
import ServeDialog from '../components/Panel/ServeDialog.vue'
import PanelCover from '../components/Panel/PanelCover.vue'
import ItemDetail from '../components/Panel/ItemDetail.vue'
import { useKeyBindings } from '../KeyBindings'
import { useDisplay } from 'vuetify'

import { useSheetManager } from '../store/useSheetManager'
import { useDocumentCache } from '../store/useDocumentCache'
import { useDialog } from '../store/useDialog'
import { storeToRefs } from 'pinia'
import { panels, version } from '../Panels'

const { setPanel } = useSheetManager()
const { getActivePanel, pinnedSysIds } = storeToRefs(useSheetManager())
const { setSelectedItems, getAllDocuments } = useDocumentCache()
const { getSelectedItems } = storeToRefs(useDocumentCache())
const { setPanelCover } = useDialog()
const { getPanelCover } = storeToRefs(useDialog())

const route = useRoute()
if (route.query.type) {
  const panelIndex = Object.values(panels).findIndex((p) => p.title.plural.toLowerCase() === route.query.type)
  const panelKeys = Object.keys(panels) as (keyof typeof panels)[]
  if (panelIndex !== -1) setPanel(panelKeys[panelIndex])
} else {
  document.title = getActivePanel.value.title.plural + ' - Honors Program'
  pinnedSysIds.value = localStorage.getItem(`pinned${getActivePanel.value.title.plural}`)?.split(',') || []
}

const {
  smAndUp,
  mdAndUp,
  smAndDown
} = useDisplay()

const selectedItem = computed(() => {
  const selected = getSelectedItems.value()
  if (selected.length) return selected[0]
  return null
})

const isItemSelected = computed(() => !!selectedItem.value)

const showNavDrawer = ref(false)
watchEffect(() => {
  if (isItemSelected.value && smAndDown.value) {
    setTimeout(() => {
      showNavDrawer.value = true
    }, 100)
  }
})

watch(showNavDrawer, (newVal) => {
  if (!newVal) {
    setSelectedItems()
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
  'r': () => getAllDocuments({ forceCacheRefresh: true }),
  ...panelHopBindings(),
  ' ': () => {
    if (getPanelCover.value.show) {
      setPanelCover('close')
    } else {
      setPanelCover('open')
    }
  },
})

function getDefaultWidth() {
  const local = localStorage.getItem('panelListWidth')
  if (local) return parseInt(local)
  return 480
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

watch(pinnedSysIds, (newIds) => {
  const storableIds = newIds.join(',')
  localStorage.setItem(`pinned${getActivePanel.value.title.plural}`, storableIds)
}, { deep: true })
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