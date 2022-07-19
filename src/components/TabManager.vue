<template>
    <div class="tab-container">
        <div class="tab-content" :style="{ width: data.tabs.length * ((153 + 1) / 16) + 'rem' }">
            <div
                :id="'tab-' + i"
                v-for="(tab, i) in data.tabs"
                :key="i"
                class="tab-item"
                :class="{ selected: tab.selected }"
                @click.stop="tabClick(i)"
            >
                <div class="tab-item-container">
                    <img class="tab-icon" :src="tab.icon" v-if="tab.icon" />
                    <span class="tab-title" :class="{ selected: tab.selected }">{{ tab.name }}</span>
                    <img
                        class="tab-close"
                        :src="getAssetsFile('work/home/icon_close_tab.png')"
                        v-if="!tab.fixed"
                        :class="{ selected: tab.selected }"
                        @click.stop="closeTabClick(i)"
                    />
                    <div v-if="!tab.selected"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import getAssetsFile from '../utils/pub-use'
defineProps(['tabs'])
const { proxy } = getCurrentInstance()
const data = reactive({
    tabs: [],
})
const emits = defineEmits(['tabClick', 'closeTab'])
onMounted(() => {
    data.tabs = proxy.$props.tabs
})
const tabClick = (index) => {
    let tab = data.tabs[index]
    proxy.$router.push(`${tab.page}`)
    emits('tabClick', JSON.parse(JSON.stringify(tab)))
}

const closeTabClick = (index) => {
    emits('closeTab', index)
}
</script>
<style lang="scss" scoped>
@import '../common/styles/variable/index.scss';

.tab-container {
    flex-shrink: 0;
    position: relative;
    z-index: 5;
    width: 100%;
    height: $workTabManagerHeight;
    background: #f4f4f4;
    // -webkit-box-shadow: 0 0 15px rgba(61, 61, 61, 0.4);
    // box-shadow: 0 0 15px rgba(61, 61, 61, 0.2);
    // display: flex;
    // flex-direction: row;

    // display: inline-block;
    // white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    // overflow: hidden;
    &::-webkit-scrollbar {
        // display: none;
        /*滚动条整体样式*/
        // width: 1px; /*高宽分别对应横竖滚动条的尺寸*/
        height: 8px;
    }

    /*定义滚动条轨道 内阴影+圆角*/
    // &::-webkit-scrollbar-track {
    //     -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    //     border-radius: 10px;
    //     background: rgba(0, 0, 0, 0.1);
    // }
    &::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/

        box-shadow: inset 0 0 5px #d8d8d8;
        background: #a8a8a8;
        // border-radius: 10px;
        // background-color: skyblue;
        // background-image: -webkit-linear-gradient(
        //     45deg,
        //     rgba(255, 255, 255, 0.2) 25%,
        //     transparent 25%,
        //     transparent 50%,
        //     rgba(255, 255, 255, 0.2) 50%,
        //     rgba(255, 255, 255, 0.2) 75%,
        //     transparent 75%,
        //     transparent
        // );
    }
    &::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        box-shadow: inset 0 0 5px #d8d8d8;
        // border-radius: 10px;
        background: #f1f1f1;
        // box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        // background: #ededed;
        // border-radius: 10px;
    }

    .tab-content {
        display: inline-block;
        box-sizing: border-box;
        // width: calc(100% + 1px);
    }

    .tab-item {
        flex-shrink: 0;
        position: relative;
        height: 2.5rem;
        width: 9.5625rem;
        display: inline-block;

        align-items: center;
        border-radius: 0;
        box-shadow: none;
        cursor: pointer;

        &.selected {
            background: white;
            box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.08);
            border-radius: 4px 4px 0px 0px;
        }

        .tab-item-container {
            display: flex;
            align-items: center;
            width: 100%;
            height: 2.5rem;
            padding: 0 0 0 0.75rem;
            box-sizing: border-box;

            &:hover .tab-close {
                visibility: visible;
            }
            .tab-icon {
                flex-shrink: 0;
                width: 1.125rem;
                height: auto;
                margin-right: 0.625rem;
            }
            .tab-title {
                flex: 1;
                font-size: 0.75rem;
                word-break: break-all;
                color: #393939;
                margin-right: 0.36rem;

                text-overflow: ellipsis;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                // &.selected {
                //     color: #393939;
                //     font-weight: bold;
                //     font-size: 0.875rem;
                // }
            }

            .tab-close {
                flex-shrink: 0;
                width: 1.2rem;
                height: 1.2rem;
                margin-right: 0.45rem;
                visibility: hidden;
                cursor: pointer;

                &.selected {
                    visibility: visible;
                }
            }

            > div {
                flex-shrink: 0;
                height: 0.6875rem;
                width: 1px;
                background: #d8d8d8;
            }
        }
    }
}
</style>
