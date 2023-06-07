<template>
  <v-sheet class="pa-5">
    <h1 class="mb-5">
      Select the categories to include:
    </h1>
    <div class="button-group">
      <v-btn
        v-for="header in headerRow"
        :key="header"
        @click="toggleHeader(header)"
        :color="selectedHeaders.includes(header) ? studentPanel.color : 'grey'"
        rounded
      >
        {{ header }}
      </v-btn>
    </div>
    <v-divider class="my-5"></v-divider>

    <v-btn
      @click="createTempSheet"
      :disabled="selectedHeaders.length === 0"
      :color="studentPanel.color"
      :loading="creatingTempSheet"
      block
    >
      Create
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { headerRowMemo, getEvery, replaceRange, Range } from '../SheetsAPI'
import { getPanel } from '../Panels'
import { useDialog } from '../store/useDialog'
import { useSheetManager } from '../store/useSheetManager'

const studentPanel = getPanel('STUDENTS')

const headerRow = headerRowMemo[studentPanel.sheetRange]
const selectedHeaders = ref([])
const creatingTempSheet = ref(false)

const createTempSheet = async () => {
  creatingTempSheet.value = true
  const students = await studentPanel.mappers.unmap(useSheetManager().filteredItems as any[]);
  const selectedIndices = headerRow.map((header, i) => selectedHeaders.value.includes(header) ? i : -1).filter(i => i !== -1)

  await replaceRange(
    Range.TEMPORARY_DATA,
    [
      headerRow.filter((_, i) => selectedIndices.includes(i)),
      ...students.map(student => selectedIndices.map(i => student[i]))
    ],
  )

  useDialog().open({
    body: {
      title: 'Success',
      description: 'Temporary sheet created successfully.',
      buttons: [
        {
          text: 'Done',
          color: studentPanel.color,
          onClick: () => {
            useDialog().close()
          }
        },
        {
          text: 'Open New Sheet',
          color: 'success',
          onClick: () => {
            const url = 'https://docs.google.com/spreadsheets/d/1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y/edit#gid=1991464373'
            window.open(url, '_blank')
          }
        }
      ]
    }
  })
}

const toggleHeader = (header: string) => {
  if (selectedHeaders.value.includes(header)) {
    return selectedHeaders.value.splice(selectedHeaders.value.indexOf(header), 1)
  } else {
    selectedHeaders.value.push(header)
  }
}
</script>

<style scoped>
.button-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
</style>