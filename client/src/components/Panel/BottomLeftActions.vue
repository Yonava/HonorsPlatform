<template>
  <div
    class="mb-4 d-flex flex-column align-center"
    style="gap: 8px"
  >
      <v-menu
        :offset="menuOffset"
        location="top"
      >
        <template v-slot:activator="{ props }">
          <div
            v-bind="props"
            :style="{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              border: '4px solid white',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            }"
          >

            <ProfilePicture :src="profilePicture" />

            <v-tooltip
              activator="parent"
              location="end"
            >
              View Profile
            </v-tooltip>

          </div>
        </template>

        <UserProfile />

      </v-menu>

    <v-menu
      :offset="menuOffset"
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
      :offset="menuOffset"
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
import { computed } from 'vue';
import { useAuth } from '@store/useAuth';
import { useSheetManager } from '@store/useSheetManager';
import { storeToRefs } from 'pinia';
import UserProfile from './UserProfile.vue';
import MailingListMenu from './MailingLists/MailingListMenu.vue';
import BuildRegistrarList from './BuildRegistrarList.vue';
import ProfilePicture from '../ProfilePicture.vue';

const auth = useAuth();
const { user } = storeToRefs(auth);

const sheetManager = useSheetManager();
const { readOnlyMode } = storeToRefs(sheetManager);

const menuOffset = [10, 0];

const profilePicture = computed(() => user.value ? user.value.googleProfile.picture : '');
</script>