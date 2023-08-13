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
            style="border-radius: 50%; width: 100%; height: 100%; object-fit: cover; box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); border: 3px solid white; cursor: pointer;"
          />
        </template>
        <v-sheet class="px-4 py-6">
          <v-btn
            @click="userLogoutFlow"
            block
            color="red"
          >
            Logout
          </v-btn>
        </v-sheet>
      </v-menu>
      <v-tooltip
        activator="parent"
        location="end"
      >
        {{ googleProfile.name }}
      </v-tooltip>
    </div>
    <v-btn
      @click="$router.push({ name: 'registrar' })"
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
    <v-btn
      @click="$router.push({ name: 'email' })"
      icon
    >
      <v-icon>
        mdi-email-fast-outline
      </v-icon>
      <v-tooltip
        :disabled="smAndDown"
        activator="parent"
        location="end"
      >Compose Mass Email</v-tooltip>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { useAuth } from '../../store/useAuth';
import { storeToRefs } from 'pinia';

const auth = useAuth();
const { googleProfile } = storeToRefs(auth);
const { userLogoutFlow } = auth;

const { smAndDown } = useDisplay();
</script>