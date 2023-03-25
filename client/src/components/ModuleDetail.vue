<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ item.studentId }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.courseCode"
          placeholder="Course Code"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <v-btn 
          @click="reqUpdateModule"
          :loading="updating"
          :color="upToDate ? 'green' : 'orange-darken-2'"
          :style="{
            cursor: upToDate ? 'default' : 'pointer',
          }"
          rounded
          class="ml-7"
        >{{ upToDate ? 'All Synced Up!' : 'Update Module' }}</v-btn>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="item.term"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.instructor"
        label="Instructor"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
    </div>
    <div 
      style="width: 45%;" 
      class="ml-5 d-flex flex-column"
    >
      <span 
        @click="emits('delete')"
        class="delete d-flex align-center mb-2"
      >
        <v-icon>mdi-delete</v-icon>
        delete module permanently
      </span>
      <v-textarea
        v-model="item.description"
        clearable
        label="Description"
      ></v-textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  defineProps, 
  defineEmits, 
  watch, 
  computed,
  toRefs, 
  onMounted,
  onUnmounted
} from 'vue'
import { updateByRow } from '../SheetsAPI'
import { useAutoSync, useChangeWatcher } from '../AutoSync'
import { unmapModules } from '../DataMappers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  autoSync: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits(['delete'])

const updating = ref(false)

const { item, autoSync } = toRefs(props)
useAutoSync(autoSync, reqUpdateModule)
const { upToDate } = useChangeWatcher(item)

async function reqUpdateModule() {
  if (upToDate.value) return
  updating.value = true
  await updateByRow('Modules', item.value.row, unmapModules([item.value]))
  upToDate.value = true
  updating.value = false
}
</script>

<style scoped>
.delete {
  color: red;
  cursor: pointer;
}

.delete:hover {
  text-decoration: underline;
}

input.header-input {
  font-weight: 900; 
  font-size: 3em; 
  line-height: 0.9; 
  width: 100%;
}

input.header-input:focus {
  outline: none;
}
</style>