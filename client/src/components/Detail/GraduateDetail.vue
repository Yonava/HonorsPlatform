<template>
  <DetailFrame
    v-model="grad.note"
    :disableDelete="!canDelete"
    disableReason="All engagements must be removed before deleting a graduate"
  >
    <template #main>
      <DetailHeader v-model="grad.name" :id="grad.id" placeholder="Name">
        <template v-if="!grad.id" #id>
          <v-btn @click="generateGradId" size="x-small" color="purple-darken-2">
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
          size="small"
          class="ml-4"
          color="purple-darken-2"
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
        size="x-small"
        color="purple-darken-2"
        class="mb-2"
        >Today</v-btn
      >
      <v-text-field
        v-model="grad.graduationDate"
        clearable
        label="Graduation Date"
        prepend-icon="mdi-calendar"
      ></v-text-field>

      <EngagementTracking
        @update="engagements = $event"
        @loading-state="loadingEngagements = $event"
        :id="grad.id"
      />
    </template>
    <template #buttons>
      <v-btn
        @click="moveToStudents"
        :loading="movingGrad"
        color="purple-darken-2"
        size="large"
      >
        <v-icon class="mr-4" size="x-large">mdi-account-arrow-right</v-icon>
        Move Back to Students
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailFrame from "./Helper/DetailFrame.vue";
import EngagementTracking from "./Helper/EngagementTracking.vue";
import DetailHeader from "./Helper/DetailHeader.vue";

import { ref, computed, toRefs } from "vue";
import { moveRowToRange } from "../../SheetsAPI";
import { unmapStudents } from "../../DataMappers";
import type { GradEngagement } from "../../SheetTypes";
import {
  emailValidator,
  phoneValidator,
  sendEmail,
} from "../../EmailUtilities";

import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { useUpdateItem } from "../../TrackItemForUpdate";
import { useDialog } from "../../store/useDialog";
import { warn } from "../../Warn";
import { getPanel } from "../../Panels";

const { fetchItems, setPanel } = useSheetManager();
const { Graduates } = useDocumentCache();
const { selected: grad } = toRefs(Graduates)
useUpdateItem(grad);

const { open, close } = useDialog();

const movingGrad = ref(false);

const engagements = ref<GradEngagement[]>([]);
const loadingEngagements = ref(true);

const canDelete = computed(() => {
  return engagements.value.length === 0 && !loadingEngagements.value;
});

async function generateGradId() {
  const newId = "G" + Math.random().toString().substring(2, 9);
  grad.value.id = newId;
}

async function moveToStudents() {
  if (!canDelete.value) {
    open({
      body: {
        title: "Cannot Move",
        description:
          `${grad.value.name} has engagements. Please remove them before moving ${grad.value.name} back to students.`,
        buttons: [
          {
            text: "Ok",
            color: `${getPanel('GRADUATES').color}-darken-2`,
            onClick: close,
          },
        ],
      },
    });
    return;
  }
  movingGrad.value = true;
  try {
    await warn(
      null,
      null,
      "Are you sure you want to move this graduate back to students? Information like phone number and graduation date will be permanently lost."
    );
  } catch (e) {
    movingGrad.value = false;
    return;
  }

  const _grad = JSON.parse(JSON.stringify(grad.value));

  await moveRowToRange(
    'Graduates',
    'Students',
    grad.value.row,
    await unmapStudents([
      {
        row: _grad.row,
        sysId: _grad.sysId,
        id: _grad.id.startsWith("G") ? "" : _grad.id,
        name: _grad.name,
        email: _grad.email,
        points: 0,
        activeStatus: "Active",
        year: null,
        athletics: "",
        note: _grad.note,
        misc: {},
      },
    ])
  );

  fetchItems();

  open({
    body: {
      title: "Success!",
      description: `${_grad.name} has been moved to students.`,
      buttons: [
        {
          text: "Ok",
          color: `${getPanel('GRADUATES').color}-darken-2`,
          onClick: close,
        },
        {
          text: `View ${_grad.name}s Student Profile`,
          color: `${getPanel('STUDENTS').color}-darken-2`,
          onClick: () => {
            setPanel(getPanel('STUDENTS'), {
              sysId: _grad.sysId,
            });
            close();
          },
        }
      ],
    },
  });
}
</script>