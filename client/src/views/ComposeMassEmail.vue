<template>
  <v-sheet
    :color="smAndDown ? 'blue-darken-4' : 'blue-darken-1'"
    style="height: 100vh; width: 100vw;"
    class="d-flex flex-column align-center justify-center"
  >
    <div
      v-if="xs"
      class="mt-10"
    ></div>
    <v-sheet
      class="d-flex flex-column align-center justify-center"
      :elevation="smAndDown ? 0 : 7"
      :style="{
        width: smAndDown ? '100vw' : '500px',
        maxWidth: '500px',
        height: smAndDown ? '100vh' : '',
        borderRadius: smAndDown ? '0px' : '10px',
      }"
      color="blue-darken-4"
    >
      <v-btn
        @click="back"
        variant="text"
        style="position: absolute; left: 0; top: 0"
      >
        <v-icon class="mr-1">
          mdi-arrow-left
        </v-icon>
        Back to Dashboard
      </v-btn>
      <h1
        v-if="!xs"
        class="mt-10"
      >
        <v-icon>
          mdi-email-fast-outline
        </v-icon>
        Compose Mass Email
      </h1>
      <div
        class="d-flex flex-column align-center justify-center"
        style="width: 96%"
      >
        <div
          class="d-flex flex-row mt-5 mb-2"
          style="width: 100%"
        >
          <v-btn
            v-for="(aFilter, index) in filter.filters"
            :key="index"
            @click="filter.selected = aFilter.id"
            :color="aFilter.id === filter.selected ? 'blue' : 'grey'"
            rounded
            icon
            class="mr-1"
            size="x-small"
          >
            <span style="font-size: 0.9rem">
              {{ index + 1 }}
            </span>
          </v-btn>
          <v-btn
            v-if="filter.filters.length < 7"
            @click="addFilter"
            rounded
            icon
            size="x-small"
            color="green"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="removeFilter"
            :disabled="filter.filters.length === 1"
            rounded
            icon
            size="x-small"
            color="red"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-btn
            @click="gate = !gate"
            rounded
            icon
            size="x-small"
            class="ml-1"
          >
            <v-icon>mdi-{{ gate ? 'set-all' : 'set-center'}}</v-icon>
          </v-btn>
        </div>
        <div
          v-for="aFilter in filter.filters"
          :key="aFilter.id"
          v-show="aFilter.id === filter.selected"
          style="width: 100%"
        >
          <MassEmailFilter
            @subset="aFilter.data = $event"
            @loading="loading = $event"
          />
        </div>
        <v-icon
          class="my-3"
          size="x-large"
        >mdi-arrow-down</v-icon>
        <div style="position: relative; width: 100%">
          <v-progress-linear
            v-if="loading"
            indeterminate
            absolute
            color="blue"
          ></v-progress-linear>
          <div
            :style="{
              opacity: loading ? 0.25 : 1,
            }"
            class="px-1 email-box"
          >
            <v-chip
              v-for="email in emails"
              :key="email"
              color="blue-darken-4"
              class="my-1 mr-1 text-center"
            >
              {{ email }}
              <v-icon
                @click="tempEmailFilter.push(email)"
                class="ml-1"
                style="cursor: pointer;"
              >mdi-close</v-icon>
            </v-chip>
            <div v-if="emails.length === 0 && !loading">
              <h3
                style="opacity: 0.5; color: #000"
                class="text-center mt-5"
              >
                <v-icon>mdi-email</v-icon>
                No Emails Found
              </h3>
            </div>
          </div>
          <v-btn
            @click="sendEmail"
            :disabled="emails.length === 0"
            block
            color="white"
            size="large"
            class="my-3"
          >
            Send Email To {{ emails.length }}
            recipient{{ emails.length === 1 ? '' : 's' }}
          </v-btn>
        </div>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDisplay } from "vuetify";
import MassEmailFilter from "../components/MassEmail/MassEmailFilter.vue";

const { smAndDown, xs } = useDisplay();

const loading = ref(false);
const tempEmailFilter = ref([]);

const gate = ref(true)

const emails = computed(() => {
  // if true, or gate, else and gate
  if (gate.value) {
    const allEmails = filter.value.filters.map(filter => filter.data).reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);

    return [...new Set(allEmails)]
      .filter((email) => !tempEmailFilter.value.includes(email));
  } else {
    const allEmails = filter.value.filters.map(filter => filter.data);
    const first = allEmails[0];
    if (allEmails.length === 1) {
      return first.filter((email) => !tempEmailFilter.value.includes(email));
    }
    const rest = allEmails.slice(1);
    return first.filter((email) => {
      return rest.every((emails) => emails.includes(email));
    }).filter((email) => !tempEmailFilter.value.includes(email));
  }
});

const filter = ref({
  filters: [
    {
      id: 0,
      data: [],
    },
  ],
  selected: 0
})

function addFilter() {
  const id = Math.floor(Math.random() * 100_000);
  filter.value.filters.push({
    id,
    data: [],
  });
  filter.value.selected = id;
}

function removeFilter() {
  const id = filter.value.selected;
  const index = filter.value.filters.findIndex((f) => f.id === id);
  filter.value.filters.splice(index, 1);
  if (index === 0) {
    filter.value.selected = filter.value.filters[0].id;
  } else {
    filter.value.selected = filter.value.filters[index - 1].id;
  }
}

const sendEmail = () => {
  const emailString = emails.value.join(",");
  window.open(`mailto:${emailString}`);
};

const back = () => history.back();
</script>

<style scoped>
.email-box {
  height: 200px;
  overflow-y: scroll;
  border: 1px solid rgb(0, 0, 0);
  background: rgb(238, 238, 238);
  border-radius: 5px;
}
</style>