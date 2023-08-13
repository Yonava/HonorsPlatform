<template>
  <v-sheet>
    <v-card>
      <v-card-title>
        <h2>Post Announcement</h2>
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="announcement"
          label="Announcement"
          outlined
          rows="5"
          placeholder="Enter your announcement here..."
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="postNewAnnouncement"
        >
          Post
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../../store/useDialog';
import { ref } from 'vue';

const dialog = useDialog();
const { close } = dialog;

const announcement = ref('');

const postNewAnnouncement = () => {
  console.log('posting announcement', announcement.value)
  close()
}
</script>