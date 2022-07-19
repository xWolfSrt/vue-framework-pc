<template>
    <div class="container">通知公告</div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, onActivated } from 'vue'
const { proxy } = getCurrentInstance()
onMounted(() => {
    console.log('WorkNotification---onMounted')
})
onActivated(() => {
    console.log('WorkNotification---onActivated')
})
</script>
<style lang="scss" scoped></style>
