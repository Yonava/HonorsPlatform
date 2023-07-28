<template>
  <div
    class="d-flex align-center mr-2"
    :style="{
      transform: `translateX(${(getConnectedAccounts.length - 1) * 15}px)`,
    }"
  >
    <div
      v-for="(account, i) in getConnectedAccounts"
      @click="profileClicked(account.id)"
      :key="account.id"
      :style="{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgb(0, 0, 0)',
        transform: `translateX(${i * -15}px)`,
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
        activator="parent"
        location="bottom"
      >
        {{ accountTooltip(account) }}
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth, type ConnectedAccount } from '../../store/useAuth';
import { storeToRefs } from 'pinia';
import { panels } from '../../Panels';
import { useSheetManager } from '../../store/useSheetManager';
import { useDocumentCache } from '../../store/useDocumentCache';

const { setPanel } = useSheetManager()
const { getConnectedAccounts, focusData } = storeToRefs(useAuth())

const accountTooltip = (account: ConnectedAccount) => {
  const { getItemBySysId } = useDocumentCache()
  const userFocusData = focusData.value[account.socketId]
  const defaultMessage = `${account.given_name} is online`
  if (!userFocusData) {
    return defaultMessage
  } else {
    const { panelName, sysId } = userFocusData
    const item = getItemBySysId(sysId, panelName)
    if (!item) {
      return defaultMessage
    }
    const itemBeingEdited = item[panels[panelName].properties.title] + ' in ' + panels[panelName].title.plural
    return `${account.given_name} is editing ${itemBeingEdited}`
  }
}

const profileClicked = (googleId: string) => {
  const userFocusData = focusData.value[googleId]
  if (!userFocusData) {
    return
  } else {
    const { panelName, sysId } = userFocusData
    setPanel(panelName, {
      value: sysId
    })
  }
}
</script>