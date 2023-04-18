<template>
  <div>
    <div class="d-flex flex-row align-center"> 
      <p style="font-weight: 200">
        {{ id }}
      </p>
      <slot name="id"></slot>
      <v-spacer></v-spacer>
      <SyncStatus />
    </div>
    <div class="d-flex flex-row align-center">
      <input 
        v-model="title"
        :placeholder="placeholder"
        type="text" 
        class="header-input"
      >
    </div>
    <v-divider class="my-2"></v-divider>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SyncStatus from "./SyncStatus.vue";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  id?: string;
}>();

const emits = defineEmits([
  "update:modelValue",
]);

const title = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emits("update:modelValue", value);
  },
});

const placeholder = computed(() => {
  return props.placeholder ?? "";
});

const id = computed(() => {
  return props.id ?? "";
});
</script>

<style scoped>
input.header-input {
  font-weight: 900; 
  font-size: 3em; 
  line-height: 0.9; 
  width: 100%;
}

input.header-input:focus {
  outline: none;
}
</style>