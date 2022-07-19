<template>
    <div class="container">日程表</div>

    <Tabbar :code="'schedule'" @refresh="tabbarRefresh"></Tabbar>
</template>
<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
const { proxy } = getCurrentInstance()
</script>
<style lang="scss" scoped></style>
