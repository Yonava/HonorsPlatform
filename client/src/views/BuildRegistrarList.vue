<template>
  <div>
    {{ sheet }}
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const sheet = ref("Hello World");

</script>