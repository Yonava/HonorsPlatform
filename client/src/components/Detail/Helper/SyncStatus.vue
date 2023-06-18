<template>
  <div>
    <div
      v-if="syncing"
      class="d-flex flex-row align-center"
      style="height: 25px"
    >
      <v-progress-circular
        class="mr-2"
        indeterminate
        size="20"
      ></v-progress-circular>
      <p>
        saving all changes...
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
const { syncTime, syncing } = storeToRefs(syncState)
</script>