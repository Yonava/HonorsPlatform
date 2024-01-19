<template>
  <v-sheet
    class="d-flex flex-wrap align-content-start pa-2 mb-4"
    style="gap: 7px; height: 200px; overflow: auto; border-radius: 10px;"
    color="grey-lighten-3"
  >
    <div v-for="item in items">
      <v-sheet
        class="pa-1 pl-3"
        color="blue-darken-1"
        style="border-radius: 50px"
      >
        <span
          class="mr-2"
          style="font-weight: 600"
        >
          {{ display(item) }}
        </span>
        <v-icon @click="emits('remove', item)">
          mdi-close-circle
        </v-icon>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
defineProps<{
  items: any[],
  display: (item: any) => string,
}>()

const emits = defineEmits([
  'remove'
])
</script>