import {useGLTF} from "@tresjs/cientos";
import {defineStore} from "pinia";
import {Octree} from "three/examples/jsm/math/Octree.js";
import {Vector3} from "three";
import {Capsule} from "three/examples/jsm/math/Capsule.js";

import { store } from '../index'

import type {GLTFLoaderOptions, GLTFResult} from "@tresjs/cientos";
import type {Object3D, } from "three";

interface ModelList {
    [key: string]: GLTFResult
}

enum ModelName {
    character = 'character',
    map = 'map'
}

interface CharacterCapsule {
    R: number,
    H: number,
    capsule: Capsule
}

const useModelStore = defineStore('model', {
    state: () => {
        return {
            // 已加载模型列表
            modelList: {} as ModelList,
            // 总共模型数量
            modelCount: 2,
            // 八叉树
            octree: new Octree(),
            // 需要进行八叉树运算的节点数量
            octreeCount: 1,
            // 当前已经进行运算的节点数量
            currentOctreeCount: 0,
            // 胶囊数据
            characterCapsule: {
                R: 0.2,
                H: 2,
                capsule: new Capsule()
            } as CharacterCapsule
        }
    },
    getters: {
        // 获取已加载模型列表
        getModelList(state) {
            return state.modelList
        },
        // 获取已加载模型数量
        getCurrentModelCount(): number {
            return Object.keys(this.getModelList).length
        },
        // 模型是否加载完毕
        modelLoaded(state): boolean {
            return (state.modelCount === this.getCurrentModelCount)
                && (state.octreeCount === state.currentOctreeCount)
        },
        // 获取胶囊数据
        getCapsule(state) {
            return state.characterCapsule
        }
    },
    actions: {
        // 加载模型并返回
        async loaderModel(name: ModelName, path: string, options: GLTFLoaderOptions = {draco: true}){
            const baseUrl = window.location.origin;
            const url = new URL(path, baseUrl).href
            const model = await useGLTF(url, options)
            this.modelList[name] = model
            return model
        },
        // 获取对应模型
        getModel(name: ModelName){
            return this.modelList[name]
        },
        // 获取对应模型的 scene
        getModelScene(name: ModelName){
            return this.getModel(name).scene
        },
        // 设置人物胶囊
        setCapsule(capsule: Capsule){
            this.characterCapsule.capsule = capsule
        },
        // 分割模型，生成八叉树节点
        octreeAddObject3D(object: Object3D){
            this.octree.fromGraphNode(object)
            this.currentOctreeCount++
        }
    }
})

const useModelStoreWithOut = () => {
    return useModelStore(store)
}

export {
    ModelName,
    useModelStoreWithOut
}
