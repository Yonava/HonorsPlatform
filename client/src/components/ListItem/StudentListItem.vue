<template>
  <ListItemFrame
    :item="item"
    :styled="styled"
  >
    <div class="d-flex flex-row">
      <div>
        <v-icon
          v-if="item.athletics"
          class="mr-2"
        >
          {{ 'mdi-' + athleticOptions[item.athletics] }}
        </v-icon>
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >{{ 'Athlete: ' + item.athletics }}</v-tooltip>
      </div>
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.name || '(No Name)' }}
        <span
          class="mr-1"
          style="font-weight: 300; font-size: 0.6em"
        >
          {{ item.id || '(No ID)' }}
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Student ID</v-tooltip>
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-sheet
        :color="status.color"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
        class="px-2"
        elevation="1"
      >
        {{ status.status }}
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >
          {{ status.tooltip }}
        </v-tooltip>
      </v-sheet>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div class="d-flex flex-row">
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-email
          </v-icon>
          <p :style="{
            color: emailValid ? 'black' : 'red',
            textDecoration: emailValid ? 'none' : 'line-through',
            fontWeight: emailValid ? 'normal' : 'bold',
          }">
            {{ item.email || '(No Email)' }}
          </p>
          <v-tooltip
            :disabled="smAndDown || emailValid"
            activator="parent"
            location="bottom"
          >
            Email is invalid
          </v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex">
          <p>
            {{ item.year || '(No Class Year)' }}
          </p>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-briefcase
          </v-icon>
          <!-- <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >
            Class Year
          </v-tooltip> -->
        </div>
      </div>
    </div>
  </ListItemFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Student } from '../../SheetTypes'
import { athleticOptions, statusOptions } from '../../StudentTools'
import { emailValidator } from '../../EmailUtilities'
import { useDisplay } from 'vuetify'
import ListItemFrame from './ListItemFrame.vue'

const props = defineProps<{
  item: Student,
  styled?: boolean
}>()

const { smAndDown } = useDisplay()

const status = computed(() => {
  return statusOptions.find((option) => option.status === props.item.activeStatus) ?? {
    color: 'grey',
    tooltip: props.item.activeStatus ? 'Invalid Status' : 'No Status Assigned',
    status: props.item.activeStatus || 'No Status'
  }
})

// save logic for when list item property toggle is added
const points = computed(() => {
  if (!props.item.points) return 0
  return props.item.points.toLocaleString()
})

const emailValid = computed(() => emailValidator(props.item.email))
</script>