<template>
  <div @click="post">
    {{ sheet }}
  </div>
</template>

<script setup lang="ts">
import { Range, getEvery, postInRange } from "../SheetsAPI";
import { ref } from "vue";

const sheet = ref(null);

async function getRegistrarList() {
  sheet.value = await getEvery(Range.REGISTRAR_LIST)
}

async function post() {
  const payload = [[
    'polling', 'posting'
  ]]

  await postInRange(Range.REGISTRAR_LIST, payload)
  getRegistrarList()
}

getRegistrarList();
</script>