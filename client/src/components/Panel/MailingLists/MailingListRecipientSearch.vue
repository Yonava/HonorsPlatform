<template>
  <input
    v-model="search"
    @click.stop
    placeholder="Lookup Students or Graduates"
    style="border: 1px solid black; border-radius: 50px; height: 40px; width: 50%;"
    class="px-3 py-1 mb-4"
    type="text"
  />

  <div
    class="d-flex flex-column mb-4"
    style="height: 200px; overflow: auto; gap: 5px; user-select: none"
  >
    <v-sheet
      v-for="recipient in filteredPotentialRecipients"
      @click="emits('selected', recipient)"
      @mouseenter="hoveredStudentSysId = recipient.sysId"
      @mouseleave="hoveredStudentSysId = ''"
      :key="recipient.sysId"
      :color="color(recipient)"
      class="d-flex align-center justify-space-between py-2 px-3 student-list-item"
      style="border-radius: 5px; cursor: pointer"
    >
      <h3>
        {{ recipient.name || "(No Name)" }}
        <span style="font-size: 0.75rem">
          ({{ recipient.id || "No ID" }})
        </span>
      </h3>
      <h5>
        {{ recipient.email || "No Email" }}
      </h5>
    </v-sheet>
    <h3
      v-if="!filteredPotentialRecipients.length"
      class="text-red"
    >
      Cannot Find A Match For Your Search "{{ search }}"
    </h3>
  </div>
</template>

<script setup lang="ts" generic="T extends { email: string, id: string, name: string, sysId: string }">
import { computed, ref } from 'vue'
import { filterItems } from '@utils/FilterObjects';
import type { ListColor } from './MailingListAudiences';

const search = ref('')
const hoveredStudentSysId = ref('')

const props = defineProps<{
  potentialRecipients: T[],
  recipientSysIds: Set<string>,
  color: ListColor
}>()

const emits = defineEmits<{
  (e: 'selected', recipient: T): void
}>();

const filteredPotentialRecipients = computed(() => filterItems(props.potentialRecipients, search.value))

const color = (recipient: T) => {
  if (props.recipientSysIds.has(recipient.sysId) && hoveredStudentSysId.value == recipient.sysId) {
    return `${props.color}-darken-2`
  } else if (props.recipientSysIds.has(recipient.sysId)) {
    return `${props.color}-darken-1`
  } else if (hoveredStudentSysId.value == recipient.sysId) {
    return 'grey-lighten-1'
  } else {
    return 'grey-lighten-2'
  }
}
</script>