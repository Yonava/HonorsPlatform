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
      <p style="font-weight: 200">
        {{ item.studentId }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.title"
          placeholder="Thesis Title"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <update-button
          @updated="$emit('update', $event)"
          :item="item"
        />
      </div>
      <v-divider class="my-2"></v-divider>

      <v-text-field
        v-model="item.email"
        label="Student Email"
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>

      <div class="d-flex align-center flex-row">
        <v-text-field
          v-model="item.term"
          label="Term"
        >
          <template #prepend>
            <v-icon>mdi-calendar</v-icon>
          </template>
        </v-text-field>
        <v-btn
          class="ml-6"
          color="green"
          @click="item.term = getCurrentTerm()"
        >Current Term</v-btn>
      </div>

      <div class="d-flex flex-row">
        <v-select
          v-model="item.decision"
          :items="[
            'Approved',
            'Rejected',
            'Pending',
          ]"
          label="Decision"
          class="mr-6"
          :prepend-icon="item.decision === 'Approved' ? 'mdi-check-circle' : item.decision === 'Rejected' ? 'mdi-close-circle' : 'mdi-alert-circle'"
        ></v-select>
        <v-text-field
          v-model="item.proposalReceived"
          label="Proposal Received"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
      </div>
      <v-text-field
        v-model="item.draftReceived"
        label="Draft Received"
        prepend-icon="mdi-calendar-check"
      ></v-text-field>
      <div class="d-flex flex-row align-center justify-center">
        <v-text-field
          v-model="item.mentor"
          label="Faculty Mentor"
          class="mr-6"
        >
          <template #prepend>
            <v-icon>mdi-human-male-board</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="item.mentorEmail"
          label="Faculty Mentor Email"
        >
          <template #prepend>
            <v-icon>mdi-email</v-icon>
          </template>
        </v-text-field>
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
          v-model="item.note"
          auto-grow
          variant="outlined"
          clearable
          label="Thesis Notes"
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
          delete thesis
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, toRefs } from 'vue'
import { getCurrentTerm, termValidator } from '../TermValidator'
import { useElementSize } from '@vueuse/core'
import { Thesis } from '../SheetTypes'
import UpdateButton from './UpdateButton.vue'

const props = defineProps<{
  item: Thesis
}>()

const { item } = toRefs(props)

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const emits = defineEmits([
  'delete', 
  'update', 
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