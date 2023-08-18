<template>
  <DetailFrame
    v-model="grad.note"
    @user-input="broadcastThroughSocket('note')"
    :item="grad"
  >
    <template #main>
      <DetailHeader
        v-model="grad.name"
        @input="broadcastThroughSocket('name')"
        :id="grad.id"
        :item="grad"
        placeholder="Name"
      >
        <IDInput
          :item="grad"
          :rules="[(v) => studentIdRule(v, grad.sysId) || 'Invalid ID']"
        />
      </DetailHeader>

      <v-text-field
        v-model="grad.email"
        @input="broadcastThroughSocket('email')"
        :rules="[(v) => emailValidator(v) || 'Invalid email']"
        label="Email"
        prepend-icon="mdi-email"
      ></v-text-field>

      <v-text-field
        v-model="grad.phone"
        @input="broadcastThroughSocket('phone')"
        :rules="[(v) => phoneValidator(v) || 'Invalid phone number']"
        label="Phone"
        prepend-icon="mdi-phone"
      ></v-text-field>

      <v-btn
        v-if="!grad.graduationDate"
        @click="
          grad.graduationDate = new Date().toLocaleString('en-US').split(',')[0];
          broadcastThroughSocket('graduationDate');
        "
        :color="getActivePanel.color"
        size="x-small"
        class="mb-2"
      >
        Today
      </v-btn>

      <v-text-field
        v-model="grad.graduationDate"
        @input="broadcastThroughSocket('graduationDate')"
        label="Graduation Date"
        prepend-icon="mdi-calendar"
      ></v-text-field>

    </template>
    <template #buttons>
      <v-btn
        @click="moveItem(grad)"
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

import { computed } from "vue";
import {
  emailValidator,
  phoneValidator,
} from "../../EmailUtilities";
import { studentIdRule } from "../../StudentTools";
import { useUpdateItem } from "../../TrackItemForUpdate";
import type { Graduate } from "../../SheetTypes";
import { useSheetManager } from "../../store/useSheetManager";
import { useMoveItem } from "../../MoveItems";

const { getActivePanel } = useSheetManager();

const props = defineProps<{
  item: Graduate;
}>();

const grad = computed(() => props.item);

const { broadcastThroughSocket } = useUpdateItem(grad);
const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>