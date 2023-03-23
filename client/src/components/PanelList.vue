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
            :is="panel.listItemComponent" 
            :item="item" 
          />
        </div>
      </div>
      <div v-if="items.length === 0">
        <div class="d-flex justify-center">
          no {{ panel.title.toLowerCase() }} in system
        </div>
      </div>
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