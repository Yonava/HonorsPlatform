<template>
  <div
    :class="`d-flex justify-start ${reversed ? 'flex-row-reverse' : ''}`"
    style="position: relative; height: 100%;"
  >
    <div
      v-for="(account, i) in getUniqueConnectedSockets"
      @click="profileClicked(account)"
      :key="account.socketId"
      :style="{
        width: '50px',
        height: '50px',
        transform: `translateX(${i * 80 * (reversed ? 1 : -1)}%)`,
        border: '2px solid rgba(255, 255, 255, 1)',
        cursor: 'pointer',
        borderRadius: '50%',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      }"
    >

      <ProfilePicture :src="account.picture" />

      <v-tooltip
        :disabled="smAndDown"
        activator="parent"
        location="bottom"
      >
        {{ accountTooltip(account) }}
      </v-tooltip>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import { panels } from '@panels';
import { useSheetManager } from '@store/useSheetManager';
import { useDocumentCache } from '@store/useDocumentCache';
import { useSocket } from '@store/useSocket';
import type { ConnectedSocket } from '@store/useSocket';
import ProfilePicture from '../../ProfilePicture.vue';

/**
 * @default justify = 'left'
 */
const props = defineProps<{
  justify?: 'left' | 'right'
}>()

const reversed = computed(() => props?.justify === 'right')

const { smAndDown } = useDisplay()
const { setPanel } = useSheetManager()
const { getUniqueConnectedSockets, focusData } = storeToRefs(useSocket())

const accountTooltip = (account: ConnectedSocket) => {
  const { getItemBySysId } = useDocumentCache()
  const userFocusData = focusData.value[account.socketId]
  const defaultMessage = `${account.given_name} is online`
  if (!userFocusData) {
    return defaultMessage
  } else {
    const { panelName, sysId } = userFocusData
    if (!sysId) {
      return `${account.given_name} is viewing ${panels[panelName].title.plural}`
    }
    const item = getItemBySysId(sysId, panelName)
    if (!item) {
      return defaultMessage
    }
    const itemBeingEdited = item[panels[panelName].properties.title] + ' in ' + panels[panelName].title.plural
    return `${account.given_name} is editing ${itemBeingEdited}`
  }
}

const profileClicked = (account: ConnectedSocket) => {
  const userFocusData = focusData.value[account.socketId]
  if (!userFocusData) {
    return
  }

  const { panelName, sysId } = userFocusData

  if (!sysId) {
    setPanel(panelName)
    return
  }

  const { focusedItemSysId } = useSheetManager()
  if (focusedItemSysId === sysId) {
    return
  }

  setPanel(panelName, {
    value: sysId
  })
}
</script>