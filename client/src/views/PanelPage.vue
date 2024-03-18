<template>
  <div ref="panelParent">

    <v-sheet
      class="background-matte"
      :color="`${getActivePanel.color}-lighten-4`"
    ></v-sheet>

    <PanelCoverAppBar v-if="getPanelCover.show" />
    <AppBar v-else />

    <v-main>
      <div
        :style="{
          position: 'relative',
          height: 'calc(100vh - 64px)'
        }"
        class="d-flex"
      >

        <v-sheet
          :style="panelCoverStyles"
          :color="`${getActivePanel.color}-lighten-4`"
        >
          <PanelCover />
        </v-sheet>

        <v-sheet
          v-if="mdAndUp"
          :color="`${getActivePanel.color}-darken-2`"
          :style="{
            minWidth: `${SIDEBAR_WIDTH_PX}px`,
          }"
          class="d-flex align-center flex-column flex-start pt-3"
        >
          <SortPanel />
          <v-spacer></v-spacer>
          <BottomLeftActions />
        </v-sheet>

        <div
          ref="panelList"
          :style="panelListStyles"
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
          :style="panelListResizeTabStyles"
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

    <ItemDetailSM />

  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  type StyleValue
} from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { local, localKeys } from '@locals'
import { panels, version } from '@panels'
import { useSheetManager } from '@store/useSheetManager'
import { useDialog } from '@store/useDialog'
import { useKeyBindings } from '@composables/useKeyBindings'
import BottomLeftActions from '../components/Panel/BottomLeftActions.vue'
import ItemDetailSM from '../components/Panel/ItemDetailSM.vue'
import PanelCoverAppBar from '../components/Panel/PanelCoverAppBar.vue'
import PanelList from '../components/Panel/PanelList.vue'
import SortPanel from '../components/Panel/SortPanel.vue'
import AppBar from '../components/Panel/AppBar/AppBar.vue'
import PanelCover from '../components/Panel/PanelCover.vue'
import ItemDetail from '../components/Panel/ItemDetail.vue'
import { useStalePageDetector } from '../StalePageDetector'

const panelListStyles = computed(() => {
  return {
    height: getPanelCover.value.show ? 'calc(100vh - 64px)' : '',
    overflow: getPanelCover.value.show ? 'hidden' : 'auto',
    minWidth: mdAndUp.value ? `${itemListWidth.value}px` : '',
    maxWidth: mdAndUp.value ? `${itemListWidth.value}px` : '',
    pointerEvents: panelListCollapsed.value ? 'none' : 'auto',
    transition: itemListTransition.value ? 'min-width 0.2s ease-in-out, max-width 0.2s ease-in-out' : '',
  } satisfies StyleValue
})

const panelCoverStyles = computed(() => {
  return {
    zIndex: '99',
    position: 'absolute',
    width: mdAndUp.value ? (panelListWidth.value + 80) + 'px' : '100%',
    height: mdAndUp.value ? '100%' : 'calc(100vh - 64px)',
    overflow: 'auto',
    transform: getPanelCover.value.show ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.2s ease-in-out',
  } satisfies StyleValue
})

const panelListResizeTabStyles = computed(() => {
  return {
    width: '3px',
    height: '100%',
    cursor: 'col-resize',
    position: 'absolute',
    zIndex: 100,
    left: `${proposedWidth.value + SIDEBAR_WIDTH_PX}px`,
  } satisfies StyleValue
})

useStalePageDetector()
const { setPanel } = useSheetManager()
const { getActivePanel, pinnedSysIds, focusedItemSysId, listItemBeingDragged } = storeToRefs(useSheetManager())
const { getPanelCover } = storeToRefs(useDialog())

const route = useRoute()

if (route.query.type) {
  const panelIndex = Object.values(panels).findIndex((p) => p.title.plural.toLowerCase() === route.query.type)
  const panelKeys = Object.keys(panels) as (keyof typeof panels)[]
  if (panelIndex !== -1) setPanel(panelKeys[panelIndex])
} else {
  document.title = getActivePanel.value.title.plural + ' - Honors Program'
  pinnedSysIds.value = local.get(localKeys.pinned(getActivePanel.value.panelName))?.split(',') || []
}

const { mdAndUp } = useDisplay()

const showLogo = computed(() => {
  return mdAndUp.value && !focusedItemSysId.value && !listItemBeingDragged.value
})

const panelListCollapsed = ref(false)
const itemListTransition = ref(false)

const panelHopBindings = () => {
  const panelKeys = Object.keys(panels) as (keyof typeof panels)[]
  return panelKeys.reduce((acc, key, i) => {
    acc[i + 1] = () => setPanel(key)
    return acc
  }, {} as Record<number, () => void>)
}

useKeyBindings({
  '/': () => document.getElementById("search-bar")!.focus(),
  'p': () => {
    panelListCollapsed.value = !panelListCollapsed.value
    itemListTransition.value = true
    setTimeout(() => {
      itemListTransition.value = false
    }, 200)
  },
  ...panelHopBindings()
})

const getPanelListWidth = () => {
  const DEFAULT_PANEL_LIST_WIDTH = 480
  const localPanelListWidth = local.get(localKeys.panelListWidth)
  return localPanelListWidth ? parseInt(localPanelListWidth) : DEFAULT_PANEL_LIST_WIDTH
}

const resizing = ref(false)
const panelListWidth = ref(getPanelListWidth())
const proposedWidth = ref(panelListWidth.value)
const panelParent = ref<HTMLDivElement>()

const SIDEBAR_WIDTH_PX = 80

const resizeStart = () => {
  resizing.value = true
  if (!panelParent.value) throw new Error('panelParent is not defined')
  panelParent.value.style.userSelect = 'none'
  proposedWidth.value = panelListWidth.value
  document.addEventListener('mousemove', resizeMove)
  document.addEventListener('mouseup', resizeEnd)
}

const resizeMove = (e: MouseEvent) => {
  const [smallestAllowedPx, largestAllowedPx] = [350, 550]
  if (!resizing.value || panelListCollapsed.value) return
  const newWidth = e.clientX - SIDEBAR_WIDTH_PX
  if (newWidth < smallestAllowedPx || newWidth > largestAllowedPx) return
  proposedWidth.value = newWidth
}

const resizeEnd = () => {
  resizing.value = false
  if (!panelParent.value) throw new Error('panelParent is not defined')
  panelParent.value.style.userSelect = 'auto'
  panelListWidth.value = proposedWidth.value
  local.set(localKeys.panelListWidth, panelListWidth.value.toString())
  document.removeEventListener('mousemove', resizeMove)
  document.removeEventListener('mouseup', resizeEnd)
}

const itemListWidth = computed(() => {
  if (panelListCollapsed.value) {
    return 1
  }
  return panelListWidth.value
})

watch(pinnedSysIds, (newIds) => {
  const storableIds = newIds.join(',')
  local.set(localKeys.pinned(getActivePanel.value.panelName), storableIds)
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
</style>