<template>
  <v-sheet>
    <v-card class="px-5 py-4">

      <h1 class="mb-2">
        Post An Announcement
      </h1>

      <v-textarea
        v-model="announcement"
        :disabled="posting"
        label="Announcement"
        variant="outlined"
        prepend-inner-icon="mdi-message-text"
      ></v-textarea>

      <v-select
        v-model="expiryDate"
        :disabled="posting"
        :items="expiryDateOptions"
        variant="outlined"
        label="Remove After"
        hint="How long do you want the announcement to stay up for?"
        persistent-hint
        style="width: 100%"
        class="mb-4"
      ></v-select>

      <v-select
        v-model="panelType"
        variant="outlined"
        :items="Object.values(panels).map(panel => panel.sheetRange)"
        chips
        label="Post To"
        multiple
        hint="Select the panels you intend to post to, or leave blank to post to all panels."
        persistent-hint
        style="width: 100%"
      ></v-select>

      <v-btn
        @click="postNewAnnouncement"
        :disabled="!announcement"
        :loading="posting"
        :color="getActivePanel.color + '-darken-1'"
        size="large"
        class="mt-4"
      >
        <v-icon class="mr-2">
          mdi-message-arrow-right
        </v-icon>
        Post
      </v-btn>

    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../../store/useDialog';
import { ref } from 'vue';
import { useAuth } from '../../store/useAuth';
import { storeToRefs } from 'pinia';
import { useDocumentCache } from '../../store/useDocumentCache';
import { useSheetManager } from '../../store/useSheetManager';
import { panels } from '../../Panels';

const auth = useAuth();
const { googleProfile } = storeToRefs(auth);

const documentCache = useDocumentCache();
const { postAnnouncement } = documentCache;

const sheetManager = useSheetManager();
const { getActivePanel } = storeToRefs(sheetManager);

const dialog = useDialog();
const { open, close, openSnackbar } = dialog;

const announcement = ref('');
const posting = ref(false);

const thingsThatWillNeverHappen = [
  'When Pigs Fly 🐷🛩️',
  'MySNHU Becomes User Friendly',
  'Dine SNHU Wins A Michelin Star',
  'The Penmen Press Goes Mainstream',
  'Frogs Start Reciting Shakespeare',
  'Doing Taxes Becomes Fun',
  'SNHU Wins A Football Game',
  'The Heat Death Of The Universe',
  'SNHU Ranks #1 On US News & World Report',
  'A Third Party Candidate Wins The Presidency',
  'Jeff Bezos Runs Out Of Money',
  'Big Banks Discover Morality',
  'The US Government Stops Printing Money',
  'Unicorns Are Discovered 🦄✨',
]

const expiryDateOptions = [
  thingsThatWillNeverHappen[Math.floor(Math.random() * thingsThatWillNeverHappen.length)],
  'A Day',
  'A Week',
  'A Month',
  'A Year',
  'Custom'
] as const

const expiryDate = ref(expiryDateOptions[0])

const panelType = ref<string[]>([])

const postNewAnnouncement = async () => {
  posting.value = true

  if (!googleProfile.value) {
    console.error('No google profile found')
    open({
    body: {
      title: 'Announcement Failed To Post',
      description: 'You must be signed in to post an announcement.',
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
    return
  }

  await postAnnouncement({
    sysId: useSheetManager().newSysId(),
    content: announcement.value,
    posterName: googleProfile.value.name,
    posterPhoto: googleProfile.value.picture,
    datePosted: new Date().toString(),
    expiryDate: expiryDate.value.toString(),
    panelType: panelType.value.join(', '),
  })

  posting.value = false

  openSnackbar({
    text: 'Announcement Posted',
  })

  close()
}
</script>