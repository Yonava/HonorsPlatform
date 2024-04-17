<template>
  <div>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      <div class="d-flex flex-row align-center">
        <ProfilePicture
          v-if="snackbar.img"
          :src="snackbar.img"
          :style="{
            width: '34px',
            height: '34px',
            marginRight: '8px'
          }"
        />

        {{ snackbar.text }}
      </div>

      <v-spacer></v-spacer>

      <template #actions>

        <v-btn
          v-if="snackbar.action"
          @click.stop="actionClicked"
          :color="snackbar.action.color"
          :variant="snackbar.action.color ? 'elevated' : 'text'"
        >
          {{ snackbar.action.text }}
        </v-btn>

        <v-btn
          v-if="snackbar.closable"
          @click.stop="snackbar.show = false"
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
import { storeToRefs } from 'pinia';
import { useDialog } from '@store/useDialog';
import ProfilePicture from './components/ProfilePicture.vue';

const dialogState = useDialog();
const { snackbar } = storeToRefs(dialogState);

const actionClicked = () => {
  snackbar.value.action?.onClick();
  snackbar.value.show = false
}
</script>