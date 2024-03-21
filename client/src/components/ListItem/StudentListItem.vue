<template>
  <LIFrame :item="item">

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
        :left="leftCorner"
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
import { useSheetManager } from '@store/useSheetManager'
import { storeToRefs } from 'pinia'
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
}>()

const { activeSort } = storeToRefs(useSheetManager())

const leftCorner = computed(() => {
  return activeSort.value.prop === 'points' ? {
    icon: studentPanel.propIcons.points,
    text: props.item.points || '0',
    tooltip: 'Points Earned',
  } : {
    icon: studentPanel.propIcons.email,
    text: props.item.email || '(No Email)',
    error: !emailValid
  }
})

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