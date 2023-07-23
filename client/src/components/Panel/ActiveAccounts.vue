<template>
  <div
    class="d-flex align-center"
    :style="{
      transform: `translateX(${(displayAccounts.length - 1) * 15}px)`,
    }"
  >
    <div
      v-for="(account, i) in displayAccounts"
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
        {{ account.name }} is editing
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../store/useAuth';
import { storeToRefs } from 'pinia';
import { computed } from 'vue'

const { connectedAccounts, googleProfile } = storeToRefs(useAuth())

const displayAccounts = computed(() => {
  const clientId = googleProfile.value?.id
  const seenIds = new Set([clientId])
  return connectedAccounts.value.filter(({ id }) => {
    if (seenIds.has(id)) {
      return false
    } else {
      seenIds.add(id)
      return true
    }
  })
})


</script>