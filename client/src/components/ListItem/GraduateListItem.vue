<template>
  <ListItemFrame
    :item="item"
    :styled="styled"
  >
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

      <v-spacer></v-spacer>

      <v-sheet
        class="px-3 py-1 d-flex flex-row align-center"
        :color="getActivePanel.color"
        elevation="1"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
      >
        <span>
          {{ graduationYear || 'No Grad Date' }}
        </span>
        <v-tooltip
          :disabled="smAndDown || !item.graduationDate"
          activator="parent"
          location="bottom"
        >
          {{ graduationYearTooltip }}
        </v-tooltip>
      </v-sheet>

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
import { computed } from 'vue'
import { emailValidator, phoneValidator } from '../../EmailUtilities'
import { useSheetManager } from '../../store/useSheetManager'
import ListItemFrame from './ListItemFrame.vue'

const { getActivePanel } = useSheetManager()

const props = defineProps<{
  item: Graduate,
  styled: boolean
}>()

const { smAndDown } = useDisplay()

const graduationYear = computed(() => {
  if (!props.item.graduationDate) return null
  const date = new Date(props.item.graduationDate)
  if (isNaN(date.getFullYear())) return null
  return date.getFullYear()
})

const graduationYearTooltip = computed(() => {
  const thisYear = new Date().getFullYear()
  if (!props.item.graduationDate) return null
  const date = new Date(props.item.graduationDate)
  if (isNaN(date.getFullYear())) return null
  const yearDifference = date.getFullYear() - thisYear
  return yearDifference === 0
    ? 'Graduated this year'
    : yearDifference === 1
      ? 'Graduates next year'
      : yearDifference > 1
        ? `Graduates in ${yearDifference} years`
        : yearDifference === -1
          ? 'Graduated last year'
          : yearDifference < -1
            ? `Graduated ${Math.abs(yearDifference)} years ago`
            : null
})
</script>