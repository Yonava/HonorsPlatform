<template>
  <NavDrawerBlockBtn icon="mdi-plus">
    Add {{ getActivePanel.title.singular }}
  </NavDrawerBlockBtn>
</template>

<script setup lang="ts">
import { useSheetManager } from '../../store/useSheetManager';
import { storeToRefs } from 'pinia';
import NavDrawerBlockBtn from './NavDrawerBlockBtn.vue';

const { getActivePanel } = storeToRefs(useSheetManager());
</script>