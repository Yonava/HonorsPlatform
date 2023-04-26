<template>
  <div>
    <div 
      v-if="syncState.processing"
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
      saved at 
      {{ 
        syncState.lastSynced.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }).toLowerCase() 
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from "vue";
import type { SyncState } from "../../UpdateManager";

const syncState = inject<Ref<SyncState>>("syncState");
</script>