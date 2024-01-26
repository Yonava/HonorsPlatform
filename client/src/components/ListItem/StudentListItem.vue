<template>
  <LIFrame
    :item="item"
    :styled="styled"
    :bottomCorners="[
      {
        prop: 'email',
        icon: 'email',
        text: item.email || '(No Email)',
        error: !emailValid
      },
      {
        prop: 'year',
        icon: 'briefcase',
        text: item.year || '(No Class Year)',
      }
    ]"
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

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Student } from '../../SheetTypes'
import { athleticOptions, statusOptions } from '@utils/students'
import { emailValidator } from '@utils/emails'
import {
  LIFrame,
  LIIcon,
  LITitle,
  LIEmblem,
} from './ListItemParts/ListItemExports'

const props = defineProps<{
  item: Student,
  styled?: boolean
}>()

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