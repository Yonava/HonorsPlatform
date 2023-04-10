<template>
  <div id="panel-parent">
    <v-sheet 
      class="background-matte"
      :color="`${panel.color}-lighten-4`"
    ></v-sheet>
    <AppBar 
      v-model="filterQuery"
      @fetchData="fetchData"
      @showAddModal="showAddModal = true"
      @changePanel="changePanel($event)"
      @updateItems="items = $event"
      :panel="panel"
      :loading="loadingItems"
      :displayItemsLength="displayItems.length"
      :items="items"
    />
    <v-main>
      <div 
        class="d-flex flex-row"
        :style="{
          position: 'relative',
          height: smAndUp ? 'calc(100vh - 64px)' : ''
        }"
      >
        <v-sheet 
          v-if="smAndUp"
          class="d-flex align-center flex-column flex-start pt-3"
          :color="`${panel.color}-darken-2`"
          style="min-width: 80px; max-width: 80px; height: 100%; background: green"
        >
          <SortPanel 
            @update="items = $event"
            :items="items"
            :panelType="panel.type"
          />
          <v-spacer></v-spacer>
          <div 
            class="d-flex flex-column align-center"
            style="text-align: center;"
          >
            <div
              v-show="autoSync"
              style="width: 25px; height: 25px; border-radius: 50px; background: #ff0500;"
            ></div>
            <span 
              style="width: 100%; line-height: 1.1em; font-weight: 400; font-size: 0.8em;"
            >Auto Sync</span>
            <v-switch
              v-model="autoSync"
              :color="`${panel.color}-lighten-4`"
              style="transform: translateY(-10px);"
              hide-details
            ></v-switch>
            <div 
              style="transform: translateY(-12px);"
              class="mb-2"
            >
              <v-btn 
                icon
                @click="$router.push({ name: 'registrar' })"
              >
                <v-icon>
                  mdi-list-box-outline
                </v-icon>
                <v-tooltip
                  activator="parent"
                  location="end"
                >Create Registrar List</v-tooltip>
              </v-btn>
            </div>
          </div>
        </v-sheet>
        <v-sheet 
          :color="`${panel.color}-lighten-4`"
          :style="{
            overflow: 'auto',
            minWidth: smAndUp ? `${panelListWidth}px` : '100%',
            maxWidth: smAndUp ? `${panelListWidth}px` : '100%',
          }"
          class="d-flex flex-grow-1 flex-column align-center"
        >
          <PanelList
            @select="selectedItem = $event"
            :items="displayItems"
            :filterQuery="filterQuery"
            :selected="selectedItem"
            :loading="loadingItems"
            :panel="panel"
          />
        </v-sheet>
        <v-sheet 
          v-if="mdAndUp"
          :color="resizing ? panel.color : ''"
          @mousedown="resizeStart"
          @mouseup="resizeEnd"
          :style="{
            width: '3px',
            height: '100%',
            cursor: 'col-resize',
            position: 'absolute',
            left: `${80 + proposedWidth}px`,
          }"
        ></v-sheet>
        <v-sheet 
          v-if="mdAndUp"
          :color="`white`"
          style="height: 100%; overflow: auto;"
          class="d-flex flex-grow-1 flex-column align-center"
        >
          <div v-if="selectedItem">
            <component
              @delete="reqDelete"
              @update="updateList($event)"
              @unselect="unselect"
              :is="panel.components.detail" 
              :item="ref(clone(selectedItem))"
            />
          </div>
          <div 
            v-else
            class="d-flex flex-column align-center justify-center"
          >
            <v-icon
              style="font-size: 35vw; opacity: 0.1;"
            >
              {{ panel.icon }}
            </v-icon>
          </div>
        </v-sheet>
      </div>
      <img 
        v-if="lgAndUp"
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
      fixed
      location="bottom"
      style="width: 100%; height: 82.5%;"
      :color="`${panel.color}-lighten-5`"
    >
      <component
        v-if="selectedItem"
        @delete="reqDelete"
        @update="updateList($event)"
        @unselect="unselect"
        :is="panel.components.detail" 
        :item="ref(clone(selectedItem))"
      />
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  onMounted, 
  computed, 
  watch,
  onUnmounted,
  provide
} from 'vue' 
import { useRoute, useRouter } from 'vue-router'
import { getEvery, clearByRow } from '../SheetsAPI'
import AddModal from '../components/AddModal.vue'
import PanelList from '../components/PanelList.vue'
import StudentDetail from '../components/StudentDetail.vue'
import SortPanel from '../components/SortPanel.vue'
import AppBar from '../components/AppBar.vue'
import { useKeyBindings } from '../KeyBindings'
import { PanelType, Panel, switchPanel } from '../SwitchPanel'
import { SheetEntry, SheetItem } from '../SheetTypes'
import { useDisplay } from 'vuetify'

const route = useRoute()
const router = useRouter()
const { smAndUp, mdAndUp, lgAndUp, smAndDown } = useDisplay()

const items = ref<SheetItem[]>([])
const loadingItems = ref(true)
const showAddModal = ref(false)
const filterQuery = ref('')
const pageVisible = ref(true)
const panelListWidth = ref(420)

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

const selectedItem = ref<SheetItem>(undefined)

const autoSync = ref(false)
provide('autoSync', autoSync)

const panel = ref(switchPanel(PanelType.STUDENTS))
provide('activePanel', panel)

const changePanel = (panelType: PanelType) => {
  panel.value = switchPanel(panelType)
  selectedItem.value = null
  document.title = panel.value.title + ' - Honors Program'
  filterQuery.value = ''
  router.push({ 
    query: { 
      type: panelType 
    }
  })
}

watch(panel, async () => {
  await fetchData()
})

const showDetailDrawer = computed({
  get: () => !!selectedItem.value,
  set: (v) => {
    if (!v) {
      selectedItem.value = null
    }
  }
})

const keyBindToggle = (panelType: PanelType) => {
  if (panel.value.type === panelType) return
  changePanel(panelType)
}

useKeyBindings({
  'a': () => autoSync.value = !autoSync.value,
  's': () => showAddModal.value = !showAddModal.value,
  'r': () => fetchData(),
  '1': () => keyBindToggle(PanelType.STUDENTS),
  '2': () => keyBindToggle(PanelType.GRADUATES),
  '3': () => keyBindToggle(PanelType.MODULES),
  '4': () => keyBindToggle(PanelType.COMPLETED_MODULES),
})

onMounted(async () => {
  if (route.query.type) {
    changePanel(route.query.type as PanelType)
  }
  document.addEventListener('visibilitychange', toggleVisibility)
  await fetchData()
})

function toggleVisibility() {
  pageVisible.value = !document.hidden
}

async function unselect() {
  selectedItem.value = undefined
  await fetchData()
}

async function reqDelete() {
  loadingItems.value = true
  const row = selectedItem.value.row
  selectedItem.value = undefined
  await clearByRow(panel.value.sheetRange, row)
  await fetchData()
}

function updateList<T extends SheetItem>(item: T) {
  const index = items.value.findIndex(<T extends SheetEntry>(i: T) => i.row === item.row)
  if (index === -1) return
  items.value[index] = item
  selectedItem.value = item
}

async function itemAdded<T extends SheetEntry>(item: T) {
  await fetchData()
  const index = items.value.findIndex(<T>(i: T) => {
    return panel.value.keys.every(key => i[key] === item[key]);
  })
  if (index === -1) return
  selectedItem.value = items.value[index]
  items.value.splice(index, 1)
  items.value.unshift(selectedItem.value)
}

const displayItems = computed(() => {
  if (filterQuery.value === '') return items.value
  return items.value.filter(<T extends SheetEntry>(item: T) => {
    const query = filterQuery.value.toLowerCase();
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(query)
  })
})

async function fetchData() {
  loadingItems.value = true
  await silentFetch()
  loadingItems.value = false
}

async function silentFetch() {
  const data = await getEvery(panel.value.sheetRange)
  items.value = await panel.value.mappers.map(data)
  if (!selectedItem.value) return
  const findSelected = items.value.findIndex(i => i.row === selectedItem.value.row)
  if (findSelected === -1) selectedItem.value = undefined
}

// 1s just to impress, 5s is probably better
const autoSyncInterval = setInterval(() => {
  if (autoSync.value && pageVisible.value) silentFetch()
}, 5000)

onUnmounted(() => {
  clearInterval(autoSyncInterval)
  document.removeEventListener('visibilitychange', toggleVisibility)
})



const resizing = ref(false)
const proposedWidth = ref(panelListWidth.value)

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
  const sortPanelWidth = 80
  const newWidth = e.clientX - sortPanelWidth
  if (newWidth < 200 || newWidth > 700) return
  proposedWidth.value = newWidth
}

const resizeEnd = (e: MouseEvent) => {
  resizing.value = false
  const panelParent = document.getElementById('panel-parent')
  panelParent.style.userSelect = 'auto'
  panelListWidth.value = proposedWidth.value
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