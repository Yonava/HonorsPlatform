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
import IncrementStudentYearDialog from '../IncrementStudentYear.vue'

import { useSheetManager } from '../../store/useSheetManager'
import { useDialog } from '../../store/useDialog'
import { ref, computed } from 'vue'
import { warn } from '../../Warn'

const showing = ref(false)
const { open } = useDialog()
const { fetchItems } = useSheetManager()

const object = computed(() => {
  return {
    showing: showing.value
  }
})

const test = () => {
  setTimeout(() => {
    fetchItems()
  }, 5000)
}

const tools = [
  {
    name: 'Increment Student Year',
    handler: () => {
      warn().then(() => {
        open({
          component: IncrementStudentYearDialog,
        })
      }).catch(err => {
        console.log('motherfucker cancelled!')
      })
    }
  },
  {
    name: 'Test',
    handler: () => {
      warn(test, [{
        body: {
          title: 'Test',
          description: 'This is a test',
          buttons: [
            {
              text: 'Test',
              onClick: () => {
                fetchItems()
              }
            }
          ]
        }
      }])
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