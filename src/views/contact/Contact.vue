<template>
    <div class="container">联系人</div>

    <Tabbar :code="'contact'" @refresh="tabbarRefresh"></Tabbar>
</template>
<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
const { proxy } = getCurrentInstance()
</script>
<style lang="scss" scoped></style>
