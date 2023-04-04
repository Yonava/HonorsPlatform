<template>
  <v-sheet 
    :color="`${panel.color}-darken-2`"
    style="overscroll-y-behavior: none;"
  >
    <v-app-bar
      :color="`${panel.color}-darken-2`"
      class="px-5"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="panel.icon" 
          size="x-large" 
          class="mr-2"
        ></v-icon>
        <v-menu>
          <template v-slot:activator="{ props }">
            <h1 
              v-bind="props"
              class="title"
            >
              {{ panel.title }}
            </h1>
          </template>

          <v-list>
            <v-list-item
              v-for="type in PanelType"
              :key="type"
              @click="changePanel(type)"
              class="type-list-item"
            >
              <v-list-item-title
                :style="typeListStyle(type)"
                class="type-list-text"
              >
                <v-icon>
                  {{ switchPanel(type).icon }}
                </v-icon>
                {{ switchPanel(type).title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <p 
          :style="{
            opacity: loadingItems ? 0 : 1,
          }"
          class="ml-2"
        >
          ({{ displayItems.length }})
        </p>
      </div>
      <input
        v-model="filterQuery"
        :placeholder="filterPlaceholder"
        class="search-input"
        type="text"
      >
      <v-spacer></v-spacer>
      <span 
        v-if="autoSync"
        class="d-flex align-center ml-5 px-2"
        style="background: red; border-radius: 5px; font-weight: 700;"
      >
        <div class="live-emblem fade-animate mr-2"></div>
        LIVE
      </span>
      <v-btn 
        @click="showAddModal = true"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-plus" 
          size="large" 
          class="mr-2"
        ></v-icon>
        Add {{ panel.title.slice(0, -1) }}
      </v-btn>
      <v-btn 
        @click="fetchData"
        :loading="loadingItems"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-refresh" 
          size="large" 
          class="mr-2"
        ></v-icon>
        Refresh Data
      </v-btn>
      <Announcements />
      <v-btn icon>
        <v-icon 
          @click="$router.push({ name: 'leaderboard' })"
          icon="mdi-podium" 
          size="large"
        ></v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <div 
        style="position: relative; height: calc(100vh - 64px);" 
        class="d-flex flex-row"
      >
        <v-sheet 
          class="d-flex align-center flex-column flex-start pt-3"
          :color="`${panel.color}-darken-2`"
          border 
          style="width: 5%; height: 100%; background: green"
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
              class="mb-1"
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
          </div>
        </v-sheet>
        <v-sheet 
          :color="`${panel.color}-lighten-4`"
          border 
          style="width: 25%; height: 100%; overflow: auto;"
          class="d-flex flex-column align-center"
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
          :color="`${panel.color}-lighten-5`"
          style="width: 70%; height: 100%;"
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
              style="font-size: 30rem; opacity: 0.1;"
            >
              {{ panel.icon }}
            </v-icon>
          </div>
        </v-sheet>
      </div>
      <img 
        src="../assets/honorsLogo.png"
        class="honors-logo"
      >
    </v-main>
    <AddModal 
      @close="showAddModal = false"
      @success="itemAdded($event)"
      :panel="panel"
      :show="showAddModal"
    />
  </v-sheet>
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
import Announcements from '../components/AnnouncementMenu.vue'
import PanelList from '../components/PanelList.vue'
import StudentDetail from '../components/StudentDetail.vue'
import SortPanel from '../components/SortPanel.vue'
import { useKeyBindings } from '../KeyBindings'
import { PanelType, Panel, switchPanel } from '../SwitchPanel'
import { SheetEntry, SheetItem } from '../SheetTypes'

const route = useRoute()
const router = useRouter()

const items = ref<SheetItem[]>([])
const loadingItems = ref(false)
const showAddModal = ref(false)
const filterQuery = ref('')
const pageVisible = ref(true)

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

const selectedItem = ref<SheetItem>(undefined)

const autoSync = ref(false)
provide('autoSync', autoSync)

const panel = ref(switchPanel(PanelType.STUDENTS))
provide('activePanel', panel)

const changePanel = (panelType: PanelType) => {
  panel.value = switchPanel(panelType)
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

const keyBindToggle = (panelType: PanelType) => {
  if (panel.value.type === panelType) return
  changePanel(panelType)
}

useKeyBindings({
  'a': () => autoSync.value = !autoSync.value,
  's': () => showAddModal.value = !showAddModal.value,
  'r': () => fetchData(),
  '/': () => document.querySelector('input').focus(),
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

async function fetchData() {
  selectedItem.value = undefined;
  loadingItems.value = true
  items.value = []
  const data = await getEvery(panel.value.sheetRange)
  items.value = await panel.value.mappers.map(data)
  loadingItems.value = false
}

function typeListStyle(type: PanelType) {
  return {
    color: type === panel.value.type ? panel.value.color : 'black',
  }
}

const filterPlaceholder = computed(() => {
  return `Search ${panel.value.title.toLowerCase()}...`
})

const displayItems = computed(() => {
  if (filterQuery.value === '') return items.value
  return items.value.filter(<T extends SheetEntry>(item: T) => {
    const query = filterQuery.value.toLowerCase();
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(query)
  })
})

async function silentFetch() {
  const data = await getEvery(panel.value.sheetRange)
  const incomingItems = await panel.value.mappers.map(data)
  items.value = items.value.map(item => {
    const incomingItem = incomingItems.find(i => i.row === item.row)
    if (!incomingItem) return item
    return incomingItem
  })
}

// 1s just to impress, 5s is probably better
const autoSyncInterval = setInterval(() => {
  if (autoSync.value && pageVisible.value) silentFetch()
}, 2000)

onUnmounted(() => {
  clearInterval(autoSyncInterval)
  document.removeEventListener('visibilitychange', toggleVisibility)
})
</script>

<style scoped>
h1.title {
  font-weight: 700; 
  user-select: none; 
  cursor: pointer; 
  white-space: nowrap;
}

.live-emblem {
  background: white; 
  width: 10px; 
  height: 10px; 
  border-radius: 50px;
}

.type-list-item {
  cursor: pointer;
  transition: 0.2s ease;
}

.type-list-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.type-list-text {
  font-size: 1.2em;
  font-weight: 700;
  text-transform: capitalize;
}

.search-input {
  background: rgba(0, 0, 0, 0.3); 
  color: rgb(240, 240, 240); 
  border-radius: 50px; 
  padding: 3px; 
  padding-left: 15px;
  border: none; 
  width: 400px; 
  font-size: 1.4em; 
  font-weight: 200; 
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
  margin-left: 25px;
  transition: 0.3s ease;
}

.search-input:focus {
  width: 600px;
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.search-input:focus::placeholder {
  color: transparent;
}

.search-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.569);
}

.fade-animate {
  animation: fade-in-out 1.5s ease-in-out infinite alternate;
}

img.honors-logo {
  position: absolute; 
  bottom: 0; 
  right: 0; 
  mix-blend-mode: multiply; 
  margin: 20px;
}

@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  75% {
    opacity: 0.95;
  }
  100% {
    opacity: 1;
  }
}
</style>