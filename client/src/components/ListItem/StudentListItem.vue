<template>
  <LIFrame
    :item="item"
    :styled="styled"
  >

    <div class="d-flex flex-row">

      <LIIcon
        v-if="item.athletics"
        :icon="athleticOptions[item.athletics]"
        :tooltip="`Participates In ${item.athletics}`"
      />

      <LITitle
        :primaryText="item.name || '(No Name)'"
        :secondaryText="item.id || '(No ID)'"
        secondaryTooltip="Student ID"
      />

      <v-spacer></v-spacer>

      <LIEmblem
        :color="status.color"
        :text="status.status"
        :tooltip="status.tooltip"
      />

    </div>

    <LIBottomCorner
      :data="cornerData"
    />

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Student } from '../../SheetTypes'
import { athleticOptions, statusOptions } from '../../StudentTools'
import { emailValidator } from '../../EmailUtilities'
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

const status = computed(() => {
  return statusOptions.find((option) => option.status === props.item.activeStatus) ?? {
    color: 'grey',
    tooltip: props.item.activeStatus ? 'Invalid Status' : 'No Status Assigned',
    status: props.item.activeStatus || 'No Status'
  }
})

const emailValid = computed(() => emailValidator(props.item.email))

const cornerData = computed(() => [
  {
    icon: 'mdi-email',
    text: props.item.email || '(No Email)',
    error: !emailValid.value
  },
  {
    icon: 'mdi-briefcase',
    text: props.item.year || '(No Class Year)',
  }
])
</script>