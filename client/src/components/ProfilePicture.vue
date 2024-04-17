<template>
  <img
    @error="errorLoadingImage = true"
    :src="profilePicture"
    :style="{
      width: '100%',
      height: '100%',
      borderRadius: '50%'
    }"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  src: string
}>()

const errorLoadingImage = ref(false)

// TODO replace with a local image
const BACKUP_IMAGE = 'https://images.emojiterra.com/mozilla/1024px/2753.png'

const profilePicture = computed(() => {
  return errorLoadingImage.value ? BACKUP_IMAGE : props.src
})
</script>