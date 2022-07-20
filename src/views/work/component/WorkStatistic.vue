<template>
    <div class="work-statistic" v-loading="data.isReloading">
        <div class="chart-header">
            <div></div>
            <span>统计概况</span>
            <div class="filter">
                <div class="filter">
                    <el-dropdown @command="filterDayClick">
                        <span class="el-dropdown-link">
                            {{ data.selectedDay.name }}
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="(item, index) in data.filterDays" :key="index" :command="index">{{
                                    item.name
                                }}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </div>

        <div class="module">
            <div class="module-cell" v-for="(item, index) in data.modules" :key="index" :style="{ background: item.background }">
                <span>{{ item.count }}</span>
                <span>{{ item.name }}</span>
            </div>
        </div>

        <div class="chart-container">
            <div>
                <div :id="'work-statistic-chart-' + category" class="chart"></div>
            </div>
        </div>
        <!-- <zw-loading [isAbsolute]="true" [top]="'0'" [background]="loadingBg" (zw-loading-error-tap)="zwLoadingErrorTap()" #loading></zw-loading> -->
    </div>
</template>
<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import receiveService from '../../../api/receive'
import dateService from '../../../utils/date-service'
const { proxy } = getCurrentInstance()
defineProps(['category'])

const data = reactive({
    isReloading: false,
    filterDays: [
        { name: '近7天', value: 7, selected: true },
        { name: '近30天', value: 30, selected: false },
    ],
    selectedDay: { name: '近7天', value: 7, selected: true },

    modules: [
        { name: '收件总数', count: 0, background: '#4199FF' },
        { name: '未读收件', count: 0, background: '#4199FF' },
        { name: '确认收件', count: 0, background: '#4199FF' },
        { name: '过期收件', count: 0, background: '#4199FF' },
        { name: '发件总数', count: 0, background: '#F07F39' },
        { name: '转发总数', count: 0, background: '#13D1B8' },
    ],
})
onMounted(() => {
    data.category = proxy.$props.category
    reload()
})

const reload = () => {
    if (data.isReloading) return
    data.isReloading = true
    loadChart()
}
const refresh = () => {
    if (data.isReloading) return
    data.isReloading = true
    loadChart(true)
}

const loadChart = (isRefresh = false) => {
    // this.loadingBg = isRefresh ? 'transparent' : 'white'
    // this.zwLoading.showLoading()

    receiveService
        .fetchStatistics(data.category, data.selectedDay.value)
        .then((result) => {
            if (!result) {
                reloadError()
                return
            }
            disposeResult(result)
            reloadFinish()
        })
        .catch((err) => {
            reloadError()
        })
}
const disposeResult = (result) => {
    let employeeStatistics = result.employeeStatistics
    let employeeDaysStatistics = result.employeeDaysStatistics

    let receiveCount = 0
    let unreadCount = 0
    let confirmCount = 0
    let expireCount = 0
    let sendCount = 0
    let forawrdCount = 0

    if (employeeStatistics) {
        receiveCount = employeeStatistics.employeeReceiveCount || 0
        unreadCount = employeeStatistics.employeeReceiveUnsubmitCount || 0
        confirmCount = employeeStatistics.employeeReceiveCompleteCount || 0
        expireCount = employeeStatistics.employeeReceiveUncompleteCount || 0
        sendCount = employeeStatistics.employeeSendPublishCount || 0
        forawrdCount = employeeStatistics.employeeSendForwardCount || 0
    }

    data.modules[0].count = receiveCount
    data.modules[1].count = unreadCount
    data.modules[2].count = confirmCount
    data.modules[3].count = expireCount
    data.modules[4].count = sendCount
    data.modules[5].count = forawrdCount

    let name = []
    let data1 = []
    let data2 = []
    let data3 = []

    if (employeeDaysStatistics) {
        employeeDaysStatistics.sort((a, b) => {
            return b.days - a.days
        })

        console.log(employeeDaysStatistics)

        employeeDaysStatistics.forEach((item) => {
            let start = dateService.format(item.start, 'MM/dd')
            name.push(start)
            data1.push(item.employeeReceiveCount)
            data2.push(item.employeeSendPublishCount)
            data3.push(item.employeeSendForwardCount)
        })
    }
    initChart(name, data1, data2, data3)
}
const reloadError = () => {
    data.isReloading = false
    // this.zwLoading.showError()
}
const reloadFinish = () => {
    setTimeout(() => {
        data.isReloading = false
        // this.zwLoading.hide()
    }, 300)
}
const filterDayClick = (i) => {
    let item = data.filterDays[i]
    if (data.selectedDay.value == item.value) return
    data.filterDays.forEach((item, index) => {
        item.selected = i == index
    })
    data.selectedDay = JSON.parse(JSON.stringify(data.filterDays[i]))
    refresh()
}

let myChart
const initChart = (name, data1, data2, data3) => {
    try {
        let _myChart = myChart
        if (!myChart) {
            let chartDom = document.getElementById('work-statistic-chart-' + data.category)
            _myChart = proxy.$echarts.init(chartDom)
        }
        let option

        if (name.length == 0) {
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
                color: ['#5B8FF9', 'rgba(38,154,153,0.60)', '#FDA830'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // Use axis to trigger tooltip
                        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
                    },
                },
                legend: {
                    data: ['收件统计', '发件统计', '转发统计'],
                    itemGap: 40,
                },
                grid: {
                    left: '4%',
                    right: '4%',
                    bottom: '4%',
                    containLabel: true,
                },
                // toolbox: {
                //     feature: {
                //         saveAsImage: {},
                //     },
                // },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
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
                        name: '收件统计',
                        type: 'line',
                        // stack: '总量',
                        data: data1,
                        smooth: true,
                    },
                    {
                        name: '发件统计',
                        type: 'line',
                        // stack: '总量',
                        data: data2,
                        smooth: true,
                    },
                    {
                        name: '转发统计',
                        type: 'line',
                        // stack: '总量',
                        data: data3,
                        smooth: true,
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
const refreshChart = () => {
    myChart && myChart.resize()
}

defineExpose({
    refresh,
    refreshChart,
})
</script>
<style lang="scss" scoped>
.work-statistic {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;
    padding: 1.5625rem 0;
    box-sizing: border-box;
    background: white;

    .chart-header {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0 2.25rem;
        box-sizing: border-box;

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

        .filter {
            display: flex;
            align-items: center;
            min-width: 6.4rem;
            margin-left: 1rem;

            .el-dropdown-link {
                cursor: pointer;
                color: var(--el-color-primary);
                display: flex;
                align-items: center;
            }
        }
        // > span:nth-of-type(2) {
        //     margin-left: 1rem;
        //     font-size: 0.875rem;
        //     color: #6c78af;
        // }
    }
    .module {
        flex-shrink: 0;
        box-sizing: border-box;
        overflow: hidden;
        padding: 0.5rem 1.6875rem;
        margin-top: 0.5rem;

        .module-cell {
            float: left;
            box-sizing: border-box;
            width: 9.25rem;
            height: 4.3125rem;
            border-radius: 2px;
            box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin: 0.5625rem 0.5625rem;
            position: relative;
            padding: 0 1.125rem;

            span:nth-of-type(1) {
                color: white;
                font-weight: bold;
                font-size: 1.5rem;
                line-height: 1;
            }
            span:nth-of-type(2) {
                margin-top: 0.125rem;
                color: white;
                font-size: 0.75rem;
            }
        }
    }
    .chart-container {
        flex-shrink: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 1.0625rem;
        padding: 0 2.25rem;
        box-sizing: border-box;

        > div {
            width: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 1.375rem 0;
            box-sizing: border-box;
            border: 1px solid #e3e3e3;

            .chart {
                width: 100%;
                height: 23.75rem;
            }
        }
    }
}
</style>
