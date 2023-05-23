<template>
  <div>
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
        :color="color"
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
        {{ item.activeStatus || 'No Status' }}
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >Status</v-tooltip>
      </v-sheet>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div class="email d-flex flex-row">
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-email
          </v-icon>
          <p :style="emailTextStyles">
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
            {{ points }}
          </p>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-ticket
          </v-icon>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Points</v-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Student } from '../../SheetTypes'
import { athleticOptions } from '../../Athletics'
import { emailValidator } from '../../EmailUtilities'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  item: Student
}>()

const { smAndDown } = useDisplay()

const color = computed(() => {
  if (props.item.activeStatus.toLowerCase() === 'active') return 'green'
  if (props.item.activeStatus.toLowerCase() === 'inactive') return 'red'
  return 'grey'
})

const points = computed(() => {
  if (!props.item.points) return 0
  return props.item.points.toLocaleString()
})

const emailValid = computed(() => emailValidator(props.item.email))

const emailTextStyles = computed(() => {
  if (emailValid) return {}
  return {
    color: 'red',
    fontWeight: 'bold',
    textDecoration: 'line-through',
  }
})
</script>