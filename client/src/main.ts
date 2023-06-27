import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { getEvery, replaceRange, Range, headerRowMemo } from './SheetsAPI'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
})

const pinia = createPinia()

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .mount('#app')

app.directive('uppercase', {
  update(el) {
    el.value = el.value.toUpperCase()
  }
})