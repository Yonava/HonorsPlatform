<template>
  <ListItemFrame :item="item">
    <div class="d-flex flex-row">
      <div style="font-weight: 800; font-size: 1.35em; line-height: 1">
        {{ item.event || '(No Event Name)' }}
      </div>

      <v-spacer></v-spacer>

      <v-sheet
        class="px-3 py-1 d-flex flex-row align-center"
        :color="getPanel('GRADUATE_ENGAGEMENTS').color"
        elevation="1"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
      >
        <v-icon class="mr-1">mdi-calendar</v-icon>
        <span>{{ item.dateTime ? dateTimeDisplay : 'No Event Date' }}</span>
        <v-tooltip
          :disabled="smAndDown || !item.dateTime"
          activator="parent"
          location="bottom"
        >{{ item.dateTime }}</v-tooltip>
      </v-sheet>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div
          class="d-flex flew-row align-center"
        >
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            {{ grad.icon }}
          </v-icon>
          <p>
            {{ grad.text }}
          </p>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >
            {{ grad.tooltip }}
          </v-tooltip>
        </div>
        <v-spacer></v-spacer>
      </div>
    </div>
  </ListItemFrame>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import { getPanel } from '../../Panels';
import { useStudentInfo } from './useStudentInfo'
import ListItemFrame from './ListItemFrame.vue';

const { smAndDown } = useDisplay()

const props = defineProps<{
  item: any,
}>()

const dateTimeDisplay = computed(() => {
  return props.item.dateTime.toLowerCase().split('at')[0]
})

const grad = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>