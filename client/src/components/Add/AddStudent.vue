<template>
  <v-sheet >

  </v-sheet>
</template>

<script setup lang="ts">
import type { Student } from '../../SheetTypes'

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