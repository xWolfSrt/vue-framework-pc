<template>
    <div class="container">联系人</div>

    <Tabbar :code="'contact'" @refresh="tabbarRefresh"></Tabbar>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onDeactivated, onActivated } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
const { proxy } = getCurrentInstance()

const tabbarRefresh = () => {
    // workService.refreshPage(router.currentRoute.value.path)
}
onActivated(() => {
    console.log('Contact---onActivated')
})
onDeactivated(() => {
    console.log('Contact---onDeactivated')
})
</script>
<style lang="scss" scoped></style>
