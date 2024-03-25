<template>
  <v-sheet class="px-4 py-2">
    <input
      v-model="mailingList.name"
      placeholder="Mailing List Name"
      type="text"
      class="edit-title mt-2"
    />

    <ColorPalette
      v-model="mailingList.color"
      class="mb-3"
    />

    <RecipientSearch
      @selected="toggleRecipient($event.sysId)"
      :potentialRecipients="potentialRecipients"
      :recipientSysIds="recipientSysIds"
      :color="mailingList.color"
    />

    <RecipientBox
      @remove="toggleRecipient($event.sysId)"
      :items="recipients"
      :display="recipient => recipient.name"
      :color="mailingList.color"
    />

    <v-btn
      @click.stop="close"
      :disabled="!recipientSysIds.size"
      :color="`${mailingList.color}-darken-1`"
      class="my-2"
    >
      Done
    </v-btn>

  </v-sheet>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useDialog } from '@store/useDialog';
import { localKeys } from '@locals';
import type { MailingList } from './MailingListAudiences';
import RecipientBox from './MailingListRecipientBox.vue';
import RecipientSearch from './MailingListRecipientSearch.vue';
import ColorPalette from './MailingListColorPalette.vue';
import { useMailingListState } from './useMailingListState';

const props = defineProps<{
  mailingListId: string
}>()

const { close } = useDialog()

const allMailingLists = useStorage<MailingList[]>(localKeys.mailingLists, [])

const mailingList = allMailingLists.value.find((list) => list.id === props.mailingListId)

if (!mailingList) {
  throw new Error(`Mailing list with id ${props.mailingListId} not found`)
}

const {
  potentialRecipients,
  recipientSysIds,
  recipients,
  toggleRecipient,
} = useMailingListState({
  initialRecipientSysIds: mailingList.recipientSysIds,
  onToggleRecipient: () => mailingList.recipientSysIds = Array.from(recipientSysIds.value)
})
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