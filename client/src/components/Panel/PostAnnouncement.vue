<template>
  <v-sheet>
    <v-card>
      <v-card-title>
        <h2 class="my-3">
          Post An Announcement
        </h2>
      </v-card-title>
      <v-card-text>
        <v-textarea
        v-model="announcement"
        :disabled="posting"
        label="Content"
        variant="outlined"
        ></v-textarea>
      </v-card-text>
      <div
        class="ml-4 mb-4"
      >
        <v-btn
          v-if="!posting"
          @click="postNewAnnouncement"
          color="primary"
          size="large"
        >
          <v-icon class="mr-2">
            mdi-message-arrow-right
          </v-icon>
          Post
        </v-btn>
        <v-btn
          v-else
          disabled
          color="primary"
          size="large"
        >
          Posting...
          <v-progress-circular
            indeterminate
            size="24"
            color="white"
          ></v-progress-circular>
        </v-btn>
      </div>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../../store/useDialog';
import { ref } from 'vue';
import { postInRange } from '../../SheetsAPI';
import { useAuth } from '../../store/useAuth';
import { storeToRefs } from 'pinia';
import { useDocumentCache } from '../../store/useDocumentCache';
import { useSheetManager } from '../../store/useSheetManager';

const auth = useAuth();
const { googleProfile } = storeToRefs(auth);

const dialog = useDialog();
const { open, close } = dialog;

const announcement = ref('');
const posting = ref(false);

const postNewAnnouncement = async () => {
  posting.value = true

  if (!googleProfile.value) {
    console.error('No google profile found')
    close()
    return
  }

  await postInRange('Announcements', [[
    useSheetManager().newSysId(),
    announcement.value,
    googleProfile.value.name,
    googleProfile.value.picture,
    new Date().toString()
  ]])

  open({
    body: {
      title: 'Announcement Posted',
      description: 'Your announcement has been posted successfully.',
      buttons: [
        {
          text: 'OK',
          color: 'green',
          onClick: () => {
            close()
          }
        }
      ]
    }
  })
}
</script>