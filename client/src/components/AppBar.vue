<template>
  <div>
    <v-navigation-drawer
      v-model="navDrawer"
      temporary
      fixed
      location="end"
      :color="`${panel.color}-darken-2`"
      style="width: 75%; max-width: 350px; height: 120vh; position: fixed; top: 0;"
    >
      <div class="pa-4">
        <div 
          class="d-flex flex-row"
          style="width: 100%"
        >
          <div 
            class="px-3 d-flex flex-row align-center"
            :style="{
              background: autoSyncDivColor, 
              color: 'rgb(240, 240, 240)',
              borderRadius: '10px',
              transition: '300ms'
            }" 
          >
            <span class="mr-2">
              Auto Sync
            </span>
            <v-switch
              v-model="autoSync"
              color="red-lighten-4" 
              hide-details
            ></v-switch>
          </div>
          <v-spacer></v-spacer>
          <Announcements />
          <v-btn 
            icon
            class="ml-3"
          >
            <v-icon 
              @click="$router.push({ name: 'leaderboard' })"
              icon="mdi-podium" 
              size="large"
            ></v-icon>
          </v-btn>
        </div>
        <v-btn
          @click="emit('showAddModal')"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
          class="mt-5"
          block
        >
          <v-icon 
            icon="mdi-plus" 
            size="large"
            class="mr-2"
          ></v-icon>
          Add {{ panel.title.singular }}
        </v-btn>
        <v-btn
          @click="$emit('fetchData')"
          :loading="loading"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
          class="mt-3"
          block
        >
          <v-icon 
            icon="mdi-refresh" 
            size="large"
            class="mr-2"
          ></v-icon>
          Refresh Data
        </v-btn>
        <v-btn
          @click="$router.push({ name: 'registrar' })"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
          class="mt-3"
          block
        >
          <v-icon 
            icon="mdi-list-box-outline" 
            size="large"
            class="mr-2"
          ></v-icon>
          Registrar List
        </v-btn>
        <v-btn
          @click="$router.push({ name: 'email' })"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
          class="mt-3"
          block
        >
          <v-icon 
            icon="mdi-email-fast-outline" 
            size="large"
            class="mr-2"
          ></v-icon>
          Mass Email
        </v-btn>
        <SortPanel 
          class="mt-5"
          @update="$emit('updateItems', $event)"
          :items="items"
          :panelType="panel.type"
        />
      </div>
    </v-navigation-drawer>
    <v-app-bar
      :color="appBarColor"
      class="app-bar px-5"
    >
      <div v-if="searchMode">
        <input
          @input="updateValue"
          :value="modelValue"
          :placeholder="filterPlaceholder"
          class="vanilla-search-input"
          type="text"
          id="input"
        >
      </div>
      <div 
        v-else
        class="d-flex align-center"
      >
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
              {{ panelTitle }}
            </h1>
          </template>

          <v-list>
            <v-list-item
              v-for="type in PanelType"
              :key="type"
              @click="$emit('changePanel', type)"
              class="type-list-item"
            >
              <v-list-item-title
                :style="typeListStyle(type)"
                class="type-list-text"
              >
                <v-icon>
                  {{ switchPanel(type).icon }}
                </v-icon>
                {{ switchPanel(type).title.plural }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <p
          :style="{
            opacity: loading ? 0 : 1,
          }"
          class="ml-2"
        >
          ({{ displayItemsLength }})
        </p>
      </div>
      <input
        v-if="mdAndUp"
        @input="updateValue"
        :value="modelValue"
        :placeholder="filterPlaceholder"
        class="search-input"
        type="text"
        id="input"
      >
      <v-spacer></v-spacer>
      <span 
        v-if="autoSync && !xs"
        class="d-flex align-center ml-5 px-2"
        style="background: red; border-radius: 5px; font-weight: 700; cursor: default;"
      >
        <div class="live-emblem fade-animate mr-2"></div>
        LIVE
        <v-tooltip
          activator="parent"
          location="bottom"
        >Auto Sync Is Enabled</v-tooltip>
      </span>
      <v-btn 
        v-if="smAndUp"
        @click="$emit('showAddModal')"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-plus" 
          size="large" 
        ></v-icon>
        <span 
          v-if="mdAndUp"
          class="ml-2"
        >
          Add {{ panel.title.singular }}
        </span>
      </v-btn>
      <v-btn 
        v-if="smAndUp"
        @click="$emit('fetchData')"
        :loading="loading"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-refresh" 
          size="large" 
        ></v-icon>
        <span 
          v-if="mdAndUp"
          class="ml-2"
        >
          Refresh Data
        </span>
      </v-btn>
      <v-btn 
        v-if="!mdAndUp"
        class="ml-3"
        icon
      >
        <v-icon 
          v-if="!searchMode"
          @click="searchMode = true"
          icon="mdi-magnify" 
          size="large"
        ></v-icon>
        <v-icon 
          v-else
          @click="searchMode = false"
          icon="mdi-close" 
          size="large"
        ></v-icon>
      </v-btn>
      <div 
        v-if="smAndUp"
        :class="[
          mdAndUp ? 'ml-3' : '',
          'd-flex', 
          'flex-row', 
          'align-center'
        ]"
      >
        <Announcements />
        <v-btn icon>
          <v-icon 
            @click="$router.push({ name: 'leaderboard' })"
            icon="mdi-podium" 
            size="large"
          ></v-icon>
          <v-tooltip
            activator="parent"
            location="bottom"
          >View Points Leaderboard</v-tooltip>
        </v-btn>
      </div>
      <div v-else>
        <v-btn icon>
          <v-icon 
            @click="navDrawer = true"
            icon="mdi-menu" 
            size="large"
          ></v-icon>
        </v-btn>
      </div>
    </v-app-bar>
  </div>
</template>

<script setup lang="ts">
import { Panel, switchPanel, PanelType } from '../SwitchPanel'
import { SheetItem } from '../SheetTypes'
import { inject, ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useKeyBindings } from '../KeyBindings'
import SortPanel from './SortPanel.vue'
import Announcements from './AnnouncementMenu.vue'

const autoSync = inject('autoSync') as Ref<boolean>
const navDrawer = ref(false)
const searchMode = ref(false)

useKeyBindings({
  '/': () => document.getElementById('input').focus(),
})

const {
  lgAndUp,
  mdAndUp, 
  smAndUp,
  xs
} = useDisplay()

const props = defineProps<{
  panel: Panel<SheetItem>,
  modelValue: string
  loading: boolean,
  displayItemsLength: number,
  items: SheetItem[]
}>();

const emit = defineEmits([
  'fetchData',
  'showAddModal',
  'changePanel',
  'updateItems',
  'update:modelValue'
])

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}

function typeListStyle(type: PanelType) {
  return {
    color: type === props.panel.type ? props.panel.color : 'black',
  }
}

const filterPlaceholder = computed(() => {
  return `Search ${panelTitle.value.toLowerCase()}...`
})

const panelTitle = computed(() => {
  const title = props.panel.title.plural
  if (lgAndUp.value || title.split(' ').length <= 1) return title
  else {
    return title.split(' ')[1]
  }
})

const autoSyncDivColor = computed(() => {
  if (autoSync.value) {
    return '#c80000'
  } else {
    return 'rgba(0, 0, 0, 0.4)'
  }
})

const appBarColor = computed(() => {
  if (xs.value && autoSync.value) {
    return 'red-darken-4'
  } else {
    return `${props.panel.color}-darken-2`
  }
})
</script>

<style scoped>
.app-bar {
  transition: 300ms;
}

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
  width: 30%;
  max-width: 800px;
  font-size: 1.4em; 
  font-weight: 200; 
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
  margin-left: 25px;
  transition: 0.3s ease;
}

.vanilla-search-input {
  background: rgba(0, 0, 0, 0.3); 
  color: rgb(240, 240, 240); 
  border-radius: 50px; 
  padding: 3px; 
  padding-left: 15px;
  border: none; 
  width: 300px;
  max-width: 70vw;
  font-size: 1.4em; 
  font-weight: 200; 
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
}

.vanilla-search-input:focus {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.search-input:focus {
  /* width: 600px; */
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

.vanilla-search-input:focus::placeholder {
  color: transparent;
}

.vanilla-search-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}

.vanilla-search-input::placeholder {
  color: rgba(255, 255, 255, 0.569);
}

.fade-animate {
  animation: fade-in-out 1.5s ease-in-out infinite alternate;
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