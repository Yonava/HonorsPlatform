<template>
  <span v-if="!xs">
    <v-icon :size="size">
      mdi-information-outline
    </v-icon>
    <v-tooltip
      :location="location"
      activator="parent"
    >
      <slot><!-- optional fallback --></slot>
    </v-tooltip>
  </span>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useDialog } from '../../store/useDialog';

// TODO: implement useDialog solution for xs

const { xs } = useDisplay()

const props = defineProps<{
  location?: 'top' | 'bottom' | 'left' | 'right',
  size?: 'small' | 'medium' | 'large'
}>()

const location = props.location ?? 'right'
const size = props.size ?? 'x-small'
</script>