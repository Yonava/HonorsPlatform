<template>
  <div>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      <div class="d-flex flex-row align-center">
        <img
          v-if="snackbar.img"
          :src="snackbar.img"
          style="width: 34px; height: 34px; border-radius: 50%; margin-right: 8px;"
        />

        {{ snackbar.text }}
      </div>

      <v-spacer></v-spacer>

      <template #actions>

        <v-btn
          v-if="snackbar.action"
          @click.stop="snackbar.action.onClick(); snackbar.show = false"
          variant="text"
        >
          {{ snackbar.action.text }}
        </v-btn>

        <v-btn
          v-if="snackbar.closable"
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
import { useDialog } from '@store/useDialog';
import { storeToRefs } from 'pinia';

const dialogState = useDialog();
const { snackbar } = storeToRefs(dialogState);
</script>