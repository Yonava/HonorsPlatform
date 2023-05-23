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
      <slot name="main"></slot>
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
      :style="sm ? '' : 'width: 55%; max-width: 450px'"
    >
      <div style="width: 100%;">
        <v-textarea
          v-model="notepad"
          auto-grow
          variant="outlined"
          clearable
          label="Notes"
        ></v-textarea>
      </div>
      <div
        :class="[
          'd-flex',
          'flex-column'
        ]"
        style="width: 100%"
      >
        <slot name="buttons"></slot>
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
          remove
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  'update:modelValue': (value: string) => void,
  delete: () => void
}>()

const notepad = computed({
  get: () => props.modelValue,
  set: (value) => {
    emits['update:modelValue'](value)
  }
})
</script>