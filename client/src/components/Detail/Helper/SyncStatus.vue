<template>
  <div>
    <div
      v-if="syncing"
      class="d-flex flex-row align-center"
      style="height: 25px"
    >
      <v-progress-circular
        indeterminate
        class="mr-2"
        size="20"
      ></v-progress-circular>
      <p>
        saving changes...
      </p>
    </div>
    <p
      v-else
      style="height: 25px"
    >
      <v-icon>
        mdi-cloud-check-variant-outline
      </v-icon>
      saved {{ syncTime }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useSyncState } from '../../../store/useSyncState'
import { storeToRefs } from 'pinia'

const syncState = useSyncState()
const { syncTime, syncing, processing } = storeToRefs(syncState)
</script>