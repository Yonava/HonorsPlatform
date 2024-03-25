<template>
  <v-sheet class="px-4 py-2">
    <input
      v-model="name"
      placeholder="Mailing List Name"
      type="text"
      class="edit-title"
    />

    <ColorPalette v-model="color" />

    <div class="my-4">
      <h3>
        Add Recipients By Group
        <InfoBtn>
          Include all students that meet the criteria of a group.
        </InfoBtn>
      </h3>

      <Audiences
        @selected="audienceSelected($event)"
        class="mb-4"
      />
    </div>

    <RecipientSearch
      @selected="toggleRecipient($event.sysId)"
      :potentialRecipients="potentialRecipients"
      :recipientSysIds="recipientSysIds"
      :color="color"
    />

    <RecipientBox
      @remove="toggleRecipient($event.sysId)"
      :items="recipients"
      :display="recipient => recipient.name"
      :color="color"
    />

    <div class="d-flex justify-end my-2">
      <v-btn
        @click="createList"
        :disabled="!recipientSysIds.size"
        :color="`${color}-darken-1`"
      >
        {{ createListBtnText }}
        <v-icon class="ml-2">mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDialog } from '@store/useDialog';
import { useStorage } from '@vueuse/core';
import { localKeys } from '@locals';
import InfoBtn from '../InfoBtn.vue';
import RecipientBox from './MailingListRecipientBox.vue';
import RecipientSearch from './MailingListRecipientSearch.vue';
import type { MailingList, Audience } from './MailingListAudiences';
import Audiences from './MailingListAudiences.vue';
import { listColors, type ListColor } from './MailingListAudiences';
import ColorPalette from './MailingListColorPalette.vue';
import { useMailingListState } from './useMailingListState';

const {
  potentialRecipients,
  recipientSysIds,
  recipients,
  toggleRecipient,
} = useMailingListState()

const name = ref('')
const color = ref<ListColor>(listColors[0])

const audienceSelected = (audience: Audience) => {
  audience.recipientSysIds.forEach(sysId => recipientSysIds.value.add(sysId))
}

const createListBtnText = computed(() => {
  if (recipientSysIds.value.size == 1) {
    return `Create Mailing List (${recipientSysIds.value.size} Recipient)`
  }
  return `Create Mailing List (${recipientSysIds.value.size} Recipients)`
})

const createList = () => {
  const mailingLists = useStorage<MailingList[]>(localKeys.mailingLists, [])
  mailingLists.value.push({
    name: name.value,
    id: Date.now().toString(),
    recipientSysIds: [...recipientSysIds.value],
    color: color.value
  })
  useDialog().close()
}
</script>

<style scoped>
.edit-title {
  font-size: 2.5rem;
  font-weight: 900;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
}
</style>