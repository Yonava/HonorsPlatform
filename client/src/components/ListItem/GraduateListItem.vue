<template>
  <ListItemFrame :item="item">
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.name || '(No Name)' }}
        <span style="font-weight: 300; font-size: 0.6em">
          {{ item.id || '(No ID)' }}
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >ID</v-tooltip>
        </span>
      </div>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div class="d-flex flex-row align-center">
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-email
          </v-icon>
          <p
            :style="{
              'text-decoration': emailValidator(item.email) ? '' : 'line-through',
              'color': emailValidator(item.email) ? '' : 'red',
              'font-weight': emailValidator(item.email) ? '' : '900'
            }"
          >
            {{ item.email || '(No Email)' }}
          </p>
          <v-tooltip
            :disabled="smAndDown || emailValidator(item.email)"
            activator="parent"
            location="bottom"
          >
            Email is invalid
          </v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-row align-center">
          <p
            :style="{
              'text-decoration': phoneValidator(item.phone) ? '' : 'line-through',
              'color': phoneValidator(item.phone) ? '' : 'red',
              'font-weight': phoneValidator(item.phone) ? '' : '900'
            }"
          >
            {{ item.phone || '(No Phone)' }}
          </p>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-phone
          </v-icon>
          <v-tooltip
            :disabled="smAndDown || phoneValidator(item.phone)"
            activator="parent"
            location="bottom"
          >
            Phone number is invalid
          </v-tooltip>
        </div>
      </div>
    </div>
  </ListItemFrame>
</template>

<script setup lang="ts">
import { Graduate } from '../../SheetTypes'
import { useDisplay } from 'vuetify'
import { emailValidator, phoneValidator } from '../../EmailUtilities'
import ListItemFrame from './ListItemFrame.vue'

const props = defineProps<{
  item: Graduate
}>()

const { smAndDown } = useDisplay()
</script>