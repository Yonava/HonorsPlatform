<template>
  <div>
    <DetailFrame :item="student">

      <template #main>

        <DetailHeader
          :item="student"
          :placeholder="`${getActivePanel.title.singular} Name`"
        >
          <IDInput :item="student" />
        </DetailHeader>

        <DetailInput
          :item="student"
          prop="email"
          :rules="emailInputValidator()"
          label="Email"
          icon="email"
          :button="{
            condition: !!student.name && !student.email,
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
            :button="{
              condition: !student.activeStatus,
              text: 'Mark As ' + statusOptionLabels[0],
              newPropValue: () => statusOptionLabels[0],
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
            :button="{
              condition: !student.year,
              text: 'Mark As ' + yearOptions[0],
              newPropValue: () => yearOptions[0],
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
              type: smAndDown ? 'select' : 'autocomplete',
              items: Object.keys(athleticOptions) as (keyof typeof athleticOptions)[],
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

        <ButtonInput @click="addNote">
          Add Meeting Note
        </ButtonInput>

      </template>

      <template #buttons>

        <InputCoupler
          :minWidth="400"
          #default="{ brokenUp }"
          gap="12px"
        >

          <v-btn
            @click="viewThesis"
            :color="thesisButton.color"
            :loading="creatingThesis"
            :disabled="readOnlyMode && !thesis"
            :style="{
              width: brokenUp ? '' : 'calc(50% - 6px)',
              marginBottom: brokenUp ? '12px' : '',
            }"
            size="large"
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
            :style="{
              width: brokenUp ? '' : 'calc(50% - 6px)',
              marginBottom: brokenUp ? '' : '',
            }"
            size="large"
          >
            <v-icon
              class="mr-2"
              size="x-large"
            >
              {{ panelOnceMoved?.icon }}
            </v-icon>
            Graduate
          </v-btn>

        </InputCoupler>
      </template>

    </DetailFrame>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { useSheetManager } from "@store/useSheetManager";
import { useDocumentCache } from "@store/useDocumentCache";
import { useDialog } from "@store/useDialog";
import { emailInputValidator, getStudentEmail } from "@utils/emails";
import { getPanel } from "@panels";
import InputCoupler from "./Helper/InputCoupler.vue";
import IDInput from "./Helper/IDInput.vue";
import ButtonInput from "./Helper/ButtonInput.vue";
import DetailFrame from "./Helper/DetailFrame.vue";
import DetailHeader from "./Helper/DetailHeader.vue";
import DetailInput from "./Helper/DetailInput.vue";
import AddStudentNote from "./Helper/AddStudentNote.vue";
import {
  yearOptions,
  statusOptions,
  athleticOptions,
} from "../../StudentTools";
import type { Student } from '../../SheetTypes'
import { useMoveItem } from '../../MoveItems'

const { smAndDown } = useDisplay();

const { setPanel, getActivePanel } = useSheetManager();
const { readOnlyMode } = storeToRefs(useSheetManager());
const { Theses, addItem } = useDocumentCache();

const props = defineProps<{
  item: Student;
}>();

const student = computed(() => props.item);

const { moveItem, movingItem, panelOnceMoved } = useMoveItem();

const statusOptionIcon = computed(() => {
  const optionIcon = statusOptions.find((option) => option.status === student.value.activeStatus)?.icon
  const fallbackIcon = 'help'
  return optionIcon ?? fallbackIcon
});

const statusOptionLabels = computed(() => statusOptions.map((option) => option.status));

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

const addNote = () => useDialog().open({
  component: AddStudentNote,
  props: {
    student: student.value,
  }
})
</script>