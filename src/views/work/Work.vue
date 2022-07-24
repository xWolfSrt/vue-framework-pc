<template>
    <div class="work-container">
        <!-- <div style="width: 6.25rem; height: 100%; flex-shrink: 0"></div> -->
        <div class="work-content">
            <div class="top">
                <div class="header">
                    <div class="header-refresh" @click="refreshClick">
                        <img :src="getAssetsFile('work/common/icon_refresh.png')" />
                    </div>
                    <SwitchOrginization></SwitchOrginization>
                    <div class="header-search">
                        <img :src="getAssetsFile('work/common/icon_search.png')" @click="search" />
                        <input
                            id="content"
                            type="text"
                            maxlength="100"
                            placeholder="请输入搜索内容"
                            placeholder-style="color:#C3C3C3"
                            v-model="input.content"
                            @keyup.enter="search"
                            :disabled="!inputEnable"
                            ref="content"
                        />
                    </div>
                </div>
                <TabManager :tabs="workService.tabs" @close-tab="closeTabClick"></TabManager>
            </div>
            <div class="router-content">
                <router-view v-slot="{ Component, route }">
                    <!-- <component :is="Component" :key="route.fullPath" /> -->
                    <keep-alive :include="workService.keepAlive">
                        <component :is="Component" :key="route.fullPath" />
                    </keep-alive>
                </router-view>
                <!-- <router-view></router-view> -->
            </div>
        </div>
    </div>

    <Tabbar :code="'work'" @refresh="tabbarRefresh"></Tabbar>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, onDeactivated, onActivated } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
import SwitchOrginization from '../../components/SwitchOrginization.vue'
import TabManager from '../../components/TabManager.vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { workStore } from '../../store/work-store'
import getAssetsFile from '../../utils/pub-use'
import { ElMessage } from 'element-plus'

// const keepAlive = reactive(['WorkHome'])

const { proxy } = getCurrentInstance()
const router = useRouter()
const workService = workStore()
const confirmSearch = ref('')
const inputEnable = ref(true)
const input = reactive({
    content: '',
})
const data = reactive({
    tabs: [],
})
onMounted(() => {
    console.log(router)
})
const tabbarRefresh = () => {
    workService.refreshPage(router.currentRoute.value.path)
}
const refreshClick = () => {
    workService.refreshPage(router.currentRoute.value.path)
}
const search = () => {
    console.log('search')
    if (!input.content && input.content != '0') {
        ElMessage.warning('请输入搜索内容')
        return
    }
    confirmSearch.value = input.content
    proxy.$storage.set('workConfirmSearchContent', confirmSearch.value)
    if (router.currentRoute.value.path == '/work/search') {
        workService.searchContent(confirmSearch.value, router.currentRoute.value.path)
    } else {
        router.push('/work/search')
    }
}
onBeforeRouteLeave((to, from) => {
    // const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
    // // 取消导航并停留在同一页面上
    // if (!answer) return false
})
onActivated(() => {
    console.log('Work---onActivated')
})
onDeactivated(() => {
    console.log('WorkHome---onDeactivated')
})
const closeTabClick = (index) => {
    workService.closeTab(index, router)
}
</script>
<style lang="scss" scoped>
@import '../../common/styles/variable/index.scss';

.work-container {
    width: 100%;
    height: 100%;
    display: flex;
    background: #f4f4f4;
    padding-left: $workLeftBarWeight;
    box-sizing: border-box;

    .work-content {
        height: 100%;
        width: 100%;
        background: #f4f4f4;
        position: relative;
        display: flex;
        flex-direction: column;

        .top {
            flex-shrink: 0;
            // width: 100%;
            height: $workTopHeight; //46 + 40px
            position: fixed;
            top: 0;
            left: 6.25rem;
            right: 0;
            z-index: 99;
            display: flex;
            flex-direction: column;
            background: #f4f4f4;

            .header {
                flex-shrink: 0;
                width: 100%;
                height: 2.875rem;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                position: relative;
                // background: #adadad;

                .header-refresh {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2.125rem;
                    height: 2.125rem;
                    margin-left: 0.5rem;
                    cursor: pointer;

                    img {
                        width: 0.875rem;
                        height: 0.875rem;
                    }
                }

                .header-search {
                    position: absolute;
                    right: 1.375rem;
                    top: 50%;
                    -webkit-transform: translate(0, -50%);
                    transform: translate(0, -50%);

                    padding: 0 0.8125rem 0 0.5rem;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    width: 15.25rem;
                    height: 1.75rem;
                    background: #ffffff;
                    border: 1px solid #dedede;
                    border-radius: 4px;

                    img {
                        flex-shrink: 0;
                        width: 1.25rem;
                        height: auto;
                        margin-right: 0.25rem;
                    }

                    input {
                        flex: 1;
                        height: 100%;
                        font-size: 0.75rem;
                        color: #262626;

                        outline: none;
                        background: transparent;
                        border: none;
                        outline: medium;
                        border-radius: 0.25rem;

                        &::-webkit-input-placeholder {
                            color: #d6d6d6;
                        }
                        &::-moz-placeholder {
                            color: #d6d6d6;
                        }
                        &:-ms-input-placeholder {
                            color: #d6d6d6;
                        }
                        &:-moz-placeholder {
                            color: #d6d6d6;
                        }
                    }
                }
            }
        }
        .router-content {
            width: 100%;
            height: 100%;
            background: #adadad;
        }
    }
}
</style>
