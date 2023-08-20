<template>
  <div>
    <DetailFrame :item="student">

      <template #main>

        <DetailHeader
          :item="student"
          :placeholder="`${getActivePanel.title.singular} Name`"
        >
          <IDInput
            :item="student"
            :rules="[(v) => studentIdRule(v, student.sysId) || 'Invalid ID']"
          />
        </DetailHeader>

        <DetailInput
          :item="student"
          prop="email"
          :rules="[(v) => emailValidator(v) || 'Invalid email']"
          label="Email"
          icon="email"
          :button="{
            condition: !student.email,
            text: `New ${getActivePanel.title.singular} Email`,
            newPropValue: () => getStudentEmail(student.name),
          }"
        />

        <InputCoupler #default="{ brokenUp }">

          <DetailInput
            :width="brokenUp ? '' : '40%'"
            :item="student"
            prop="activeStatus"
            :input="{
              type: 'select',
              items: statusOptionLabels,
            }"
            :icon="statusOptionIcon"
            label="Active Status"
          />

          <DetailInput
            :width="brokenUp ? '' : '60%'"
            :item="student"
            prop="year"
            :input="{
              type: 'select',
              items: yearOptions,
            }"
            icon="briefcase"
            label="Year"
          />

        </InputCoupler>

        <InputCoupler #default="{ brokenUp }">

          <DetailInput
            :width="brokenUp ? '' : '60%'"
            :item="student"
            prop="athletics"
            :input="{
              type: 'autocomplete',
              items: Object.keys(athleticOptions),
            }"
            :icon="athleticOptions[student.athletics]"
            label="Athletics"
          />

          <DetailInput
            :width="brokenUp ? '' : '40%'"
            :item="student"
            prop="points"
            :input="{
              type: 'text',
              variant: 'number'
            }"
            label="Points"
            icon="ticket"
          />

        </InputCoupler>

      </template>

      <template #notes-button>

        <ButtonInput @click="showAddNote = true">
          Add Meeting Note
        </ButtonInput>

      </template>

      <template #buttons>

        <div
          class="d-flex flex-row justify-space-between"
          style="width: 100%"
        >
          <v-btn
            @click="viewThesis"
            :color="thesisButton.color"
            :loading="creatingThesis"
            :disabled="readOnlyMode && !thesis"
            size="large"
            style="width: 49%"
          >
            <v-icon
              class="mr-2"
              size="x-large"
            >
              {{ thesisButton.icon }}
            </v-icon>
            {{ thesisButton.text }}
          </v-btn>
          <v-btn
            @click="moveItem(student)"
            :loading="movingItem"
            :disabled="readOnlyMode"
            :color="panelOnceMoved?.color"
            size="large"
            style="width: 49%"
          >
            <v-icon
              class="mr-2"
              size="x-large"
            >
              {{ panelOnceMoved?.icon }}
            </v-icon>
            Graduate
          </v-btn>
        </div>
      </template>

    </DetailFrame>

    <AddStudentNote
      @success="addStudentNote($event)"
      @close="showAddNote = false"
      :show="showAddNote"
    />

  </div>
</template>


<script setup lang="ts">
import InputCoupler from "./Helper/InputCoupler.vue";
import IDInput from "./Helper/IDInput.vue";
import ButtonInput from "./Helper/ButtonInput.vue";
import DetailFrame from "./Helper/DetailFrame.vue";
import DetailHeader from "./Helper/DetailHeader.vue";
import DetailInput from "./Helper/DetailInput.vue";
import AddStudentNote from "./Helper/AddStudentNote.vue";
import {
  emailValidator,
  getStudentEmail,
  sendEmail,
} from "../../EmailUtilities";
import { getPanel } from "../../Panels";
import {
  yearOptions,
  statusOptions,
  athleticOptions,
  studentIdRule,
} from "../../StudentTools";
import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { useUpdateItem } from "../../TrackItemForUpdate";
import { ref, computed } from 'vue'
import type { Student } from '../../SheetTypes'
import { useMoveItem } from '../../MoveItems'
import { storeToRefs } from "pinia";

const { setPanel, getActivePanel } = useSheetManager();
const { readOnlyMode } = storeToRefs(useSheetManager());
const { Theses, addItem } = useDocumentCache();

const props = defineProps<{
  item: Student;
}>();

const student = computed(() => props.item);

const { broadcastThroughSocket } = useUpdateItem(student);
const { moveItem, movingItem, panelOnceMoved } = useMoveItem();

const statusOptionIcon = computed(() => {
  const optionIcon = statusOptions.find((option) => option.status === student.value.activeStatus)?.icon
  const fallbackIcon = 'help'
  return optionIcon ?? fallbackIcon
});

const statusOptionLabels = computed(() => statusOptions.map((option) => option.status));

const showAddNote = ref(false);

const thesisPanel = getPanel("THESES");
const creatingThesis = ref(false);

const thesis = computed(() => Theses.list.find((thesis) => thesis.studentSysId === student.value.sysId));

const thesisButton = computed(() => {
  if (!thesis.value) {
    return {
      text: `Create ${thesisPanel.title.singular}`,
      icon: "mdi-plus",
      color: thesisPanel.color,
    } as const;
  }

  return {
    text: `View ${thesisPanel.title.singular}`,
    icon: thesisPanel.icon,
    color: thesisPanel.color,
  } as const;
});

const viewThesis = async () => {
  if (!thesis.value) {
    creatingThesis.value = true;
    await addItem({
      panelName: thesisPanel.panelName,
      postToSheet: true,
      columns: [
        student.value.sysId,
      ]
    });
  }
  setPanel(thesisPanel.panelName, {
    key: 'studentSysId',
    value: student.value.sysId,
  });
}

const addStudentNote = (event: { initials: string; note: string, date: string }) => {
  const { initials, note, date } = event;
  if (student.value.note) student.value.note += "\n\n";
  student.value.note += `${initials} (${date}): ${note}`;
  broadcastThroughSocket('note')
}
</script>