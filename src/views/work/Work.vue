<template>
    <div class="container">
        <Tabbar :code="'work'"></Tabbar>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
const { proxy } = getCurrentInstance()
</script>
<style lang="scss" scoped></style>
