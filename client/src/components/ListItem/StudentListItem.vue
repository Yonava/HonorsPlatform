<template>
  <LIFrame
    :item="item"
    :styled="styled"
  >

    <template #left>

      <LIIcon
        v-if="item.athletics"
        :icon="icon"
        :tooltip="iconTooltip"
      />

      <LITitle
        :primary="{
          text: item.name || '(No Name)',
        }"
        :secondary="{
          text: item.id || '(No ID)',
          tooltip: 'Student ID',
        }"
      />

    </template>

    <template #right>

      <LIEmblem
        :color="status.color"
        :text="status.status"
        :tooltip="status.tooltip"
      />

    </template>

    <template #corners>
      <LIBottomCorner
        :left="{
          icon: studentPanel.propIcons.email,
          text: item.email || '(No Email)',
          error: !emailValid
        }"
        :right="{
          icon: studentPanel.propIcons.year,
          text: item.year || '(No Class Year)',
        }"
      />
    </template>

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Student } from '@apptypes/sheetItems'
import { athleticOptions, statusOptions } from '@utils/students'
import { emailValidator } from '@utils/emails'
import { getPanel } from '@panels'
import {
  LIFrame,
  LIIcon,
  LITitle,
  LIEmblem,
  LIBottomCorner
} from './ListItemParts/ListItemExports'

const props = defineProps<{
  item: Student,
  styled?: boolean
}>()

const studentPanel = getPanel('STUDENTS')

const status = computed(() => {
  return statusOptions.find((option) => option.status === props.item.activeStatus) ?? {
    color: 'grey',
    tooltip: props.item.activeStatus ? 'Invalid Status' : 'No Status Assigned',
    status: props.item.activeStatus || 'No Status'
  }
})

const icon = computed(() => {
  return athleticOptions[props.item.athletics]
})

const iconTooltip = computed(() => {
  return `Participates In ${props.item.athletics}`
})

const emailValid = computed(() => emailValidator(props.item.email))
</script>