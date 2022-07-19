<template>
    <div class="container">
        <div class="left">
            <div class="chart-container">
                <div class="chart-header">
                    <div></div>
                    <span>统计信息</span>
                    <!-- <div class="filter">
                    <a nz-dropdown nzTrigger="click" [nzDropdownMenu]="categorymenu">
                        {{ selectedDay.name }}
                        <i nz-icon nzType="caret-down"></i>
                    </a>
                    <nz-dropdown-menu #categorymenu="nzDropdownMenu">
                        <ul nz-menu>
                            <li
                                nz-menu-item
                                *ngFor="let item of filterDays; let i = index"
                                (click)="filterDayClick(i)"
                                [nzSelected]="item.selected"
                            >
                                {{ item.name }}
                            </li>
                        </ul>
                    </nz-dropdown-menu>
                </div> -->
                </div>
                <div id="work_home_chart" class="chart"></div>
            </div>
            <div class="module-container">
                <div class="module-header">
                    <div></div>
                    <span>我的应用</span>
                    <!-- <div>
                    <span>新建</span>
                </div> -->
                </div>
                <div class="module">
                    <div class="module-cell" v-for="(item, index) in modules" :key="index" @click="moduleClick(item)">
                        <img :src="item.icon" />
                        <span>{{ item.name }}</span>
                        <div v-if="item.notify">{{ item.count }}</div>
                        <!-- <span *ngIf="item.count">{{ item.count }}</span> -->
                    </div>
                </div>
            </div>
        </div>
        <!-- <div class="right">
        <div class="right-header">
            <div></div>
            <span>待办事项</span>
            <span *ngIf="totalCount">（{{ totalCount }}）</span>
        </div>
        <div
            class="right-list"
            *ngIf="!noData"
            infiniteScroll
            [infiniteScrollDistance]="1"
            [alwaysCallback]="true"
            [scrollWindow]="false"
            (scrolled)="onReachBottom()"
        >
            <div class="right-item" *ngFor="let item of list; let i = index" (click)="itemClick(i)">
                <span>{{ item.category }}</span>
                <div>
                    <span>{{ item.name }}</span>
                    <span>发布单位：{{ item.agent }}</span>
                    <span>发布日期：{{ item.time }}</span>
                    <span>查看</span>
                </div>
            </div>
            <div class="reloading" *ngIf="isReloadingSchedule">
                <img [src]="spa('icon_loading_circle.gif')" style="width: 1.875rem; height: 1.875rem" />
            </div>
            <div class="loadingMore" *ngIf="isLoadingMore">
                <img [src]="spa('icon_loading_circle.gif')" />
                <span>正在加载...</span>
            </div>
            <div class="nomore" *ngIf="isNoMoreShow">已无更多</div>
        </div>
        <div class="none" *ngIf="noData">
            <img [src]="spa('common/icon_data_empty.png')" />
            <span>暂无相关数据</span>
        </div>
    </div> -->
    </div>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import getAssetsFile from '../../utils/pub-use'
import homeService from '../../api/home'
import { result } from 'lodash'
import dateService from '../../utils/date-service'
const { proxy } = getCurrentInstance()

const modules = reactive([
    {
        name: '通知公告',
        code: 'ScheduleCategory_Notice',
        icon: getAssetsFile('work/home/icon_tzgg.png'),
        page: '/work/notification',
        notify: false,
    },
    {
        name: '问卷调查',
        code: 'ScheduleCategory_Question',
        icon: getAssetsFile('work/home/icon_wjdc.png'),
        page: '/work/question',
        notify: false,
    },
    { name: '投票调查', code: 'ScheduleCategory_Vote', icon: getAssetsFile('work/home/icon_tpdc.png'), page: '/work/vote', notify: false },
    {
        name: '会议会务',
        code: 'ScheduleCategory_Meeting',
        icon: getAssetsFile('work/home/icon_hyhw.png'),
        page: '/work/meeting',
        notify: false,
    },
    {
        name: '活动报名',
        code: 'ScheduleCategory_Activity',
        icon: getAssetsFile('work/home/icon_hdbm.png'),
        page: '/work/activity',
        notify: false,
    },
    {
        name: '内参资料',
        code: 'ScheduleCategory_Reference',
        icon: getAssetsFile('work/home/icon_nczl.png'),
        page: '/work/document',
        notify: false,
    },
    { name: '文件共享', code: 'ScheduleCategory_File', icon: getAssetsFile('work/home/icon_wjgx.png'), page: '/work/file', notify: false },
    {
        name: '群组设置',
        code: 'ScheduleCategory_Group',
        icon: getAssetsFile('work/home/icon_qzsz.png'),
        page: '/work/group',
        notify: false,
    },
    // { name: '视频会议', code: '', icon: getAssetsFile('work/home/icon_sphy.png'), page: '' },
    // { name: '学习资料',code: '',  icon: getAssetsFile('work/home/icon_xxyd.png'), page: '' },
    // { name: '事务督办',code: '',  icon: getAssetsFile('work/home/icon_swdb.png'), page: '' },
    // { name: '非公党建', code: '', icon: getAssetsFile('work/home/icon_fgdj.png'), page: '' },
    // { name: '意见建议',code: '',  icon: getAssetsFile('work/home/icon_yjjy.png'), page: '' },
    // { name: '全部应用',code: 'all',  icon: getAssetsFile('work/home/icon_all.png'), page: 'work/home/application' },
])
const data = reactive({
    isReloading: false,

    list: [],
    //是否重新加载
    isReloadingSchedule: false,
    //是否在加载更多
    isLoadingMore: false,
    //是否显示已无更多
    isNoMoreShow: false,
    //当前条件下的总数量
    totalCount: 0,

    noData: false,

    filterDays: [
        { name: '近7天', value: 7, selected: true },
        { name: '近30天', value: 30, selected: false },
    ],
    selectedDay: { name: '近7天', value: 7, selected: true },

    //webSocket频道 用于接收收件列表信息 cowx.link.model.Receive_${organization}_${account}
    webSocketChannel: undefined,
})
const temp = {}
onMounted(() => {
    initChart([], [], [])
    reloadFull()
})
const moduleClick = (item) => {
    if (!item.page) {
        ElMessage.info('敬请期待')
        return
    }
    if (!isLogin()) {
        proxy.$router.push('/login')
        return
    }
    proxy.$router.push(`${item.page}`)
    // if (
    //     item.page == 'work/notification' ||
    //     item.page == 'work/questionn' ||
    //     item.page == 'work/vote' ||
    //     item.page == 'work/fileshare' ||
    //     item.page == 'work/meeting' ||
    //     item.page == 'work/activity' ||
    //     item.page == 'work/affairs'
    // ) {
    // this.router.navigate([`${item.page}`], {
    //     queryParams: {
    //         key: this.globalService.getGuid(),
    //     },
    // })
    // return
    // }
    // this.router.navigate([`/${item.page}`])
}

const isLogin = () => {
    return proxy.$storage.get('currentAccount') != null
}

const reloadFull = () => {
    temp.refreshMode = 1
    // this.zwPopup.showLoading()
    resetFilterDay()

    homeService
        .fetchWorkbench()
        .then((result) => {
            if (result) {
                disposeUnreadCount(result)
                disposeChartData(result.sendStatistics)
                disposeWaitList(result)
            }
            reloadFinish()
        })
        .catch((err) => {
            console.log(err)
            reloadFinish()
        })
}

const resetFilterDay = () => {
    data.filterDays = [
        { name: '近7天', value: 7, selected: true },
        { name: '近30天', value: 30, selected: false },
    ]
    data.selectedDay = { name: '近7天', value: 7, selected: true }
}
const disposeWaitList = (result) => {
    let data = result.receiveUnsubmitPagerResult

    let count = data && data.count
    let value = (data && data.list) || []
    let newList = data.list
    if (temp.refreshMode == 1 || temp.refreshMode == 2) newList = []
    let isNoMoreShow = false

    if (value.length > 0) Array.prototype.push.apply(newList, getList(value))

    //当前列表数量超过一页,且等于最大数量则显示已无更多
    if (newList.length >= 10 && newList.length >= count) isNoMoreShow = true

    data.noData = newList.length == 0
    data.list = newList
    data.totalCount = count
    data.isReloadingSchedule = false
    data.isLoadingMore = false
    data.isNoMoreShow = isNoMoreShow
}

const getList = (value) => {
    return value.map((item) => {
        let send = item.send
        let schedule = send.schedule
        return {
            id: item.id,
            sendId: send.id,
            category: schedule.category.name,
            code: schedule.category.code,
            name: schedule.title,
            agent: schedule.signature,
            time: dateService.format(schedule.timestamp, 'yyyy-MM-dd'),
        }
    })
}
const disposeUnreadCount = (result) => {
    let receiveUnsubmitStatistics = result.receiveUnsubmitStatistics

    let category = [
        'ScheduleCategory_Notice',
        'ScheduleCategory_Question',
        'ScheduleCategory_Vote',
        'ScheduleCategory_Meeting',
        'ScheduleCategory_Activity',
        'ScheduleCategory_Reference',
    ]
    let map = {}
    receiveUnsubmitStatistics &&
        receiveUnsubmitStatistics.forEach((item) => {
            map[item.categoryCode] = {
                count: item.employeeReceiveUnsubmitCount || 0,
            }
        })

    modules.forEach((module) => {
        let data = map[module.code]
        module.notify = (data && data.count > 0) || false
    })
}
const disposeChartData = (result) => {
    let category = [
        'ScheduleCategory_Notice',
        'ScheduleCategory_Question',
        'ScheduleCategory_Vote',
        'ScheduleCategory_Meeting',
        'ScheduleCategory_Activity',
        'ScheduleCategory_Reference',
    ]
    let map = {}
    let name = []
    let data1 = [] //全部完成数
    let data2 = [] //我的完成数
    result &&
        result.forEach((item) => {
            map[item.categoryCode] = {
                name: item.categoryName,
                total: item.organizationPublishCount || 0,
                count: item.employeePublishCount || 0,
            }
        })
    category.forEach((item) => {
        let data = map[item]
        name.push(data.name)
        data1.push(data.total)
        data2.push(data.count)
    })
    initChart(name, data1, data2)
}
const reloadFinish = () => {
    data.isReloadingSchedule = false
    setTimeout(() => {
        // this.zwPopup.hideLoading()
    }, 300)
}
let myChart
const initChart = (name, data1, data2) => {
    console.log(name)
    console.log(data1)
    console.log(data2)
    try {
        let _myChart = myChart
        if (!myChart) {
            let chartDom = document.getElementById('work_home_chart')
            _myChart = proxy.$echarts.init(chartDom)
        }
        let option

        let total1 = 0
        data1.forEach((data) => {
            total1 += data
        })
        let total2 = 0
        data2.forEach((data) => {
            total2 += data
        })
        if (total1 == 0 && total2 == 0) {
            option = {
                title: {
                    text: '{a|}',
                    x: 'center',
                    y: 'center',
                    subtext: '暂无数据',
                    itemGap: -20,
                    textStyle: {
                        rich: {
                            a: {
                                color: '#000',
                                fontSize: '16',
                                height: 80,
                                width: 160,
                                backgroundColor: {
                                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA2NCA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbFJ1bGU9ImV2ZW5vZGQiPg0KICAgIDxlbGxpcHNlIGZpbGw9IiNkZGQiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3IiAvPg0KICAgIDxnIGZpbGxSdWxlPSJub256ZXJvIiBzdHJva2U9IiM5OTkiPg0KICAgICAgPHBhdGgNCiAgICAgICAgZD0iTTU1IDEyLjc2TDQ0Ljg1NCAxLjI1OEM0NC4zNjcuNDc0IDQzLjY1NiAwIDQyLjkwNyAwSDIxLjA5M2MtLjc0OSAwLTEuNDYuNDc0LTEuOTQ3IDEuMjU3TDkgMTIuNzYxVjIyaDQ2di05LjI0eiIgLz4NCiAgICAgIDxwYXRoDQogICAgICAgIGQ9Ik00MS42MTMgMTUuOTMxYzAtMS42MDUuOTk0LTIuOTMgMi4yMjctMi45MzFINTV2MTguMTM3QzU1IDMzLjI2IDUzLjY4IDM1IDUyLjA1IDM1aC00MC4xQzEwLjMyIDM1IDkgMzMuMjU5IDkgMzEuMTM3VjEzaDExLjE2YzEuMjMzIDAgMi4yMjcgMS4zMjMgMi4yMjcgMi45Mjh2LjAyMmMwIDEuNjA1IDEuMDA1IDIuOTAxIDIuMjM3IDIuOTAxaDE0Ljc1MmMxLjIzMiAwIDIuMjM3LTEuMzA4IDIuMjM3LTIuOTEzdi0uMDA3eiINCiAgICAgICAgZmlsbD0iI2UxZTFlMSIgLz4NCiAgICA8L2c+DQogIDwvZz4NCjwvc3ZnPg==',
                                },
                            },
                        },
                    },
                    subtextStyle: {
                        fontSize: 16,
                    },
                },
            }
        } else {
            option = {
                color: ['#5874E8', '#5AD8A6', '#4cabce', '#e5323e'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // Use axis to trigger tooltip
                        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
                    },
                },
                legend: {
                    data: ['全部完成数', '我的完成数'],
                    itemWidth: 8,
                    itemHeight: 8,
                    itemGap: 23,
                    textStyle: {
                        color: '#8c8c8c',
                    },
                },
                grid: {
                    left: '4%',
                    right: '4%',
                    bottom: '8%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: name,
                    axisLabel: {
                        color: 'rgba(0, 0, 0, 0.45)',
                    },
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLabel: {
                        color: 'rgba(0, 0, 0, 0.45)',
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['rgba(0, 0, 0, 0.15)'],
                        },
                    },
                },
                series: [
                    {
                        name: '全部完成数',
                        type: 'bar',
                        // label: {
                        //     show: true,
                        // },
                        emphasis: {
                            focus: 'series',
                        },
                        data: data1,
                        barWidth: '20%',
                        barGap: 0,
                        itemStyle: {
                            opacity: 0.8,
                        },
                    },
                    {
                        name: '我的完成数',
                        type: 'bar',
                        // label: {
                        //     show: true,
                        // },
                        emphasis: {
                            focus: 'series',
                        },
                        data: data2,
                        barWidth: '20%',
                        barGap: 0,
                        itemStyle: {
                            opacity: 0.8,
                        },
                    },
                ],
            }
        }
        _myChart.clear()
        option &&
            _myChart.setOption(option, {
                notMerge: true,
            })
        myChart = _myChart
    } catch (err) {
        console.log('initChart err', err)
    }
}
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    background: white;
    box-sizing: border-box;
    padding-top: 5.375rem;

    .left {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 2rem 0;
        box-sizing: border-box;

        .chart-container {
            flex-shrink: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            padding: 0 2rem;
            box-sizing: border-box;

            .chart-header {
                width: 100%;
                display: flex;
                align-items: center;

                > div:nth-of-type(1) {
                    flex-shrink: 0;
                    width: 0.25rem;
                    height: 1rem;
                    background: #5874e8;
                    margin-right: 0.625rem;
                }

                > span:nth-of-type(1) {
                    font-size: 1rem;
                    color: #404040;
                    font-weight: bold;
                }
                // > span:nth-of-type(2) {
                //     margin-left: 1rem;
                //     font-size: 0.875rem;
                //     color: #6c78af;
                // }
                .filter {
                    display: flex;
                    align-items: center;
                    min-width: 6.4rem;
                    margin-left: 1rem;

                    a {
                        font-size: 0.875rem;
                        color: #6c78af;
                    }

                    i {
                        color: #caccd8;
                    }
                }
            }
            .chart {
                width: 100%;
                height: 17.5rem;
                border-bottom: 1px solid #dedede;
            }
        }

        .module-container {
            flex-shrink: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            margin-top: 2rem;

            .module-header {
                display: flex;
                align-items: center;
                padding: 0 2rem;
                box-sizing: border-box;

                div:nth-of-type(1) {
                    flex-shrink: 0;
                    width: 0.25rem;
                    height: 1rem;
                    background: #5874e8;
                    margin-right: 0.625rem;
                }

                > span:nth-of-type(1) {
                    flex: 1;
                    font-size: 1rem;
                    color: #404040;
                    font-weight: bold;
                }
                div:nth-of-type(2) {
                    display: flex;
                    align-items: center;
                    height: 1.5625rem;
                    border: 1px solid #b1bdf2;
                    padding: 0 1.1875rem;
                    span {
                        flex-shrink: 0;
                        margin-left: 1rem;
                        font-size: 0.875rem;
                        color: #6c78af;
                    }
                }
            }
            .module {
                flex-shrink: 0;
                box-sizing: border-box;
                overflow: hidden;
                padding: 0.875rem 1.1875rem;
                background: white;

                .module-cell {
                    float: left;
                    box-sizing: border-box;
                    width: 10.88rem;
                    height: 4.5rem;
                    background: #ffffff;
                    border: 1px solid #f4f4f4;
                    border-radius: 4px;
                    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.08);
                    display: flex;
                    align-items: center;
                    margin: 0.875rem 0.8125rem;
                    position: relative;
                    cursor: pointer;

                    &:hover {
                        box-shadow: 0px 5px 16px 0px rgba(0, 0, 0, 0.12);
                    }

                    img {
                        flex-shrink: 0;
                        margin: 0 1.125rem;
                        width: 2.375rem;
                        height: 2.375rem;
                    }

                    span:nth-of-type(1) {
                        color: #404040;
                        font-weight: bold;
                        font-size: 0.875rem;
                    }

                    div {
                        position: absolute;
                        right: 0.5rem;
                        top: 0.5rem;
                        z-index: 1;
                        width: 0.5rem;
                        height: 0.5rem;
                        background: #ed5757;
                        border-radius: 50%;
                    }
                    span:nth-of-type(2) {
                        position: absolute;
                        right: 0.5rem;
                        top: 0.375rem;
                        z-index: 1;
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
                }
            }
        }
    }

    .right {
        flex-shrink: 0;
        width: 21.25rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 2rem 1rem 2rem 2rem;
        box-sizing: border-box;
        border-left: 1px solid #dedede;
        position: relative;

        .right-header {
            display: flex;
            align-items: center;

            div {
                flex-shrink: 0;
                width: 0.25rem;
                height: 1rem;
                background: #5874e8;
                margin-right: 0.625rem;
            }

            > span:nth-of-type(1) {
                font-size: 1.125rem;
                color: #404040;
                font-weight: bold;
            }
            > span:nth-of-type(2) {
                font-size: 0.875rem;
                color: #404040;
                font-weight: bold;
            }
        }
        .right-list {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 1.125rem 1rem 1.125rem 0;
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: auto;

            .right-item {
                border: 1px solid #dbe8f4;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                margin: 0.375rem 0;
                cursor: pointer;

                > span {
                    color: #272f53;
                    font-weight: bold;
                    font-size: 0.75rem;
                    padding: 0.375rem 0.875rem;
                    background: linear-gradient(270deg, #f0f7fd, #d9ecff);
                    border-radius: 4px 4px 0px 0px;
                }
                div {
                    display: flex;
                    flex-direction: column;
                    padding: 0.625rem 0.875rem;
                    box-sizing: border-box;
                    position: relative;

                    > span:nth-of-type(1) {
                        font-size: 0.75rem;
                        color: #404040;
                        line-height: 1.125rem;
                        height: 3.375rem;

                        text-overflow: ellipsis;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                    }
                    > span:nth-of-type(2) {
                        margin-top: 0.5rem;
                        font-size: 0.75rem;
                        color: #939393;
                    }
                    > span:nth-of-type(3) {
                        margin-top: 0.1875rem;
                        font-size: 0.75rem;
                        color: #939393;
                    }

                    > span:nth-of-type(4) {
                        position: absolute;
                        right: 0.875rem;
                        bottom: 0.625rem;
                        z-index: 1;
                        font-size: 0.75rem;
                        color: #4d7cfc;
                    }
                }
            }

            .reloading {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .loadingMore {
                flex-shrink: 0;
                width: 100%;
                height: 3.6rem;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0.5rem;

                img {
                    width: 1.25rem;
                    height: 1.25rem;
                }

                span {
                    margin-left: 0.625rem;
                    color: #999;
                    font-size: 0.875rem;
                }
            }
            .nomore {
                flex-shrink: 0;
                width: 100%;
                height: 3.6rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                color: #939393;
            }
        }
        .none {
            position: absolute;
            top: 40%;
            left: 50%;
            z-index: 2;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            img {
                width: 19.6875rem;
                height: 13.5rem;
            }

            span {
                color: #616b7a;
                font-size: 0.9375rem;
                line-height: 1.5rem;
                text-align: center;
                margin-top: 1rem;
            }
        }
    }
}
</style>
