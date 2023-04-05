<template>
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
              {{ switchPanel(type).title }}
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
        ({{ itemLength }})
      </p>
    </div>
    <input
      @input="updateValue"
      :value="modelValue"
      :placeholder="filterPlaceholder"
      class="search-input"
      type="text"
    >
    <v-spacer></v-spacer>
    <span 
      v-if="autoSync"
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
      @click="$emit('showAddModal')"
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
      @click="$emit('fetchData')"
      :loading="loading"
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
      <v-tooltip
        activator="parent"
        location="bottom"
      >View Points Leaderboard</v-tooltip>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { Panel, switchPanel, PanelType } from '../SwitchPanel'
import { SheetItem } from '../SheetTypes'
import { inject, ref, computed } from 'vue'
import type { Ref } from 'vue'
import Announcements from './AnnouncementMenu.vue'

const autoSync = inject('autoSync') as Ref<boolean>

const props = defineProps<{
  panel: Panel<SheetItem>,
  modelValue: string
  loading: boolean,
  itemLength: number
}>();

const emit = defineEmits([
  'fetchData',
  'showAddModal',
  'changePanel',
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
  return `Search ${props.panel.title.toLowerCase()}...`
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