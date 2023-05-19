<template>
  <v-menu v-model="showing">
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <slot
          name="showing"
          v-bind="object"
        ></slot>
      </div>
    </template>

    <v-list>
      <v-list-item
        v-for="tool in tools"
        :key="tool.name"
        @click="tool.handler"
        class="type-list-item"
      >
        {{ tool.name }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { incrementStudentYear } from '../../StudentTools'
import { ref, computed } from 'vue'

const showing = ref(false)

const object = computed(() => {
  return {
    showing: showing.value
  }
})

const warn = async (callbackFunction: () => void) => {
  console.log('this is your warning')
  callbackFunction()
}

const tools = [
  {
    name: 'Increment Student Year',
    handler: () => {
      warn(incrementStudentYear).then(() => {
        // refresh the data
      })
    }
  }
]
</script>

<style scoped>
.type-list-text {
  font-size: 1.2em;
  font-weight: 700;
  text-transform: capitalize;
}
</style>