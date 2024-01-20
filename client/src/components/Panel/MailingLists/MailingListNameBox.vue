<template>
  <v-sheet
    v-if="items.length"
    class="d-flex flex-wrap align-content-start pa-2 mb-4"
    style="gap: 7px; height: 150px; overflow: auto; border-radius: 10px;"
    color="grey-lighten-3"
  >
    <div v-for="item in items">
      <v-sheet
        :color="color + '-darken-1'"
        class="pa-1 pl-3"
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
  color: string
}>()

const emits = defineEmits([
  'remove'
])
</script>