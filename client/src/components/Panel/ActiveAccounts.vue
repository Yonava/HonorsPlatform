<template>
  <div
    class="d-flex align-center mr-2"
    :style="{
      transform: `translateX(${(getUniqueConnectedSockets.length - 1) * 25}px)`,
    }"
  >
    <div
      v-for="(account, i) in getUniqueConnectedSockets"
      @click="profileClicked(account)"
      :key="account.id"
      :style="{
        width: xs ? '50px' : '40px',
        height: xs ? '50px' : '40px',
        borderRadius: '50%',
        background: 'rgb(0, 0, 0)',
        transform: `translateX(${i * -25}px)`,
        border: '2px solid rgba(255, 255, 255, 1)',
        cursor: 'pointer',
      }"
    >
      <img
        :src="account.picture"
        :style="{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
        }"
      />
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
import { storeToRefs } from 'pinia';
import { panels } from '../../Panels';
import { useSheetManager } from '../../store/useSheetManager';
import { useDocumentCache } from '../../store/useDocumentCache';
import { useDisplay } from 'vuetify';
import { useSocket, type ConnectedSocket } from '../../store/useSocket';

const { smAndDown, xs } = useDisplay()
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