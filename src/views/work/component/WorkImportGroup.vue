<template>
    <el-dialog v-model="data.isVisible" title="导入群组" width="438px" :before-close="handleCancel" :close-on-click-modal="false">
        <div class="modal">
            <div class="left">
                <div class="list" v-if="!data.noData">
                    <el-checkbox-group v-model="data.checkedList" @change="checkChange">
                        <el-checkbox class="item" v-for="item in data.list" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="empty" v-if="!data.isReloading && data.noData">
                    <el-empty description="暂无数据" :image-size="100" />
                </div>
                <div class="reloading" v-if="data.isReloading">
                    <img :src="getAssetsFile('icon_loading_circle.gif')" style="width: 1.875rem; height: 1.875rem" />
                </div>
            </div>
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleCancel" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="handleOk" :icon="Check" style="width: 110px">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'
import { Close, Check } from '@element-plus/icons-vue'
import getAssetsFile from '../../../utils/pub-use'
import dateService from '../../../utils/date-service'
import scopeService from '../../../api/scope'
const { proxy } = getCurrentInstance()
const props = defineProps(['visible'])

const emits = defineEmits(['confirmClick', 'cancelClick'])

const data = reactive({
    isVisible: false,
    isReloading: false,
    list: [],
    checkedList: [],
    noData: false,
})
watch(
    () => props.visible,
    (now, pre) => {
        data.isVisible = now
        console.log('change', now, pre)

        if (!now) {
            resetData()
        } else {
            // if (this.list.length == 0) {
            reload()
            // }
        }
    }
)

const resetData = () => {
    data.list.forEach((item) => {
        item.checked = false
    })
    data.checkedList = []
}
const handleOk = () => {
    let list = data.list.filter((item) => {
        return data.checkedList.some((checked) => {
            return item.id == checked
        })
    })
    let scope = disposeSelectedList(list)
    console.log(scope)
    emits('confirmClick', scope)
}

const handleCancel = () => {
    emits('cancelClick')
}
const disposeSelectedList = (list) => {
    let result
    if (list.length <= 0) {
        return result
    }
    // result = list[0].data.config
    let departments = []
    let employees = []
    let titles = []
    let memberships = []

    let mapDepartment = {}
    let mapEmployee = {}
    let mapTitle = {}
    let mapMembership = {}

    list.forEach((item) => {
        //scope 解析之后去重
        let config = item.data.config

        let scope = config && JSON.parse(config)
        let departments_ = scope.departments || []
        let employees_ = scope.employees || []
        let titles_ = scope.titles || []
        let memberships_ = scope.memberships || []

        departments_.forEach((department) => {
            if (!mapDepartment[department.id]) {
                departments.push(department)
                mapDepartment[department.id] = department.id
            }
        })

        employees_.forEach((employee) => {
            if (!mapEmployee[employee.id]) {
                employees.push(employee)
                mapEmployee[employee.id] = employee.id
            }
        })

        titles_.forEach((title) => {
            if (!mapTitle[title.id]) {
                titles.push(title)
                mapTitle[title.id] = title.id
            }
        })

        memberships_.forEach((membership) => {
            if (!mapDepartment[membership.id]) {
                memberships.push(membership)
                mapMembership[membership.id] = membership.id
            }
        })

        // console.log(scope)
    })
    result = {
        departments: departments,
        employees: employees,
        titles: titles,
        memberships: memberships,
    }
    // console.log(result)

    return JSON.stringify(result)
}
const checkChange = () => {}

const reload = () => {
    loadPeople()
}
const loadPeople = (isReloading = true) => {
    data.isReloading = true
    let account = proxy.$storage.get('currentAccount')
    let selectedOrganization = proxy.$storage.get('selectedOrganization')

    let lambda = `item.getOrganization()=="${selectedOrganization.id}" &&item.getAccount()=="${account.account}"`

    let pager = {
        start: isReloading ? 0 : data.list.length,
        limit: 50,
        filter: `sql->sql.where(item-> ${lambda})`,
        navigations: [],
        sorter: 'sql->sql.orderby(item->item.getAddTime(),false)',
    }

    scopeService
        .query(pager)
        .then((result) => {
            if (!result) {
                queryFinish(true)
                return
            }
            let count = result.count
            let value = result.list || []
            let newList = data.list
            if (isReloading) newList = []

            if (value.length > 0) Array.prototype.push.apply(newList, getList(value))

            data.list = newList
            if (newList.length >= count) {
                queryFinish()
            } else {
                loadPeople(false)
            }
        })
        .catch((err) => {
            queryFinish(true, err && err.msg)
        })
}

const getList = (value) => {
    return value.map((item) => {
        return {
            id: item.id,
            name: item.name,
            time: dateService.format(item.addTime, 'yyyy-MM-dd HH:mm'),
            data: item,
        }
    })
}
const queryFinish = (isError = false, errMsg) => {
    // setTimeout(() => {
    data.noData = data.list.length == 0
    checkChange()

    data.isReloading = false
    // }, 50)
}
</script>
<style lang="scss" scoped>
.modal {
    width: 100%;
    height: 16.5rem;
    display: flex;

    > div {
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
        box-sizing: border-box;

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

        &.left {
            position: relative;

            .list {
                display: flex;
                flex-direction: column;
                width: 100%;

                .item {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;

                    // label {
                    width: 100%;
                    color: #28292f;
                    font-size: 0.8125rem;
                    padding: 0.75rem 1.5625rem;
                    // box-sizing: border-box;
                    &:hover {
                        background: #edf0fa;
                    }
                    // }
                }

                .radio-item {
                    flex-shrink: 0;
                    width: 100%;
                    color: #28292f;
                    font-size: 0.8125rem;
                    padding: 0.75rem 1.5625rem;
                    box-sizing: border-box;
                    &:hover {
                        background: #edf0fa;
                    }
                }
            }
            .empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                flex: 1;
            }
            .reloading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 16.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>
