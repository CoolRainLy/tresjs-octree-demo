<script setup lang="ts">

import {ModelName, useModelStoreWithOut} from "@/stores/modules/model";

const modelStore = useModelStoreWithOut()

const position = [0, 0, 0]
// 加载模型
const {scene} = await modelStore.loaderModel(ModelName.map, '/src/assets/model/scene.glb')

// 获取节点并计算八叉树
const octreeMesh = scene.getObjectByName('octree')
if(octreeMesh){
  // 因为这些节点只用来处理碰撞，所以将这些节点隐藏
  octreeMesh.visible = false
  modelStore.octreeAddObject3D(octreeMesh)
}

</script>

<template>
  <primitive :object="scene" :position="position" />
</template>

<style scoped>

</style>
