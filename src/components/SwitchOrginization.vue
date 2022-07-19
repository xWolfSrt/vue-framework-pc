<template>
    <div class="switch-popup-container" @click="switchClick">
        <img :src="data.selectedOrganization.photo" v-if="data.selectedOrganization && data.selectedOrganization.photo" />
        <span>{{ (data.selectedOrganization && data.selectedOrganization.name) || '' }}</span>
        <div v-if="data.list.length > 1"></div>
    </div>
    <div class="switch-popup-mask" v-if="isShow" @click="hideSwitchPopup"></div>
    <div class="switch-popup" v-if="isShow">
        <div class="switch-content" v-if="isShow">
            <div class="switch-list">
                <div
                    class="switch-item"
                    v-for="(item, index) in data.list"
                    :key="index"
                    @click="switchItemClick(item)"
                    :class="{ selected: data.selectedOrganization && data.selectedOrganization.name == item.name }"
                    :title="item.name"
                >
                    <img :src="item.photo || getAssetsFile('common/profile_photo.png')" />
                    <span>{{ item.name }}</span>
                    <!-- <img [src]="spa('work/home/icon_right.png')" *ngIf="data.selectedOrganization && data.selectedOrganization.name == item.name" /> -->
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import getAssetsFile from '../utils/pub-use'
const { proxy } = getCurrentInstance()
const data = reactive({
    list: [],
    selectedOrganization: undefined,
})
const isShow = ref(false)
onMounted(() => {
    data.selectedOrganization = proxy.$storage.get('selectedOrganization')
    data.list = proxy.$storage.get('organizationList')
})
const switchClick = () => {
    if (data.list.length <= 1) return
    isShow.value = !isShow.value
}

const switchItemClick = (item) => {
    if (item.id != data.selectedOrganization.id) {
        proxy.$router.replace({
            path: '/navigate',
            query: {
                organization: item.id,
            },
        })
    }
    hideSwitchPopup()
}
const hideSwitchPopup = () => {
    isShow.value = false
}
</script>
<style lang="scss" scoped>
.switch-popup-container {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 50%;
    -webkit-transform: translate(-50%, 0);
    transform: translate(-50%, 0);

    display: flex;
    align-items: center;
    height: 2.875rem;
    cursor: pointer;

    img {
        width: 1.75rem;
        height: 1.75rem;
        object-fit: cover;
        background: white;
        border-radius: 4px;
        margin-right: 0.5rem;
    }
    span {
        font-size: 0.875rem;
        color: #272f53;
        margin-right: 0.375rem;
    }
    div {
        flex-shrink: 0;
        position: relative;
        width: 9px;
        height: 5px;

        &:after {
            border: 5px solid transparent;
            border-top: 5px solid #caccd8;
            width: 0;
            height: 0;
            position: absolute;
            right: 0px;
            content: ' ';
        }
    }
}
.switch-popup-mask {
    position: fixed;
    z-index: 9997;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0);

    // animation: show-content 0.2s ease-in;
    // -webkit-animation-fill-mode: forwards;
    // animation-fill-mode: forwards;
}

.switch-popup {
    position: absolute;
    top: 3rem;
    left: 0;
    right: 0;
    bottom: 0;

    z-index: 9998;
    display: flex;
    flex-direction: column;
    align-items: center;

    // &::-webkit-scrollbar {
    //     display: none;
    // }

    .switch-content {
        flex-shrink: 0;
        width: 12.6875rem;
        display: flex;
        flex-direction: column;
        background: white;
        border-radius: 4px;
        box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.12);
        padding: 0.5rem 0.375rem;
        box-sizing: border-box;

        // animation: show-content 1s ease-in;
        // -webkit-animation-fill-mode: forwards;
        // animation-fill-mode: forwards;

        .switch-list {
            width: 100%;
            max-height: 15.25rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            &::-webkit-scrollbar {
                width: 8px;
                // height: 200px;
            }

            /*滚动条滑块*/
            &::-webkit-scrollbar-thumb {
                /*滚动条里面小方块*/
                // border-radius: 10px;
                box-shadow: inset 0 0 5px #d8d8d8;
                background: #a8a8a8;
            }

            /*滚动条轨道*/
            &::-webkit-scrollbar-track {
                /*滚动条里面轨道*/
                box-shadow: inset 0 0 5px #d8d8d8;
                // border-radius: 10px;
                background: #f1f1f1;
            }
        }
        .switch-item {
            flex-shrink: 0;
            display: flex;
            height: 2.75rem;
            align-items: center;
            width: 100%;
            border: 1px solid transparent;
            border-radius: 4px;
            box-sizing: border-box;
            padding: 0 0.8125rem;
            margin: 0.25rem 0;
            cursor: pointer;

            &.selected {
                border: 1px solid #5874e8;
                border-radius: 4px;
            }

            img {
                flex-shrink: 0;
                margin-right: 0.9375rem;
                width: 1.625rem;
                height: 1.625rem;
                border-radius: 4px;
                object-fit: cover;
            }
            span {
                flex: 1;
                font-size: 0.75rem;
                color: #272f53;

                text-overflow: ellipsis;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
            }
        }
    }
}
@keyframes show-content {
    0% {
        transform: translateZ(0) translateY(0) scale(0.6);
        opacity: 0.5;
    }
    90% {
        transform: translateZ(0) translateY(0) scale(1.1);
        opacity: 0.8;
    }
    100% {
        transform: translateZ(0) translateY(0) scale(1);
        opacity: 1;
    }
}
</style>
