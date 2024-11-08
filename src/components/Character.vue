<script setup lang="ts">

import {ModelName, useModelStoreWithOut} from "@/stores/modules/model";
import {AnimationMixer, Group, Vector3} from "three";
import {Capsule} from "three/examples/jsm/math/Capsule.js";
import {useRenderLoop} from "@tresjs/core";

import type {AnimationAction} from 'three'
import {onMounted, ref} from "vue";

const modelStore = useModelStoreWithOut()

// 角色默认位置
const position = new Vector3(-1, 0, -3.5)
// 获取角色和动画
const {scene, animations} = await modelStore.loaderModel(ModelName.character, '/src/assets/model/Xbot.glb')
const character = scene
// 相机
const camera = ref()
/**
 * 初始化胶囊
 */
const initCharacterCapsule = () => {
  const {x, y, z} = position
  const {R, H} = modelStore.getCapsule
  // 根据人物所在位置初始化胶囊
  modelStore.setCapsule(new Capsule(
      new Vector3(x, y + R, z), // 底部半球球心坐标
      new Vector3(x, y + H - R, z), // 顶部半球球心坐标
      R // 半径
  ))
}

// 保存动作
const actions: {[key: string]: AnimationAction} = {}
// 当前动作
let currentAction: AnimationAction
const mixer = new AnimationMixer(character)
/**
 * 初始化动作
 */
const initAction = () => {
  for(const action of animations){
    // 获取动作
    const clipAction = mixer.clipAction(action)
    // 动作初始化为‘闲置’
    if(action.name === 'idle'){
      clipAction.weight = 1
      currentAction = clipAction
    }else {
      clipAction.weight = 0
    }
    clipAction.play()

    // 保存动作
    actions[action.name] = clipAction
  }
  // 更新动作
  mixer.update(0)
}

// 左键是否点击
let leftButtonBool = false
// 记录按键按下情况
const keyStates: {[key: string]: boolean} = {}
/**
 * 初始化监听事件
 */
const initEventListener = () => {
  // 鼠标点击
  addEventListener('mousedown', () => {
    leftButtonBool = true
  })
  // 鼠标松开
  addEventListener('mouseup', () => {
    leftButtonBool = false
  })
  // 鼠标移动
  addEventListener('mousemove', ({movementX, movementY}) => {
    if(!leftButtonBool) {
      return
    }

    character.rotation.y -= movementX / 180
    camera.value.rotation.x += movementY / 180;
  })
  // 按键按下
  addEventListener('keydown', ({code}) => {
    keyStates[code] = true
  })
  // 按键松开
  addEventListener('keyup', ({code}) => {
    keyStates[code] = false
    if(keyStates.KeyW || keyStates.KeyS){
      return;
    }

    changeAction('idle')
  })
}

/**
 * 改变动作
 * @param actionName 动作名
 */
const changeAction = (actionName: string) => {
  // 判断当前动作是否一样
  if(currentAction === actions[actionName]){
    return
  }

  const action = actions[actionName]
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(1)
  action.time = 0
  currentAction.crossFadeTo(action, 0.35, true)
  currentAction = action
}

const { onLoop, onBeforeLoop, resume, pause } = useRenderLoop()

// 这个部分不知道为什么 resume 无效，所以换种方法

// 先暂停
// onBeforeLoop(() => {
//   pause()
// })

// // 等到模型与八叉树加载完毕再运行
// const interval = setInterval(() => {
//   if(modelStore.modelLoaded){
//     resume()
//     clearInterval(interval)
//   }
// }, 100)

/**
 * 循环渲染
 */
onLoop(({delta, elapsed, clock}) => {
  // 判断是否加载完毕
  if(!modelStore.modelLoaded){
    return
  }

  let speed = 0

  // 前后移动，向前 + shift 奔跑
  if(keyStates.KeyW){
    speed = keyStates.ShiftLeft ? 2 :1
  }

  if(keyStates.KeyS){
    speed= 1
  }

  if(keyStates.KeyW && keyStates.KeyS){
    speed = 0
  }

  // 左右转向
  if(keyStates.KeyA){
    character.rotation.y += 0.05
  }

  if(keyStates.KeyD){
    character.rotation.y -= 0.05
  }

  if(speed === 0) {
    // 速度为 0 时休息
    changePosition('idle', character.position, 0)
  }else {
    // 获取角色面前的相对位置
    const front = new Vector3()
    character.getWorldDirection(front)
    // 根据速度切换行走和跑步状态
    changePosition(speed === 1 ? 'walk' : 'run', front, delta * speed)
  }
  mixer.update(delta)
})

/**
 * 改变位置
 */
const changePosition = (actionName: string, position: Vector3, magnification: number) => {
  // 获取下一帧的位置
  const deltaPos = character.position.clone().add(position.clone().multiplyScalar(magnification))
  // 切换动作
  changeAction(actionName)

  // 先对胶囊进行移动
  const {R, H, capsule} = modelStore.getCapsule
  capsule.set(
      new Vector3(deltaPos.x, deltaPos.y + R, deltaPos.z),
      new Vector3(deltaPos.x, deltaPos.y + H - R, deltaPos.z),
      R
  )
  // 进行八叉树的运算
  const octree = modelStore.octree
  const result = octree.capsuleIntersect(capsule)
  // 碰撞到了就平移回来
  if(result) {
    const {normal, depth} = result
    capsule.translate(normal.multiplyScalar(depth))
  }

  // 人物位置设定到胶囊的位置上
  const {x, y, z} = capsule.start
  character.position.copy(new Vector3(x, y - R, z))
}

onMounted(() => {
  initCharacterCapsule()
  initAction()
  initEventListener()
})

</script>

<template>
  <primitive
      :object="character"
      :position="position"
      :rotation="[0, -Math.PI / 2, 0]"
  >
    <TresPerspectiveCamera
        ref="camera"
        :position="[0, 2, -1.2]"
        :look-at="[0, 1.4, 1]"
    />
  </primitive>
</template>

<style scoped>

</style>
