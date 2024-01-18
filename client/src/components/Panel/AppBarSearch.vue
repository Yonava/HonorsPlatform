<template>
  <input
    v-model="searchFilter"
    placeholder="Search"
    class="search-input"
    type="text"
    id="input"
  />
</template>

<script setup lang="ts">
import { useSheetManager } from "../../store/useSheetManager";
import { storeToRefs } from "pinia";

const { searchFilter } = storeToRefs(useSheetManager())
</script>

<style scoped>
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

.search-input:focus {
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
</style>