<template>
  <LIFrame
    :item="item"
    :styled="styled"
  >

    <template #left>

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
        :color="getActivePanel.color"
        :text="graduationYear?.toString() || '(No Grad Date)'"
        :tooltip="graduationYearTooltip"
        :icon="graduationYear ? 'school' : 'alert'"
      />

    </template>

    <template #corners>
      <LIBottomCorner
        :left="{
          text: item.email || '(No Email)',
          icon: 'email',
          error: !emailValidator(item.email)
        }"
        :right="{
          text: item.phone || '(No Phone)',
          icon: 'phone',
          error: !phoneValidator(item.phone)
        }"
      />
    </template>


  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { emailValidator, phoneValidator } from '@utils/emails'
import { useSheetManager } from '@store/useSheetManager'
import { Graduate } from '@apptypes/sheetItems'
import {
  LIFrame,
  LITitle,
  LIEmblem,
  LIBottomCorner
} from './ListItemParts/ListItemExports'

const { getActivePanel } = useSheetManager()

const props = defineProps<{
  item: Graduate,
  styled: boolean
}>()

const graduationYear = computed(() => {
  if (!props.item.graduationDate) {
    return
  }
  const date = new Date(props.item.graduationDate)
  if (isNaN(date.getFullYear())) {
    return
  }
  return date.getFullYear()
})

const graduationYearTooltip = computed(() => {

  const thisYear = new Date().getFullYear()
  if (!props.item.graduationDate) {
    return
  }

  if (!graduationYear.value) {
    return
  }

  const yearDifference = graduationYear.value - thisYear
  return yearDifference === 0
    ? 'Graduated This Year'
    : yearDifference === 1
      ? 'Graduates Next Year'
      : yearDifference > 1
        ? `Graduates In ${yearDifference} Years`
        : yearDifference === -1
          ? 'Graduated Last Year'
          : yearDifference < -1
            ? `Graduated ${Math.abs(yearDifference)} Years Ago`
            : undefined
})
</script>