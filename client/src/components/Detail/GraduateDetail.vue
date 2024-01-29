<template>
  <DetailFrame :item="grad">
    <template #main>
      <DetailHeader
        :item="grad"
        placeholder="Name"
      >
        <IDInput :item="grad" />
      </DetailHeader>

      <DetailInput
        :item="grad"
        prop="email"
        :rules="emailInputValidator()"
        label="Email"
        icon="email"
      />

      <DetailInput
        :item="grad"
        prop="phone"
        :rules="phoneInputValidator()"
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
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useSheetManager } from "@store/useSheetManager";
import { emailInputValidator, phoneInputValidator } from "@utils/emails";
import type { Graduate } from "@apptypes/sheetItems";
import IDInput from "./Helper/IDInput.vue";
import DetailFrame from "./Helper/DetailFrame.vue";
import DetailHeader from "./Helper/DetailHeader.vue";
import DetailInput from "./Helper/DetailInput.vue";
import { useMoveItem } from "@composables/useMoveItem";

const sheetManager = useSheetManager();
const { readOnlyMode } = storeToRefs(sheetManager);

const props = defineProps<{
  item: Graduate;
}>();

const grad = computed(() => props.item);

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>