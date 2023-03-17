<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ student.id }}
      </p>
      <div class="d-flex flex-row align-center">
        <h1 style="font-weight: 900; font-size: 3em; line-height: 0.9">
          {{ student.name }}
        </h1>
        <v-icon 
          class="ml-4"
          size="large"
          style="cursor: pointer;"
          @click="editing = !editing"
        >
          mdi-pencil
        </v-icon>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="student.email"
        label="Email"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="student.points"
        label="Points"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-ticket</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="student.activeStatus"
        label="Active Status"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-card-account-details</v-icon>
        </template>
      </v-text-field>
      <v-divider class="my-2"></v-divider>
      <div>
        <h2>
          Modules In Progress:
        </h2>
        <ModuleFetch :studentId="student.id" />
      </div>
      <v-divider class="my-2"></v-divider>
      <h2>
        Other:
      </h2>
      <div 
        style="overflow: auto; max-height: 180px;"
        class="d-flex flex-row flex-wrap"
      >
        <div
          v-for="(value, key) in student.misc"
          :key="key"
          style="width: 30%;"
          class="mx-1"
        >
          <v-text-field
            :label="key"
            outlined
            v-model="student.misc[key]"
          ></v-text-field>
        </div>
      </div>
    </div>
    <div 
      style="width: 45%;" 
      class="ml-5 d-flex flex-column"
    >
      <span 
        @click="reqDeleteStudent(student.rowNum)"
        style="color: red; cursor: pointer" 
        class="d-flex align-center mb-2 delete-student"
      >
        <v-icon>mdi-delete</v-icon>
        delete {{ student.name }} permanently
      </span>
      <v-textarea
        v-model="student.note"
        clearable
        :label="`leave a note on ${student.name}`"
        no-resize
      ></v-textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import ModuleFetch from './ModuleFetch.vue'

const props = defineProps({
  student: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['delete'])

const editing = ref(false)

const reqDeleteStudent = (rowNum) => {
  emits('delete', rowNum)
}
</script>

<style scoped>
.delete-student:hover {
  color: #e74c3c;
  text-decoration: underline;
}
</style>