<template>
  <div>
    {{ sheet }}
  </div>
</template>

<script setup lang="ts">
import { Range, getEvery } from "../SheetsAPI";
import { ref } from "vue";

const sheet = ref(null);

async function getRegistrarList() {
  sheet.value = await getEvery(Range.REGISTRAR_LIST, false)
}

getRegistrarList();
</script>