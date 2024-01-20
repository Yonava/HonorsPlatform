<template>
  <div
    class="mb-4 d-flex flex-column align-center"
    style="gap: 10px"
  >
    <div
      v-if="googleProfile"
      style="width: 50px; height: 50px; position: relative;"
    >
      <v-menu
        :offset="[10, 0]"
        location="top"
      >
        <template v-slot:activator="{ props }">
          <img
            v-bind="props"
            :src="googleProfile.picture"
            alt="Profile"
            :style="{
              borderRadius: '50%',
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
              border: '3px solid white',
              cursor: 'pointer'
            }"
          />
        </template>

        <UserProfile />

      </v-menu>

      <v-tooltip
        activator="parent"
        location="end"
      >
        View Profile
      </v-tooltip>
    </div>

    <v-menu
      :offset="[10, 0]"
      location="top"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :disabled="readOnlyMode"
          icon
        >
          <v-icon>
            mdi-list-box-outline
          </v-icon>
          <v-tooltip
            activator="parent"
            location="end"
          >
            Create Registrar List
          </v-tooltip>
        </v-btn>
      </template>

      <v-sheet
        @click.stop
        style="border-radius: 20px; position: relative; width: 300px"
        elevation="7"
      >
        <BuildRegistrarList />
      </v-sheet>
    </v-menu>

    <v-menu
      :offset="[10, 0]"
      location="top"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
        >
          <v-icon>
            mdi-email-outline
          </v-icon>
          <v-tooltip
            activator="parent"
            location="end"
          >
            My Mailing Lists
          </v-tooltip>
        </v-btn>
      </template>

      <v-sheet
        @click.stop
        style="border-radius: 20px; position: relative; width: 400px"
        elevation="7"
      >
        <MailingListMenu />
      </v-sheet>
    </v-menu>

  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@store/useAuth';
import { useSheetManager } from '@store/useSheetManager';
import { storeToRefs } from 'pinia';
import UserProfile from './UserProfile.vue';
import MailingListMenu from './MailingLists/MailingListMenu.vue';
import BuildRegistrarList from './BuildRegistrarList.vue';

const auth = useAuth();
const { googleProfile } = storeToRefs(auth);

const sheetManager = useSheetManager();
const { readOnlyMode } = storeToRefs(sheetManager);
</script>