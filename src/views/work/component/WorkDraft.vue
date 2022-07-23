<template>
    <div class="work-draft">
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
                <el-table-column label="标题名称">
                    <template #default="scope">
                        <div class="table-name">
                            <span> {{ scope.row.name }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="保存时间" width="148">
                    <template #default="scope">
                        <div class="table-time">
                            <span> {{ scope.row.time }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="" width="122">
                    <template #default="scope">
                        <div class="table-operate">
                            <div :title="'删除'" @click.stop="deleteClick(scope.$index)">
                                <img :src="getAssetsFile('work/common/icon_delete.png')" />
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="bottom">
            <span>共{{ data.totalCount }}项</span>

            <el-pagination
                v-model:currentPage="data.pageIndex"
                v-model:page-size="data.pageSize"
                layout="sizes, prev, pager, next"
                :total="data.totalCount"
                @size-change="pageSizeChange"
                @current-change="pageIndexChange"
            />
        </div>
    </div>

    <el-dialog v-model="data.isDeleteShow" title="删除草稿" width="355px">
        <span>是否确定删除{{ temp.deleteItem.name }}？</span>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDelete" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="confirmDelete" :loading="data.isDeleteLoading" :icon="Check" style="width: 110px"
                    >确定</el-button
                >
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, toRaw } from 'vue'
import getAssetsFile from '../../../utils/pub-use'
import sendService from '../../../api/send'
import dateService from '../../../utils/date-service'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
defineProps(['category'])
const emits = defineEmits(['itemClick', 'deleteClick'])

const data = reactive({
    category: undefined,
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

    isDeleteShow: false,
    isDeleteLoading: false,
})
const temp = reactive({})
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
const deleteClick = (i) => {
    temp.deleteItem = data.list[i]
    data.isDeleteShow = true
}

const closeDelete = () => {
    data.isDeleteShow = false
}

const confirmDelete = () => {
    data.isDeleteLoading = true

    sendService
        .clean([{ id: temp.deleteItem.id }])
        .then((result) => {
            if (!result) {
                deleteError()
                return
            }
            setTimeout(() => {
                deleteSuccess()
            }, 50)
        })
        .catch((err) => {
            console.log(err)
            deleteError(err && err.msg)
        })
}

const deleteSuccess = () => {
    data.isDeleteShow = false
    data.isDeleteLoading = false
    console.log('deleteSuccess')
    ElMessage.success('已删除')
    //如果删除的是列表最后一条，却当前不在第一页，则刷新前一页的数据
    if (data.list.length == 1 && data.pageIndex > 1) {
        data.pageIndex -= 1
    }
    refresh()
}
const deleteError = (msg) => {
    // this.zwPopup.hideLoading()
    ElMessage.error(msg || '删除失败')
    data.isDeleteShow = false
    data.isDeleteLoading = false
    console.log('deleteError')
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

    let lambda = `item.getOrganization()=="${selectedOrganization.id}" &&item.getAccount()=="${account.account}"&&item.getScheduleInfo().getCategoryInfo().getCode()==\"${data.category}\"&&item.getSubmit()==false`

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
            time: dateService.format(item.timestamp, 'yyyy/MM/dd'),
        }
    })
}
defineExpose({
    reload,
})
</script>
<style lang="scss" scoped>
.work-draft {
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
