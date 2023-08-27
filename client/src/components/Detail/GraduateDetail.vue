<template>
  <DetailFrame :item="grad">
    <template #main>
      <DetailHeader
        :item="grad"
        placeholder="Name"
      >
        <IDInput
          :item="grad"
          :rules="[(v) => studentIdRule(v, grad.sysId) || 'Invalid ID']"
        />
      </DetailHeader>

      <DetailInput
        :item="grad"
        prop="email"
        :rules="[(v) => emailValidator(v) || 'Invalid email']"
        label="Email"
        icon="email"
      />

      <DetailInput
        :item="grad"
        prop="phone"
        :rules="[(v) => phoneValidator(v) || 'Invalid phone number']"
        label="Phone"
        icon="phone"
      />

      <DetailInput
        :item="grad"
        prop="graduationDate"
        label="Graduation Date"
        icon="calendar"
        :button="{
          condition: !grad.graduationDate,
          text: 'Graduated Today',
          newPropValue: () => new Date().toLocaleString('en-US').split(',')[0],
        }"
      />

    </template>
    <template #buttons>
      <v-btn
        @click="moveItem(grad)"
        :disabled="readOnlyMode"
        :loading="movingItem"
        :color="panelOnceMoved?.color"
        size="large"
      >
        <v-icon
          class="mr-4"
          size="x-large"
        >
          mdi-account-arrow-right
        </v-icon>
        Move Back to {{ panelOnceMoved?.title.plural }}
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import IDInput from "./Helper/IDInput.vue";
import DetailFrame from "./Helper/DetailFrame.vue";
import DetailHeader from "./Helper/DetailHeader.vue";
import DetailInput from "./Helper/DetailInput.vue";

import { computed } from "vue";
import {
  emailValidator,
  phoneValidator,
} from "../../EmailUtilities";
import { studentIdRule } from "../../StudentTools";
import type { Graduate } from "../../SheetTypes";
import { useSheetManager } from "../../store/useSheetManager";
import { useMoveItem } from "../../MoveItems";
import { storeToRefs } from "pinia";

const sheetManager = useSheetManager();
const { getActivePanel, readOnlyMode } = storeToRefs(sheetManager);

const props = defineProps<{
  item: Graduate;
}>();

const grad = computed(() => props.item);

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>