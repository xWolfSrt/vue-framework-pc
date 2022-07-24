<template>
    <div class="work-outbox">
        <div class="content">
            <el-table
                :data="data.list"
                style="width: 100%"
                :height="'100%'"
                v-loading="data.isReloading"
                :row-class-name="tableRowClassName"
                :header-row-style="{
                    color: '#7e7e7e',
                    'font-weight': 'bold',
                    'font-size': '0.75rem',
                    padding: ' 8px 16px',
                    background: '#fafbfd',
                }"
                empty-text="暂无数据"
                @row-click="itemClick"
            >
                <el-table-column label="启用" width="100">
                    <template #default="scope">
                        <!-- 阻止switch组件事件冒泡  @click.stop=""-->
                        <div class="table-enable" @click.stop="">
                            <!-- switch组件传递参数使用bind  toggleClick.bind-->
                            <el-switch
                                v-model="scope.row.enable"
                                :before-change="toggleClick.bind(this, scope.$index)"
                                :loading="scope.row.loading"
                            />
                            <div class="table-forward-tips" v-if="scope.row.isForward">转</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="标题名称">
                    <template #default="scope">
                        <div class="table-name">
                            <span> {{ scope.row.name }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="发布时间" width="148">
                    <template #default="scope">
                        <div class="table-time">
                            <span> {{ scope.row.time }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="考核日期" width="148">
                    <template #default="scope">
                        <div class="table-exam">
                            <span> {{ scope.row.examTime }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="" width="132">
                    <template #default="scope">
                        <div class="table-operate">
                            <div :title="'转发'" @click.stop="forwardClick(scope.$index)">
                                <img :src="getAssetsFile('work/common/icon_forward.png')" />
                            </div>
                            <div :title="'复制'" @click.stop="copyClick(scope.$index)">
                                <img :src="getAssetsFile('work/common/icon_copy.png')" />
                            </div>
                            <div
                                :title="'查看统计数据'"
                                @click.stop="statisticClick(scope.$index)"
                                v-if="data.needStatistic && !scope.row.isForward"
                            >
                                <img :src="getAssetsFile('work/common/icon_chart.png')" />
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="bottom">
            <span>共{{ data.totalCount }}项</span>

            <el-pagination
                background
                v-model:currentPage="data.pageIndex"
                v-model:page-size="data.pageSize"
                layout="sizes, prev, pager, next"
                :total="data.totalCount"
                @size-change="pageSizeChange"
                @current-change="pageIndexChange"
            />
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, toRaw } from 'vue'
import getAssetsFile from '../../../utils/pub-use'
import receiveService from '../../../api/receive'
import sendService from '../../../api/send'
import dateService from '../../../utils/date-service'
const { proxy } = getCurrentInstance()
defineProps(['category', 'needStatistic'])
const emits = defineEmits(['itemClick', 'forwardClick', 'copyClick', 'statisticClick'])

const data = reactive({
    category: undefined,
    needStatistic: false,
    pageIndex: 1,
    pageSize: 10,

    list: [],
    //是否重新加载
    isReloading: false,
    //是否在加载更多
    isLoadingMore: false,
    //是否显示已无更多
    isNoMoreShow: false,
    //当前条件下的总数量
    totalCount: 0,

    noData: false,
})
onMounted(() => {
    data.category = proxy.$props.category
    data.needStatistic = proxy.$props.needStatistic || false
    reload()
})
const tableRowClassName = ({ row, rowIndex }) => {
    // if (row.isRead) {
    //     return 'table-tr-read'
    // }
    return 'table-tr'
}

const pageIndexChange = (event) => {
    console.log('pageIndexChange', event)
    data.pageIndex = event
    refresh()
}
const pageSizeChange = (event) => {
    console.log('pageSizeChange', event)
    data.pageSize = event
    reload()
}
const itemClick = (item) => {
    emits('itemClick', toRaw(item))
}
const forwardClick = (i) => {
    emits('forwardClick', data.list[i])
}
const copyClick = (i) => {
    emits('copyClick', data.list[i])
}
const statisticClick = (i) => {
    emits('statisticClick', data.list[i])
}

const toggleClick = (i) => {
    console.log(i)
    let item = data.list[i]
    let enable = item.enable
    item.loading = true
    return new Promise((resolve, reject) => {
        sendService
            .toggle(item.id, !enable)
            .then((result) => {
                item.loading = false
                if (result) {
                    resolve(true)
                } else {
                    reject(new Error('Error'))
                }
            })
            .catch((err) => {
                item.loading = false
                reject(new Error('Error'))
            })
    })
}
const reload = () => {
    if (data.isReloading) return
    data.isReloading = true
    data.pageIndex = 1
    load({ start: 0 })
}

const refresh = () => {
    if (data.isReloading) return
    data.isReloading = true
    load({ start: 0 })
}

const load = (config) => {
    let isReloading = config && config.start == 0

    //如果是重新加载且当前正在reload,则取消之前的请求
    // if (isReloading && this.isReloading && this.temp.requestTask) {
    //   this.temp.requestTask.abort();
    // }
    data.isReloading = isReloading
    data.isLoadingMore = !isReloading
    if (isReloading) {
        // data.list = []
        data.isNoMoreShow = false
        // data.totalCount = 0
        data.noData = false
    }

    let account = proxy.$storage.get('currentAccount')
    let selectedOrganization = proxy.$storage.get('selectedOrganization')

    let lambda = `item.getOrganization()=="${selectedOrganization.id}" &&item.getAccount()=="${account.account}"&&item.getScheduleInfo().getCategoryInfo().getCode()==\"${data.category}\"&& item.getSubmit()`

    let pager = {
        start: (data.pageIndex - 1) * data.pageSize,
        limit: data.pageSize,
        filter: `sql->sql.where(item-> ${lambda})`,
        navigations: ['scheduleInfo.categoryInfo'],
        sorter: 'sql->sql.orderby(item->item.getTimestamp(),false)',
    }
    sendService
        .queryList(pager)
        .then((result) => {
            if (!result) {
                queryFinish(true)
                return
            }
            let count = result.count
            let value = result.list || []
            let newList = []
            let isNoMoreShow = false

            if (value.length > 0) Array.prototype.push.apply(newList, getList(value))

            //当前列表数量超过一页,且等于最大数量则显示已无更多
            if (newList.length >= 10 && newList.length >= count) isNoMoreShow = true

            data.noData = newList.length == 0
            data.list = newList
            data.totalCount = count
            data.isReloading = false
            data.isLoadingMore = false
            data.isNoMoreShow = isNoMoreShow
            queryFinish()
        })
        .catch((err) => {
            queryFinish(true, err)
        })
}
const queryFinish = (isError = false, errMsg) => {
    console.log('queryFinish')
    setTimeout(() => {
        data.isReloading = false
        data.noData = !data.list || data.list.length == 0
    }, 300)
}
const getList = (value) => {
    return value.map((item) => {
        let schedule = item.schedule
        return {
            id: item.id,
            name: schedule.title,
            category: schedule.category.name,
            code: schedule.category.code,
            enable: item.enable,
            isForward: item.parent != null,
            sender: item.signature,
            sendId: item.id,
            sendDate: item.timestamp,
            publisher: schedule.signature,
            publishId: schedule.id,
            publishTime: dateService.format(schedule.timestamp, 'yyyy-MM-dd HH:mm'),
            deadline: item.deadline,
            time: dateService.format(item.timestamp, 'yyyy/MM/dd'),
            examTime: dateService.format(item.deadline, 'yyyy/MM/dd'),
        }
    })
}
defineExpose({
    reload,
})
</script>
<style lang="scss" scoped>
.work-outbox {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;

    .content {
        width: 100%;
        height: calc(100% - 3.25rem);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
        background: white;
        // .el-table__header {
        //     color: #7e7e7e;
        //     font-weight: bold;
        //     font-size: 0.75rem;
        //     padding: 8px 16px;
        //     background: #fafbfd;
        // }
        :deep(.el-table .table-tr) {
            cursor: pointer;
        }

        .table-tr:hover .table-operate {
            visibility: visible;
        }

        .table-td {
            padding: 0.875rem 1rem;
        }

        .table-enable {
            // width: 6.25rem;
            display: flex;
            align-items: center;
            padding: 4px 0;

            .table-forward-tips {
                width: 1rem;
                height: 1rem;
                border: 1px solid #feb43b;
                border-radius: 3px;
                font-size: 0.625rem;
                color: #ffaa27;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 1.25rem;
                line-height: 1rem;
                margin-top: 0.19rem;
            }
        }
        .table-name {
            display: flex;
            align-items: center;
            padding: 4px 0;

            img {
                flex-shrink: 0;
                width: 1.25rem;
                height: auto;
                margin-right: 0.875rem;
            }

            span {
                font-size: 0.75rem;
                color: black;
                word-break: break-all;
                text-overflow: ellipsis;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;

                &.read {
                    color: #8395b4;
                }
            }
        }

        .table-time {
            display: flex;
            align-items: center;
            padding: 4px 0;
            // width: 7.6875rem;

            span {
                font-size: 0.75rem;
                color: black;
                word-break: break-all;
                text-overflow: ellipsis;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;

                &.read {
                    color: #8395b4;
                }
            }
        }
        .table-exam {
            display: flex;
            align-items: center;
            // width: 7.0625rem;

            span {
                font-size: 0.75rem;
                color: #277aff;
                word-break: break-all;
                text-overflow: ellipsis;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;

                // &.read {
                //     color: #8395b4;
                // }
            }
        }
        .table-operate {
            display: flex;
            align-items: center;
            // width: 6.25rem;
            visibility: hidden;
            padding: 4px 0;

            div {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0.48rem;
                box-sizing: content-box;
                margin: 0 0.5rem;
                &:hover {
                    background: #e5e9fa;
                    border-radius: 50%;
                }

                img {
                    width: 0.9rem;
                    height: auto;
                    box-sizing: content-box;
                }
            }
        }
    }
    .bottom {
        flex-shrink: 0;
        width: 100%;
        height: 3.25rem;
        display: flex;
        align-items: center;
        background: white;
        border-top: 1px solid #c6c6c6;
        padding: 0 1.375rem 0 1.0625rem;
        box-sizing: border-box;

        span {
            flex: 1;
            font-size: 0.75rem;
            color: #4d4f5c;
        }
    }

    .reloading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 28.125rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
