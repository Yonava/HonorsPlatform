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
        v-model="item.completedDate"
        label="Completed Date"
      >
        <template #prepend>
          <v-icon>mdi-check</v-icon>
        </template>
      </v-text-field>
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
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
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
      <div class="d-flex flex-column align-center justify-center">
        <h2>
          Final Grade
        </h2>
        <input
          v-model="item.grade"
          type="text"
          class="header-input"
          placeholder="Grade"
          style="font-size: 5em; text-align: center;"
        >
      </div>
    </div>
    <v-divider
      v-if="sm"
      class="my-2"
    ></v-divider>
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
          @click="$emit('delete')"
          size="large"
          color="red"
          class="mt-3"
        >
          <v-icon
            class="mr-4"
            size="x-large"
          >mdi-delete</v-icon>
          delete completed module
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import { watch, ref, toRefs } from 'vue'
import { useElementSize } from '@vueuse/core'
import { CompletedModule } from '../SheetTypes'

const props = defineProps<{
  item: CompletedModule
}>()

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const emits = defineEmits([
  'delete',
  'unselect'
])
</script>

<style scoped>
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