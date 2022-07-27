<template>
    <router-view v-slot="{ Component, route }">
        <!-- 根路由不能使用key，否则子路由会重复创建 -->
        <!-- <component :is="Component" :key="route.fullPath" /> -->
        <keep-alive :include="appService.keepAlive">
            <component :is="Component" />
        </keep-alive>
    </router-view>
    <!-- <router-view></router-view> -->
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import config from './config'
import { appStore } from './store/app-store'
const { proxy } = getCurrentInstance()
const appService = appStore()
// const keepAlive = reactive(['Work', 'Schedule', 'Contact'])

onMounted(() => {
    initHost()
    console.log(appService)
})

const initHost = () => {
    console.log('initHost', document.location, window.location)
    let domain = window.location.origin

    if (config.isTest) {
        domain = config.defaultDomain
    }
    proxy.$storage.set('host', domain)
}
</script>
<style lang="scss">
#app {
    width: 100%;
    height: 100vh;
}
.view-enter-active {
    animation: view-ani var(--el-transition-duration);
}

.view-leave-active {
    animation: view-ani reverse var(--el-transition-duration);
}

@keyframes view-ani {
    from {
        opacity: 0;
    }
}
</style>
