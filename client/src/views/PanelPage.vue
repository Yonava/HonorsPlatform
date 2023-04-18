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
      :selectedItem="selectedItem"
      :panel="panel"
      :loading="loadingItems"
      :displayItemsLength="displayItems.length"
      :items="items"
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
          <SortPanel 
            @update="sortUpdate($event)"
            :items="items"
            :panelType="panel.type"
          />
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
              @select="selectedItem = $event"
              :items="displayItems"
              :pinnedItem="pinnedItem"
              :filterQuery="filterQuery"
              :selected="selectedItem"
              :loading="loadingItems"
              :panel="panel"
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
        @delete="reqDelete"
        @unselect="unselect"
        :is="panel.components.detail" 
        :item="selectedItem"
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
  onUnmounted
} from 'vue' 
import { useRoute, useRouter } from 'vue-router'
import { getEvery, clearByRow, updateByRow } from '../SheetsAPI'
import AddModal from '../components/AddModal.vue'
import PanelList from '../components/PanelList.vue'
import StudentDetail from '../components/StudentDetail.vue'
import SortPanel from '../components/SortPanel.vue'
import AppBar from '../components/AppBar.vue'
import { useKeyBindings } from '../KeyBindings'
import { PanelType, Panel, switchPanel } from '../SwitchPanel'
import { SheetEntry, SheetItem } from '../SheetTypes'
import { useDisplay } from 'vuetify'
import { useUpdateManager } from '../UpdateManager'

const route = useRoute()
const router = useRouter()

const { 
  smAndUp, 
  mdAndUp, 
  lgAndUp, 
  smAndDown 
} = useDisplay()

const items = ref<SheetItem[]>([])
const loadingItems = ref(true)
const showAddModal = ref(false)
const filterQuery = ref('')

const selectedItem = ref<SheetItem>(undefined)
const pinnedItem = ref(null)

// dom element of the panel list
const panelList = ref(null)

const panel = ref(switchPanel(PanelType.STUDENTS))

const changePanel = async (panelType: PanelType) => {
  
  panel.value = switchPanel(panelType)
  localStorage.setItem('panelScrollY', '0')
  selectedItem.value = null
  document.title = panel.value.title.plural + ' - Honors Program'
  filterQuery.value = ''

  router.push({
    name: 'panel',
    query: {
      type: panelType
    }
  })

  loadingItems.value = true
  items.value = await panel.value.mappers.map(await getEvery(panel.value.sheetRange))
  loadingItems.value = false
}

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
  's': () => showAddModal.value = !showAddModal.value,
  'r': () => fetchData(),
  '1': () => keyBindToggle(PanelType.STUDENTS),
  '2': () => keyBindToggle(PanelType.GRADUATES),
  '3': () => keyBindToggle(PanelType.MODULES),
  '4': () => keyBindToggle(PanelType.COMPLETED_MODULES),
  '5': () => keyBindToggle(PanelType.THESES),
})

const { syncState } = useUpdateManager(selectedItem, panel, silentFetch)

onMounted(async () => {
  if (route.query.type) {
    changePanel(route.query.type as PanelType)
  } else {
    document.title = panel.value.title.plural + ' - Honors Program'
  }
  panelList.value.addEventListener('scroll', scrollCapture)
  await fetchData()
})

onUnmounted(() => {
  if (!panelList.value) return
  panelList.value.removeEventListener('scroll', scrollCapture)
})

function sortUpdate(sortedItems: SheetItem[]) {
  items.value = sortedItems
  pinnedItem.value = null
}

async function unselect() {
  selectedItem.value = null
  await fetchData()
}

async function reqDelete() {
  loadingItems.value = true
  const row = selectedItem.value.row
  selectedItem.value = null
  await clearByRow(panel.value.sheetRange, row)
  await fetchData()
}

async function itemAdded(item: SheetItem) {
  await silentFetch()
  const index = items.value.findIndex((i) => {
    return panel.value.keys.every(key => i[key] === item[key]);
  })
  if (index === -1) return
  selectedItem.value = items.value[index]
  pinnedItem.value = items.value[index]
  if (panelList.value) {
    panelList.value.scrollTop = 0
  }
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
  const panelScrollY = localStorage.getItem('panelScrollY')
  if (panelScrollY) {
    setTimeout(() => {
      const el = panelList.value
      const height = parseFloat(panelScrollY) * (el.scrollHeight - el.clientHeight)
      panelList.value.scrollTop = height
    }, 1)
  }
  loadingItems.value = false
}

async function silentFetch() {
  const data = await getEvery(panel.value.sheetRange)
  const newItems = await panel.value.mappers.map(data)

  newItems.forEach((newItem, i) => {
    const oldItem = items.value.find(i => i.row === newItem.row)
    if (oldItem) {
      Object.assign(oldItem, newItem)
      newItems[i] = oldItem
    }
  })

  items.value = newItems
  items.value.sort((a, b) => a.row - b.row)
}

function getDefaultWidth() {
  const local = localStorage.getItem('panelListWidth')
  if (local) return parseInt(local)
  return 420
}

const resizing = ref(false)
const panelListWidth = ref(getDefaultWidth())
const proposedWidth = ref(panelListWidth.value)
const sortPanelWidth = 80

function scrollCapture() {
  const el = panelList.value
  const percentScrolled = el.scrollTop / (el.scrollHeight - el.clientHeight)
  if (isNaN(percentScrolled)) return
  localStorage.setItem('panelScrollY', percentScrolled.toString())
}

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