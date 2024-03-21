<template>
  <div style="height: 100%; position: relative">
    <div>
      <div class="d-flex flex-row">
        <slot name="left"></slot>
        <v-spacer></v-spacer>
        <slot name="right"></slot>
      </div>
      <slot name="corners"></slot>
    </div>
  </div>
</template>