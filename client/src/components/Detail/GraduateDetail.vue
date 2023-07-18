<template>
  <DetailFrame
    v-model="grad.note"
    :item="grad"
  >
    <template #main>
      <DetailHeader
        v-model="grad.name"
        :id="grad.id"
        :item="grad"
        placeholder="Name"
      >
        <template
          v-if="!grad.id"
          #id
        >
          <v-btn
            @click="generateGradId"
            :color="getActivePanel.color"
            size="x-small"
          >
            Generate Grad ID
          </v-btn>
        </template>
      </DetailHeader>

      <div class="d-flex align-center">
        <v-text-field
          v-model="grad.email"
          :rules="[(v) => emailValidator(v) || 'Invalid email']"
          clearable
          label="Email"
          prepend-icon="mdi-email"
        ></v-text-field>
        <v-btn
          v-if="grad.email"
          @click="sendEmail(grad.email)"
          :color="getActivePanel.color"
          size="small"
          class="ml-4"
        >
          email
        </v-btn>
      </div>

      <v-text-field
        v-model="grad.phone"
        :rules="[(v) => phoneValidator(v) || 'Invalid phone number']"
        clearable
        label="Phone"
        prepend-icon="mdi-phone"
      ></v-text-field>

      <v-btn
        v-if="!grad.graduationDate"
        @click="grad.graduationDate = new Date().toLocaleString().split(',')[0]"
        :color="getActivePanel.color"
        size="x-small"
        class="mb-2"
        >Today</v-btn
      >
      <v-text-field
        v-model="grad.graduationDate"
        clearable
        label="Graduation Date"
        prepend-icon="mdi-calendar"
      ></v-text-field>
    </template>
    <template #buttons>
      <v-btn
        @click="sendBackToStudents"
        :loading="movingGrad"
        :color="studentPanel.color"
        size="large"
      >
        <v-icon
          class="mr-4"
          size="x-large"
        >
          mdi-account-arrow-right
        </v-icon>
        Move Back to Students
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailFrame from "./Helper/DetailFrame.vue";
import DetailHeader from "./Helper/DetailHeader.vue";

import { ref, computed } from "vue";
import {
  emailValidator,
  phoneValidator,
  sendEmail,
} from "../../EmailUtilities";
import { moveToStudents } from '../../StudentTools'
import { useSheetManager } from "../../store/useSheetManager";
import { useUpdateItem } from "../../TrackItemForUpdate";
import { useDialog } from "../../store/useDialog";
import { warn } from "../../Warn";
import { getPanel } from "../../Panels";
import { Graduate } from "../../SheetTypes";

const { setPanel, getActivePanel } = useSheetManager();

const props = defineProps<{
  item: Graduate;
}>();

const studentPanel = getPanel('STUDENTS');

const grad = computed(() => props.item);

useUpdateItem(grad);

const { open, close } = useDialog();

const movingGrad = ref(false);

async function generateGradId() {
  const newId = "G" + Math.random().toString().substring(2, 9);
  grad.value.id = newId;
}

async function sendBackToStudents() {
  if (typeof grad.value.row !== "number") return;
  movingGrad.value = true;
  try {
    await warn({
      description: `Are you sure you want to move this ${getActivePanel.title.singular.toLowerCase()} back to ${getActivePanel.title.plural.toLowerCase()}? Information like phone number and graduation date will be permanently lost.`
    });
  } catch (e) {
    movingGrad.value = false;
    return;
  }

  const _grad = JSON.parse(JSON.stringify(grad.value));

  try {
    await moveToStudents(_grad)
  } catch (e) {
    movingGrad.value = false;
    console.error(e);
    return;
  }

  open({
    body: {
      title: "Success!",
      description: `${_grad.name || getActivePanel.title.singular} has been moved over to ${studentPanel.title.plural}.`,
      buttons: [
        {
          text: "Dismiss",
          color: getActivePanel.color,
          onClick: close,
        },
        {
          text: `View ${studentPanel.title.singular} Profile`,
          color: studentPanel.color,
          onClick: () => {
            setPanel(studentPanel.panelName, {
              value: _grad.sysId,
            });
            close();
          },
        }
      ],
    },
  });
}
</script>