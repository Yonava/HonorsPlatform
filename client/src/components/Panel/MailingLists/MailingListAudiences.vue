<template>
  <div
    class="d-flex pb-4 pt-2"
    style="overflow: auto; gap: 8px"
  >
    <v-btn
      v-for="audience in audiences"
      @click="addAudience(audience)"
      :key="audience.name"
      :color="audience.color"
      class="text-white"
      rounded
    >
      {{ audience.name }}
    </v-btn>
    <h3
      v-if="!audiences.length"
      class="text-red"
    >
      No More Target Audiences
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getMailingListAudiences } from './MailingListAudiences';
import type { Audience } from './MailingListAudiences';

const selectedAudiences = ref(new Set<string>())

const emits = defineEmits([
  'selected'
])

const addAudience = (audience: Audience) => {
  selectedAudiences.value.add(audience.name)
  emits('selected', audience)
}

const audiences = computed(() => getMailingListAudiences().filter(a => !selectedAudiences.value.has(a.name)))
</script>