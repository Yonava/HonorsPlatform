<template>
  <div style="width: 100%">
    <div v-if="!loading">
      <div
        style="position: relative; width: 100%"
        class="d-flex flex-column align-center mt-2"
      >
        <div
          v-for="item in items"
          :key="item"
          @click="selectedItem = item"
          :class="[
            'mb-2',
            'item-card',
            selectedItem === item ? 'selected-item-card' : ''
          ]"
        >
          <component
            :is="panel.components.list" 
            :item="item" 
          />
        </div>
      </div>
      <v-sheet 
        v-if="items.length === 0"
        class="mt-2"
        style="width: 90%; border-radius: 10px; margin: 0 auto;"
        :color="`${panel.color}-darken-1`"
        elevation="3"
      >
        <div 
          style="text-align: center;"
          class="d-flex justify-center flex-column pa-4"
        >
          <h3>
            <v-icon class="mr-1 mb-1">
              {{ panel.icon }}
            </v-icon>
            no {{ panel.title.toLowerCase() }} in system
          </h3>
          <span v-if="filterQuery">
            try clearing "{{ filterQuery }}" from the search filter to view all {{ panel.title.toLowerCase() }}
          </span>
        </div>
      </v-sheet>
    </div>
    <div v-else>
      <div class="d-flex justify-center">
        <v-progress-circular 
          :color="`${panel.color}-darken-4`"
          size="32"
          indeterminate
          class="mt-12" 
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ref, 
  defineProps,
  defineEmits,
  computed
} from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  selected: {
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  },
  panel: {
    type: Object,
    required: true
  },
  filterQuery: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['select'])

const selectedItem = computed({
  get: () => props.selected,
  set: item => emits('select', item)
})
</script>

<style scoped>
.item-card {
  width: 92%;
  background: rgba(255,255,255, 0.5);
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: 350ms;
}

.selected-item-card {
  background: rgba(255,255,255, 0.7);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.item-card:hover {
  background: rgba(255,255,255, 0.7);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  transform: scale(0.98)
}
</style>