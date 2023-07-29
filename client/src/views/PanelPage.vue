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
          height: 'calc(100vh - 64px)'
        }"
        class="d-flex flex-row"
      >
        <v-sheet
          :style="{
            zIndex: '99',
            position: 'absolute',
            width: mdAndUp ? (panelListWidth + 80) + 'px' : '100%',
            height: mdAndUp ? '100%' : 'calc(100vh - 64px)',
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
          <div
            class="mb-4 d-flex flex-column align-center"
            style="gap: 10px"
          >
            <div
              v-if="googleProfile"
              style="width: 50px; height: 50px; position: relative;"
            >
              <v-menu
                :offset="[10, 0]"
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <img
                    v-bind="props"
                    :src="googleProfile.picture"
                    alt="Profile"
                    style="border-radius: 50%; width: 100%; height: 100%; object-fit: cover; box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); border: 3px solid white; cursor: pointer;"
                  />
                </template>
                <v-sheet class="px-4 py-6">
                  <v-btn
                    @click="userLogoutFlow"
                    block
                    color="red"
                  >
                    Logout
                  </v-btn>
                </v-sheet>
              </v-menu>
              <v-tooltip
                activator="parent"
                location="end"
              >
                {{ googleProfile.name }}
              </v-tooltip>
            </div>
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
      <div v-if="showLogo">
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
        v-if="focusedItem"
        :is="getActivePanel.components.detail"
        :item="focusedItem"
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
import { local } from '../Locals'
import { useSheetManager } from '../store/useSheetManager'
import { useDocumentCache } from '../store/useDocumentCache'
import { useDialog } from '../store/useDialog'
import { storeToRefs } from 'pinia'
import { panels, version } from '../Panels'
import { useAuth } from '../store/useAuth'
import { useStalePageDetector } from '../StalePageDetector'

useStalePageDetector()
const { userLogoutFlow } = useAuth()
const { googleProfile } = storeToRefs(useAuth())
const { setPanel, setFocusedItem } = useSheetManager()
const { getActivePanel, pinnedSysIds, focusedItem } = storeToRefs(useSheetManager())
const { getAllDocuments, setSelectedItems } = useDocumentCache()
const { setPanelCover } = useDialog()
const { getPanelCover } = storeToRefs(useDialog())

const route = useRoute()

if (route.query.type) {
  const panelIndex = Object.values(panels).findIndex((p) => p.title.plural.toLowerCase() === route.query.type)
  const panelKeys = Object.keys(panels) as (keyof typeof panels)[]
  if (panelIndex !== -1) setPanel(panelKeys[panelIndex])
} else {
  document.title = getActivePanel.value.title.plural + ' - Honors Program'
  pinnedSysIds.value = localStorage.getItem(local.pinned(getActivePanel.value.panelName))?.split(',') || []
}

const {
  smAndUp,
  mdAndUp,
  smAndDown
} = useDisplay()

const showNavDrawer = ref(false)
watchEffect(() => {
  if (focusedItem.value && smAndDown.value) {
    setTimeout(() => {
      showNavDrawer.value = true
    }, 100)
  } else if (!focusedItem.value) {
    showNavDrawer.value = false
  }
})

watch(showNavDrawer, (newVal) => {
  if (!newVal) {
    setFocusedItem(null)
    setSelectedItems()
  }
})

const showLogo = computed(() => {
  return mdAndUp.value && !focusedItem.value
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

const getDefaultWidth = () => {
  const localPanelListWidth = localStorage.getItem(local.panelListWidth)
  if (localPanelListWidth) {
    return parseInt(localPanelListWidth)
  } else {
    return 480
  }
}

const resizing = ref(false)
const panelListWidth = ref(getDefaultWidth())
const proposedWidth = ref(panelListWidth.value)
const sortPanelWidth = 80

const resizeStart = (e: MouseEvent) => {
  resizing.value = true
  const panelParent = document.getElementById('panel-parent')!
  panelParent.style.userSelect = 'none'
  proposedWidth.value = panelListWidth.value
  document.addEventListener('mousemove', resizeMove)
  document.addEventListener('mouseup', resizeEnd)
}

const resizeMove = (e: MouseEvent) => {
  const [smallestAllowed, largestAllowed] = [400, 600]
  if (!resizing.value) return
  const newWidth = e.clientX - sortPanelWidth
  if (newWidth < smallestAllowed || newWidth > largestAllowed) return
  proposedWidth.value = newWidth
}

const resizeEnd = () => {
  resizing.value = false
  const panelParent = document.getElementById('panel-parent')
  panelParent.style.userSelect = 'auto'
  panelListWidth.value = proposedWidth.value
  localStorage.setItem(local.panelListWidth, panelListWidth.value.toString())
  document.removeEventListener('mousemove', resizeMove)
  document.removeEventListener('mouseup', resizeEnd)
}

watch(pinnedSysIds, (newIds) => {
  const storableIds = newIds.join(',')
  localStorage.setItem(local.pinned(getActivePanel.value.panelName), storableIds)
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