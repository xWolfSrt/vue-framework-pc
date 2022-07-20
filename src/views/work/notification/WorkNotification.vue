<template>
    <div class="container">
        <div class="header">
            <div class="tab">
                <div>
                    <div
                        id="tab-{{ i }}"
                        v-for="(tab, i) in data.tabs"
                        :key="i"
                        class="navbar-item"
                        @click="tabClick($event, i)"
                        :style="{ width: data.sliderWidth + 'px' }"
                    >
                        <div class="navbar-title {{ currentPage == i ? 'selected' : '' }}">{{ tab.name }}</div>
                        <div class="navbar-count" v-if="tab.totalCount">{{ tab.totalCount > 99 ? 99 : tab.totalCount }}</div>
                    </div>
                    <div
                        class="navbar-slider"
                        :style="{
                            'margin-left': data.sliderBarMarginLeft + 'px',
                            width: data.sliderBarWidth + 'px',
                            transform: 'translateX(' + data.sliderOffset + 'px)',
                            '-webkit-transform': 'translateX(' + data.sliderOffset + 'px)',
                        }"
                    ></div>
                </div>
            </div>

            <div class="create" @click="createClick">
                <img :src="getAssetsFile('work/common/icon_add.png')" />
                <span>新建</span>
            </div>
        </div>
        <div
            class="inbox-content"
            :style="{ visibility: data.currentPage == 0 ? 'visible' : 'hidden', left: data.currentPage == 0 ? 0 : '-100%' }"
        >
            <WorkInbox :category="category" @item-click="inboxItemClick" @forward-click="inboxForwardClick" ref="inboxPage"></WorkInbox>
        </div>
        <div
            class="outbox-content"
            :style="{ visibility: data.currentPage == 1 ? 'visible' : 'hidden', left: data.currentPage == 1 ? 0 : '-100%' }"
        >
            <WorkOutbox
                :category="category"
                @item-click="outboxItemClick"
                @forward-click="outboxForwardClick"
                @copy-click="outboxCopyClick"
                ref="outboxPage"
            ></WorkOutbox>
        </div>
        <div
            class="draft-content"
            :style="{ visibility: data.currentPage == 2 ? 'visible' : 'hidden', left: data.currentPage == 2 ? 0 : '-100%' }"
        >
            <WorkDraft :category="category" @item-click="draftItemClick" ref="draftPage"></WorkDraft>
        </div>
        <div
            class="statistic-content"
            :style="{ visibility: data.currentPage == 3 ? 'visible' : 'hidden', left: data.currentPage == 3 ? 0 : '-100%' }"
        >
            <WorkStatistic :category="category" ref="statisticPage"></WorkStatistic>
        </div>

        <!-- <app-work-notification-inbox-details
        (forwardClick)="inboxDetailsForwardClick($event)"
        #inboxdetails
    ></app-work-notification-inbox-details>

    <app-work-notification-outbox-details
        (copyClick)="outboxDetailsCopyClick($event)"
        (forwardClick)="outboxDetailsForwardClick($event)"
        #outboxdetails
    ></app-work-notification-outbox-details>

    <app-work-notification-create (refresh)="createRefreshClick($event)" #create></app-work-notification-create>

    <app-work-forward (refresh)="forwardRefreshClick()" #forward></app-work-forward> -->
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, onDeactivated, onActivated } from 'vue'
import getAssetsFile from '../../../utils/pub-use'
import { workStore } from '../../../store/work-store'
import WorkInbox from '../component/WorkInbox.vue'
import WorkOutbox from '../component/WorkOutbox.vue'
import WorkDraft from '../component/WorkDraft.vue'
import WorkStatistic from '../component/WorkStatistic.vue'
const { proxy } = getCurrentInstance()
const workService = workStore()
const category = 'ScheduleCategory_Notice'
const inboxPage = ref(null)
const outboxPage = ref(null)
const draftPage = ref(null)
const statisticPage = ref(null)
const data = reactive({
    tabs: [
        {
            name: '收件箱',
            code: 'inbox',
            totalCount: 0,
        },
        {
            name: '发件箱',
            code: 'outbox',
            totalCount: 0,
        },
        {
            name: '草稿箱',
            code: 'draft',
            totalCount: 0,
        },
        {
            name: '统计',
            code: 'statistic',
            totalCount: 0,
        },
    ],
    currentPage: 0,
    sliderOffset: 0,
    sliderWidth: 111,
    sliderBarWidth: 36,
    sliderBarMarginLeft: 37.5,
})

let isOnInit = false
const isActived = ref(false)
onMounted(() => {
    console.log('WorkNotification---onMounted')
    setPageCallback()
    // updateReceiveCount()
    // startChatWebSocket()
    addChartOnResizeListener()
})

onActivated(() => {
    console.log('WorkNotification---onActivated')
    isActived.value = true

    if (!isOnInit) {
        isOnInit = true
    } else {
        onShow()
    }
})
const onShow = () => {
    console.log('WorkNotification---onShow---')
    setPageCallback()
    // updateReceiveCount()
    refreshChart()
}
const refreshChart = () => {
    statisticPage && statisticPage.value && statisticPage.value.refreshChart()
    addChartOnResizeListener()
}
const addChartOnResizeListener = () => {
    setTimeout(() => {
        window.onresize = () => {
            console.log(statisticPage)
            statisticPage && statisticPage.value && statisticPage.value.refreshChart()
        }
    }, 200)
}
onDeactivated(() => {
    console.log('WorkNotification---onDeactivated')
    isActived.value = false
})

const setPageCallback = () => {
    console.log(proxy.$router)
    workService.setPageCallback(proxy.$router.currentRoute.value.path, {
        refresh: (result) => {
            console.log('WorkNotification--PageCallback--refresh')
            refreshClick()
        },
    })

    // this.receiveService.addReadListener(this.router.url, {
    //     refresh: (result) => {
    //         console.log('WorkNotification--addRead--refresh')
    //         this.inboxDetailsRefreshClick()
    //     },
    // })
}
const tabClick = (event, index) => {
    updateTab(event.currentTarget.offsetLeft, index)
}
const updateTab = (offsetLeft, index) => {
    data.sliderOffset = offsetLeft
    data.currentPage = index
}
const refreshClick = () => {
    switch (data.currentPage) {
        case 0:
            // if (this.inboxDetails.isShow) {
            //     this.inboxDetails.reload(true)
            // } else {
            console.log(inboxPage)
            inboxPage.value.reload()
            // updateReceiveCount()
            // }
            break
        case 1:
            // if (this.outboxDetails.isShow) {
            //     this.outboxDetails.reload(true)
            // } else {
            outboxPage.value.reload()
            // }
            break
        case 2:
            draftPage.value.reload()
            break
        case 3:
            statisticPage.value.refresh()
            break
        default:
            break
    }
}

const inboxItemClick = (event) => {
    console.log('inboxItemClick', event)
    // inboxDetails.show(event.id)
}
const inboxForwardClick = (event) => {
    console.log('inboxForwardClick', event)
    // this.forwardClick(event)
}
const outboxItemClick = (event) => {
    console.log('outboxItemClick', event)
    // this.outboxDetails.show(event.id)
}
const outboxForwardClick = (event) => {
    console.log('outboxForwardClick', event)
    // this.forwardClick(event)
}
const outboxCopyClick = (event) => {
    console.log('outboxCopyClick', event)
    // this.createPage.show(true, event.id)
}
const draftItemClick = (event) => {
    console.log('draftItemClick', event)
    //   this.createPage.show(false, event.id)
}
</script>
<style lang="scss" scoped>
@import '../../..//common/styles/variable/index.scss';

.container {
    width: 100%;
    height: 100%;
    display: flex;
    background: #f4f4f4;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    padding-top: $workTopHeight;
    .header {
        width: 100%;
        height: 2.75rem;
        display: flex;
        align-items: center;
        background: white;
        border-bottom: 1px solid #c6c6c6;

        .tab {
            position: relative;
            z-index: 5;
            width: 100%;
            height: 2.75rem;

            > div {
                display: -webkit-box;
                display: -webkit-flex;
                display: flex;
                position: absolute;
                z-index: 50;
                top: 0;
                height: 100%;
                box-sizing: border-box;
            }

            .navbar-item {
                position: relative;
                text-align: center;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 6.9375rem;
                cursor: pointer;
            }

            .navbar-slider {
                position: absolute;
                content: ' ';
                left: 0;
                bottom: 0;
                width: 36px;
                height: 3px;
                margin-left: 37.5px;
                border-radius: 4px;
                background-color: #5874e8;
                -webkit-transition: -webkit-transform 0.3s;
                transition: -webkit-transform 0.3s;
                transition: transform 0.3s;
                transition: transform 0.3s, -webkit-transform 0.3s;
            }

            .navbar-item.selected {
                border-bottom: 3px solid #5874e8;
            }

            .navbar-title {
                font-size: 0.75rem;
                color: #272f53;
            }

            .navbar-title.selected {
                color: #5874e8;
                font-weight: bold;
            }
            .navbar-count {
                margin-left: 0.25rem;
                font-size: 0.625rem;
                min-width: 1.25rem;
                height: 1.25rem;
                line-height: 1.25rem;
                border-radius: 1.25rem;
                color: white;
                background: #ff371d;
                border: 2px solid #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
            }

            // .navbar-count.selected {
            //     color: #22ccf2;
            // }
        }
        .create {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            height: 1.5625rem;
            background: #5874e8;
            border-radius: 2px;
            box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16);
            padding: 0 1.25rem;
            margin-right: 1.375rem;
            cursor: pointer;

            &:hover {
                background: #7089f2;
            }
            &:active {
                background: #435dcc;
            }
            img {
                width: 0.6875rem;
                height: 0.6875rem;
                margin-right: 0.5rem;
            }
            span {
                font-size: 0.75rem;
                color: white;
            }
        }
    }

    .inbox-content,
    .outbox-content,
    .draft-content,
    .statistic-content {
        width: 100%;
        height: calc(100% - 2.75rem - #{$workTopHeight});
        position: absolute;
        z-index: 100;
        left: 0;
        top: calc(2.75rem + #{$workTopHeight});
    }
    // .inbox-details,
    // .outbox-details,
    // .create-container,
    // .forward-container {
    //     width: 100%;
    //     height: calc(100% - #{$workTopHeight});
    //     position: absolute;
    //     z-index: 101;
    //     left: 0;
    //     top: $workTopHeight;
    // }
}
</style>
