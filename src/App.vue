<script setup lang="ts">
import {TresCanvas, useRenderLoop} from '@tresjs/core'
import Map from "@/components/Map.vue";
import Character from "@/components/Character.vue";


</script>

<template>
  <TresCanvas
      clear-color="#82DBC5"
      window-size
  >
    <!--光源-->
    <TresAmbientLight :intensity="5" />

    <!--地图-->
    <Suspense>
      <Map />
    </Suspense>
    <!--人物-->
    <Suspense>
      <Character />
    </Suspense>
  </TresCanvas>
</template>

<style scoped>

</style>
