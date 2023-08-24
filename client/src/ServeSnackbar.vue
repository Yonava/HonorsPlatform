<template>
  <div>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}

      <v-spacer></v-spacer>

      <template #actions>

        <v-btn
          v-if="snackbar.action"
          @click="snackbar.action.onClick()"
          variant="text"
        >
          {{ snackbar.action.text }}
        </v-btn>

        <v-btn
          v-if="snackbar.closeable"
          @click="snackbar.show = false"
          variant="text"
        >
          <v-icon size="x-large">
            mdi-close
          </v-icon>
        </v-btn>

      </template>

    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from './store/useDialog';
import { storeToRefs } from 'pinia';

const dialogState = useDialog();
const { snackbar } = storeToRefs(dialogState);
</script>