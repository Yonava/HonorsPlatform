<template>
  <v-navigation-drawer
    :color="color"
    location="end"
    width="350"
    class="pa-4"
  >
    <div class="d-flex">
      <ActiveAccounts />
      <v-spacer></v-spacer>
      <Announcements />
    </div>

    <div
      class="my-4 d-flex flex-column"
      style="gap: 12px;"
    >
      <AddItemBtn />

      <NavDrawerBlockBtn
        @click="registrarAction"
        :disabled="readOnlyMode"
        icon="mdi-list-box-outline"
      >
        Create Registrar List
      </NavDrawerBlockBtn>

      <NavDrawerBlockBtn
        @click="emailAction"
        icon="mdi-email-outline"
      >
        Compose Mass Email
      </NavDrawerBlockBtn>

      <AdditionalTools>
        <template #activator="{ activeTools }">
          <NavDrawerBlockBtn
            v-if="activeTools.length"
            icon="mdi-hammer"
          >
            Additional Tools
          </NavDrawerBlockBtn>
        </template>
      </AdditionalTools>
    </div>

    <div style="overflow: auto; max-height: 50vh">
      <SortPanel class="mt-5" />
    </div>

    <span style="font-size: 10px; position: absolute; bottom: 10px;">
      {{ version }}
    </span>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDialog } from "../../store/useDialog";
import { useSheetManager } from "../../store/useSheetManager";
import { storeToRefs } from "pinia";
import AddItemBtn from "./AddItemBtn.vue";
import ActiveAccounts from "./ActiveAccounts.vue";
import Announcements from "./AnnouncementMenu.vue";

import AdditionalTools from "./AdditionalTools.vue";
import NavDrawerBlockBtn from "./NavDrawerBlockBtn.vue";
import SortPanel from "./SortPanel.vue";
import MailingListMenu from "./MailingListMenu.vue";
import BuildRegistrarList from "./BuildRegistrarList.vue";
import { version } from "../../Panels";

const { readOnlyMode } = storeToRefs(useSheetManager())

defineProps<{
  color: string,
}>()

const registrarAction = () => {
  useDialog().open({
    component: {
      render: BuildRegistrarList
    },
  })
}

const emailAction = () => {
  useDialog().open({
    component: {
      render: MailingListMenu
    },
  })
}
</script>