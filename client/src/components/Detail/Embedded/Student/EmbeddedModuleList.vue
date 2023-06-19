<template>
  <div>
    <div
      v-for="mod in items"
      :key="mod.courseCode"
      @click="select(mod)"
      class="module-card pa-2 mt-2 d-flex flex-row align-center"
    >
      <div style="d-flex flex-column align-center">
        <div
          class="mb-2"
          style="color: white; opacity: 0.75; font-size: 0.75em;"
        >
          {{ mod.term }}
        </div>
        <div class="d-flex flex-row align-center mb-3">
          <h4
            class=""
            style="color: rgba(255,255,255,0.9); font-size: 1.25em; line-height: 0.3;"
          >
            {{ mod.courseCode }}
          </h4>
          <span
            class="ml-2"
            style="color: white; line-height: 0.3; font-weight: 300;"
          >{{ mod.instructor }}</span>
        </div>
      </div>
      <v-icon
        @click.stop="remove(mod)"
        color="white"
        style="cursor: pointer; margin-left: auto;"
        class="delete-module"
      >
        mdi-close
      </v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Module } from "../../../../SheetTypes"

const props = defineProps<{
  items: Module[];
}>();

const emits = defineEmits([
  'selected',
  'delete'
]);

const select = (event: Module) => emits('selected', event);
const remove = (event: Module) => emits('delete', event);
</script>

<style scoped>
.module-card {
  background: #467ada;
  border-radius: 10px;
  transition: 300ms;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  cursor: pointer;
}

.module-card:hover {
  background: #2559b9;
}

.delete-module {
  transition: 300ms;
}

.delete-module:hover {
  transform: scale(1.15);
}
</style>