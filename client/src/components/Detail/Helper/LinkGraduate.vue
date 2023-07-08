<template>
  <v-sheet class="px-4">
    <h1 class="my-2">
      Select Graduate:
    </h1>
    <div
      class="mb-6"
      style="overflow: auto; max-height: 600px;"
    >
      <div
        v-for="graduate in [...Graduates.list].sort((a, b) => a.name.localeCompare(b.name))"
        :key="graduate.sysId"
        @click="graduateLinked(graduate.sysId)"
        class="d-flex flex-row align-center clickable"
      >
        <h2>
          {{ graduate.name || '(No Name)' }}
        </h2>
        <span style="font-size: 0.9rem;">
          ({{ graduate.id || 'No ID' }})
        </span>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../../../store/useDialog'
import { useDocumentCache } from '../../../store/useDocumentCache'

const { Graduates, getSelectedItem } = useDocumentCache()

const graduateLinked = (sysId: string) => {
  const itemToModify = getSelectedItem()
  // if itemToModify does not have a studentSysId return and log an error
  if (!itemToModify?.studentSysId) {
    console.error('Link Student: No studentSysId found on itemToModify')
    return
  }
  itemToModify.studentSysId = sysId
  useDialog().close()
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s;
  padding: 5px;
  gap: 10px;
}

.clickable:hover {
  background-color: #e0e0e0;
}
</style>