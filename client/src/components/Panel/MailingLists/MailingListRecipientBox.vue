<template>
  <v-sheet
    v-if="items.length"
    class="d-flex flex-wrap align-content-start pa-2 mb-4"
    style="gap: 7px; height: 150px; overflow: auto; border-radius: 10px;"
    color="grey-lighten-3"
  >
    <div
      v-for="item in items"
      :key="item.sysId"
    >
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
        <v-icon @click.stop="emits('remove', item)">
          mdi-close-circle
        </v-icon>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script setup lang="ts" generic="T extends Record<'sysId', string>">
import type { ListColor } from './MailingListAudiences';

defineProps<{
  items: T[],
  display: (item: T) => string,
  color: ListColor
}>()

const emits = defineEmits<{
  (e: 'remove', item: T): void
}>()
</script>