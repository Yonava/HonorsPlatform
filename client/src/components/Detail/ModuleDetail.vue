<template>
  <div
    ref="el"
    :class="[
      'pa-5',
      'd-flex',
      sm ? 'flex-column' : 'flex-row'
    ]"
  >
    <div>

      <DetailHeader
        v-model="item.courseCode"
        :id="item.studentId"
        placeholder="Course Code"
      />

      <v-text-field
        v-model="item.term"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <v-btn
        @click="item.instructor = instructorAutoComplete(item.instructor)"
        :disabled="!instructorAutoComplete(item.instructor)"
        color="orange-darken-2"
        size="x-small"
        class="mb-2"
      >{{ instructorAutoComplete(item.instructor) || 'No Suggestions' }}</v-btn>
      <v-text-field
        v-model="item.instructor"
        label="Instructor"
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
      <h1 class="mb-2">
        Documentation
      </h1>
      <div class="d-flex flex-row">
        <v-text-field
          v-model="item.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="item.docuSignCompleted"
          label="DocuSign Completed"
        >
          <template #prepend>
            <v-icon>mdi-calendar-check</v-icon>
          </template>
        </v-text-field>
      </div>
      <div
        style="transform: translateY(-15px);"
        class="d-flex flex-row"
      >
        <v-btn
          v-if="!item.docuSignCreated"
          @click="item.docuSignCreated = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Created Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!item.docuSignCompleted"
          @click="item.docuSignCompleted = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Completed Now</v-btn>
      </div>
      <FinishModuleModal
        @success="emits('unselect')"
        @close="moveModuleDialog = false"
        :show="moveModuleDialog"
        :module="item"
      />
    </div>
    <div
      :class="[
        sm ? '' : 'ml-5',
        'd-flex',
        'flex-column',
        'align-center'
      ]"
      :style="sm ? '' : 'width: 55%'"
    >
      <div style="width: 100%;">
        <v-textarea
          v-model="item.description"
          auto-grow
          variant="outlined"
          clearable
          label="Module description"
        ></v-textarea>
      </div>
      <div
        :class="[
          'd-flex',
          'flex-column'
        ]"
        style="width: 100%"
      >
        <v-btn
          @click="moveModuleDialog = true"
          color="orange-darken-2"
          size="large"
        >
          <v-icon
            class="mr-2"
            size="x-large"
          >mdi-check</v-icon>
          Mark Module As Completed
        </v-btn>
        <v-btn
          @click="$emit('delete')"
          size="large"
          color="red"
          class="mt-3"
        >
          <v-icon
            class="mr-2"
            size="x-large"
          >mdi-delete</v-icon>
          delete module
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import { Module } from '../../SheetTypes'
import { termValidator } from '../../TermValidator'
import DetailHeader from './Helper/DetailHeader.vue'
import FinishModuleModal from './Helper/FinishModuleModal.vue'
import { instructorAutoComplete } from '../../InstructorAutoComplete'

const props = defineProps<{
  item: Module
}>()

const emits = defineEmits([
  'delete',
  'unselect'
])

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const moveModuleDialog = ref(false)
</script>