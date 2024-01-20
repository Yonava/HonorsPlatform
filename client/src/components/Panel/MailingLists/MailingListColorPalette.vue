<template>
  <div
    class="d-flex"
    style="gap: 6px"
  >
    <div
      v-for="color in listColors"
      @click="emit('update:modelValue', color)"
      :key="color"
      :class="modelValue === color ? 'ring' : 'ring-transparent'"
      style="cursor: pointer; border-radius: 50%; padding: 3px; overflow: auto;"
    >
      <v-sheet
        :color="color"
        height="30px"
        width="30px"
        style="border-radius: 50%"
      ></v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { listColors } from './MailingListAudiences';
import type { ListColor } from './MailingListAudiences';

defineProps<{
  modelValue: ListColor
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ListColor): void
}>()
</script>

<style scoped>
.ring {
  border: 3px solid #515151;
}

.ring-transparent {
  border: 3px solid transparent;
}

.ring-transparent:hover {
  border: 3px solid #b8b8b8;
}
</style>./MailingLists/MailingListAudiences./MailingLists/MailingListAudiences