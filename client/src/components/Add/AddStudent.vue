<template>
  <v-sheet
    color="white"
    class="pa-5"
  >
    <div class="d-flex flex-row align-center">
      <h1>
        Add a {{ panel.title.singular }}
      </h1>
    </div>
    <v-text-field
      variant="outlined"
      label="Name"
    ></v-text-field>
    <v-text-field
      variant="outlined"
      label="ID"
    ></v-text-field>
    <v-text-field
      variant="outlined"
      label="Email"
    ></v-text-field>
  </v-sheet>
</template>

<script setup lang="ts">
import type { Student } from '../../SheetTypes'
import { getPanel } from '../../Panels'

const panel = getPanel('STUDENTS')

const student: Student = {
  sysId: Math.random().toString(36).substring(10),
  id: '',
  name: '',
  email: '',
  year: '',
  activeStatus: '',
  points: 0,
  athletics: '',
  note: '',
  misc: {},
  row: -1,
}
</script>