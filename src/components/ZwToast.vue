<template>
    <div
        :style="{
            'z-index': toastIndex ? toastIndex : '9999999',
            position: toastAbsolute ? 'absolute' : 'fixed',
            bottom: toastBottom || '64px',
        }"
        v-if="toastModel.show"
        class="zw-toast"
    >
        <div>{{ toastModel.content }}</div>
    </div>

    <div class="zw-loading-mask" v-if="loadingModel.show && loadingModel.mask" @click.stop></div>
    <div v-if="loadingModel.show" class="zw-loading" @click.stop>
        <div class="zw-loading-content">
            <img :src="getAssetsFile('icon_loading_circle.gif')" />
            <span v-if="loadingModel.content">{{ loadingModel.content }}</span>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import getAssetsFile from '../utils/pub-use.js'
const { proxy } = getCurrentInstance()

defineProps(['toastIndex', 'toastBottom', 'toastAbsolute'])

const toastIndex = ref(0)
const toastBottom = ref('')
const toastAbsolute = ref(false)
onMounted(() => {
    toastIndex.value = proxy.$props.toastIndex
    toastBottom.value = proxy.$props.toastBottom || ''
    toastAbsolute.value = proxy.$props.toastAbsolute || false
})

const toastModel = reactive({
    show: false,
    content: '',
    duration: 1500,
})
let timeout

const toast = (content, duration) => {
    if (timeout) {
        clearTimeout(timeout)
    }
    toastModel.show = true
    toastModel.content = content
    if (duration) toastModel.duration = duration

    timeout = setTimeout(() => {
        toastModel.show = false
    }, toastModel.duration)
}
// ---------Toast相关---END----------

// ---------Loading相关---START----------
const loadingModel = reactive({
    show: false,
    content: '加载中',
    mask: false,
})

const loading = (content, mask) => {
    loadingModel.show = true
    loadingModel.content = content
    loadingModel.mask = mask != undefined ? mask : false
}
const clear = () => {
    toastModel.show = false
    loadingModel.show = false
    if (timeout) {
        clearTimeout(timeout)
    }
}
// ---------Loading相关---END----------
defineExpose({
    toast,
    loading,
    clear,
})
</script>
<style lang="scss" scoped>
// ---------Toast相关---START----------
.zw-toast {
    position: fixed;
    z-index: 9999999;
    bottom: 64px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    animation: show-toast 0.3s;
    -webkit-animation: show-toast 0.3s;

    div {
        background: rgba(0, 0, 0, 0.7);
        border-radius: 6px;
        max-width: 80%;
        box-sizing: border-box;
        font-size: 14px;
        color: white;
        line-height: 20px;
        padding: 10px 20px;

        // text-overflow: ellipsis;
        // overflow: hidden;
        // display: -webkit-box;
        // -webkit-line-clamp: 3;
        // /*!autoprefixer:off*/
        // -webkit-box-orient: vertical;
        // /*autoprefixer:on*/
        word-break: break-all;
        word-wrap: break-word;
        white-space: pre-line;
        /* 防止出现不换行显示 */
    }
}
@keyframes show-toast {
    from {
        opacity: 0;
        transform: translate(0, 10px);
        -webkit-transform: translate(0, 10px);
    }

    to {
        opacity: 1;
        transform: translate(0, 0);
        -webkit-transform: translate(0, 0);
    }
}

// ---------Toast相关---END----------

// ---------Loading相关---START----------
.zw-loading-mask {
    position: fixed;
    z-index: 9999998;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.zw-loading {
    position: fixed;
    z-index: 9999999;
    top: 45%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    max-width: 50%;

    .zw-loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.16);
        border-radius: 6px;
        box-sizing: border-box;
        padding: 15px 22px 12px;

        /* Safari 和 Chrome */
        animation: show-loading 0.2s ease;
        -moz-animation: show-loading 0.2s ease-in;
        -webkit-animation: show-loading 0.2s ease;

        img {
            width: 40px;
            height: 40px;
            margin-bottom: 12px;
        }
        span {
            font-size: 14px;
            color: #a4a4a4;
            line-height: 20px;
            width: 5em;
            text-align: center;

            word-break: break-all;
            word-wrap: break-word;
            white-space: pre-line;
            /* 防止出现不换行显示 */
        }
    }
}
@keyframes show-loading {
    0% {
        transform: translateZ(0) scale(0.5);
        opacity: 0.5;
    }

    100% {
        transform: translateZ(0) scale(1);
        opacity: 1;
    }
}

/* Firefox */
@-moz-keyframes show-loading {
    0% {
        -moz-transform: translateZ(0) scale(0.5);
        opacity: 0.5;
    }

    100% {
        -moz-transform: translateZ(0) scale(1);
        opacity: 1;
    }
}

/* Safari and Chrome */
@-webkit-keyframes show-loading {
    0% {
        -webkit-transform: translateZ(0) scale(0.5);
        opacity: 0.5;
    }

    100% {
        -webkit-transform: translateZ(0) scale(1);
        opacity: 1;
    }
}

// ---------Loading相关---END----------
</style>
