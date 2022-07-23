<template>
    <div class="container">日程表</div>

    <Tabbar :code="'schedule'" @refresh="tabbarRefresh"></Tabbar>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onDeactivated, onActivated } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
const { proxy } = getCurrentInstance()

const tabbarRefresh = () => {
    // workService.refreshPage(router.currentRoute.value.path)
}
onActivated(() => {
    console.log('Schedule---onActivated')
})
onDeactivated(() => {
    console.log('Schedule---onDeactivated')
})
</script>
<style lang="scss" scoped></style>
