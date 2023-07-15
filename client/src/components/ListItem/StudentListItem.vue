<template>
  <div
    @dragstart="dragStart"
    :draggable="lgAndUp && !isSelected(item)"
    :class="[
      'item-card',
      'pa-3',
      isSelected(item) ? 'selected-item-card' : ''
    ]"
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
        :color="statusColor"
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
import { Student, SheetItem } from '../../SheetTypes'
import { athleticOptions, statusOptions } from '../../StudentTools'
import { emailValidator } from '../../EmailUtilities'
import { useDisplay } from 'vuetify'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useSheetManager } from '../../store/useSheetManager'

const { getSelectedItems } = useDocumentCache()

const props = defineProps<{
  item: Student
}>()

const { smAndDown, lgAndUp } = useDisplay()

const statusColor = computed<typeof statusOptions[number]['color']>(() => {
  return statusOptions.find((option) => option.label === props.item.activeStatus)?.color ?? 'grey'
})

const points = computed(() => {
  if (!props.item.points) return 0
  return props.item.points.toLocaleString()
})

const emailValid = computed(() => emailValidator(props.item.email))

const isSelected = (item: SheetItem) => {
  const selectedItems = getSelectedItems()
  if (!selectedItems) return false
  return selectedItems.map((item) => item.sysId).includes(item.sysId)
}

const dragStart = () => {
  useSheetManager().listItemBeingDragged = props.item
}
</script>