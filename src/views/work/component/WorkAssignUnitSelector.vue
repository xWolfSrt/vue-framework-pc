<template>
    <div class="work-assign-unit-dialog">
        <el-dialog
            custom-class="unit-dialog"
            v-model="data.isVisible"
            title="请选择本单位同事"
            width="750px"
            :before-close="handleCancel"
            :close-on-click-modal="false"
        >
            <div class="modal">
                <div class="left">
                    <div class="switch-container">
                        <div class="switch">
                            <div :class="{ selected: data.type == 1 }" @click="switchType(1)">按部门选择</div>
                            <div :class="{ selected: data.type == 2 }" @click="switchType(2)">按人员选择</div>
                        </div>
                    </div>
                    <div class="filter-container" v-if="!data.isReloading && data.type == 2">
                        <div class="filter">
                            <el-dropdown @command="filterPositionClick">
                                <span class="el-dropdown-link">
                                    {{ data.selectedPosition.name }}
                                    <el-icon class="el-icon--right">
                                        <arrow-down />
                                    </el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-for="(item, index) in data.filterPositions" :key="index" :command="index">{{
                                            item.name
                                        }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                    <div class="list" v-if="!noData">
                        <el-checkbox
                            class="item"
                            :indeterminate="data.indeterminate"
                            v-model="data.allChecked"
                            :disabled="!data.isReloadingFinish && data.type == 2"
                            @change="allChange"
                        >
                            全选 <span v-if="data.type == 2">（{{ data.allCount }}人）</span>
                            <img
                                :src="getAssetsFile('icon_loading_circle.gif')"
                                v-if="!data.isReloadingFinish && data.type == 2"
                                style="width: 16px; height: 16px"
                            />
                        </el-checkbox>

                        <el-checkbox class="item" v-for="item in data.list" :key="item.id" v-model="item.checked" @change="checkChange"
                            >{{ item.label }}<span v-if="type == 1">（{{ item.count || 0 }}人）</span></el-checkbox
                        >
                    </div>
                    <div class="empty" v-if="!data.isReloading && data.noData">
                        <el-empty description="暂无数据" :image-size="100" />
                    </div>
                    <div class="reloading" v-if="data.isReloading">
                        <img :src="getAssetsFile('icon_loading_circle.gif')" style="width: 1.875rem; height: 1.875rem" />
                    </div>
                </div>
                <div class="right">
                    <div class="search-container">
                        <div class="search">
                            <img :src="getAssetsFile('work/common/icon_search.png')" />
                            <input
                                id="content"
                                type="text"
                                maxlength="50"
                                placeholder="搜索"
                                placeholder-style="color:#C3C3C3"
                                v-model="data.input.content"
                                @change="searchChange()"
                                ref="content"
                            />
                            <img
                                :src="getAssetsFile('work/common/icon_input_clear.png')"
                                @click="clearSearch()"
                                v-if="data.input.content"
                            />
                        </div>
                    </div>
                    <div class="list">
                        <template v-for="(item, i) in data.listResult" :key="i">
                            <div class="item" v-if="item.checked">
                                <span>{{ item.label }}</span>
                                <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="removeOptionsOne(i)" />
                            </div>
                        </template>
                    </div>
                    <div class="search-result" v-if="data.input.content">
                        <div class="search-content">
                            <div class="search-title">搜索结果（{{ data.searchList.length }}）</div>
                            <div class="search-item" v-for="(item, i) in data.searchList" :key="i" @click="searchResultClick(i)">
                                <div>
                                    <span>{{ item.name }}</span>
                                    <span>{{ item.subtitle }}</span>
                                </div>
                                <span>{{ item.description }}</span>
                            </div>

                            <div class="empty" v-if="data.searchList.length == 0">
                                <span>未搜索到任何结果</span>
                            </div>
                        </div>
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
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'
import { Close, Check, ArrowDown } from '@element-plus/icons-vue'
import getAssetsFile from '../../../utils/pub-use'
import dateService from '../../../utils/date-service'
import memberService from '../../../api/member'
import scopeService from '../../../api/scope'
import { result } from 'lodash'
import globalService from '../../../utils/global-service'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
const props = defineProps(['visible'])

const emits = defineEmits(['confirmClick', 'cancelClick'])

const data = reactive({
    isVisible: false,
    type: 1,
    allChecked: false,
    allCount: 0,
    indeterminate: false,
    list: [],
    noData: false,

    input: {},
    searchList: [],
    listResult: [],

    listDepartment: [],
    listPeople: [],
    isReloading: false,
    isReloadingFinish: false,

    filterPositions: [{ id: '-1', name: '全部部门', selected: true }],
    selectedPosition: { id: '-1', name: '全部部门', selected: true },
})

watch(
    () => props.visible,
    (now, pre) => {
        data.isVisible = now
        console.log('change', now, pre)

        if (!now) {
            resetData()
        } else {
            if (data.listDepartment.length == 0) {
                reload()
            }
        }
    }
)

const resetData = () => {
    data.listDepartment.forEach((item) => {
        item.checked = false
    })
    data.listPeople.forEach((item) => {
        item.checked = false
    })
    data.filterPositions.forEach((item, i) => {
        item.selected = i == 0
    })
    data.selectedPosition = { id: '-1', name: '全部部门', selected: true }
    switchType(1)
}
const handleOk = () => {
    let list = data.listResult.filter((item) => {
        return item.checked
    })
    console.log(list)
    emits('confirmClick', list)
}

const handleCancel = () => {
    emits('cancelClick')
}

const switchType = (type) => {
    data.type = type
    let totalCount = 0
    switch (type) {
        case 1:
            data.list = data.listDepartment
            data.list.forEach((item) => {
                totalCount += item.count || 0
            })
            data.listResult = data.listDepartment
            break
        case 2:
            data.list = data.listPeople
            data.listResult = data.listPeople
            if (data.listPeople.length == 0) {
                loadPeople()
            }
            updatePeopleList()
            totalCount = data.list.length
            break
    }
    data.allCount = totalCount
    data.noData = data.list.length == 0
    checkChange()
    clearSearch()
}

const allChange = (event) => {
    console.log(event)
    data.indeterminate = false
    data.list.forEach((item) => {
        item.checked = data.allChecked
    })

    clearSearch()
}
const checkChange = () => {
    if (data.list.every((item) => !item.checked)) {
        data.allChecked = false
        data.indeterminate = false
    } else if (data.list.every((item) => item.checked)) {
        data.allChecked = true
        data.indeterminate = false
    } else {
        data.indeterminate = true
    }
    clearSearch()
}
const removeOptionsOne = (i) => {
    data.listResult[i].checked = false
    checkChange()
    clearSearch()
}
const searchChange = (event) => {
    if (data.isReloading) return
    let content = (event && globalService.trimStr(event)) || ''

    if (!content) {
        data.searchList = []
    } else {
        let list = []
        data.listResult.forEach((item) => {
            if (item.label.indexOf(content) != -1) {
                list.push({
                    id: item.id,
                    name: data.type == 1 ? item.name : `${item.name}`,
                    subtitle: data.type == 1 ? '' : item.account,
                    description: data.type == 1 ? `（${item.count}）` : `${item.department}`,
                })
            }
        })
        data.searchList = list
    }
}
const clearSearch = () => {
    data.input.content = ''
    searchChange('')
}
const searchResultClick = (i) => {
    let item = data.searchList[i]
    let change = false
    data.listResult.forEach((o) => {
        if (item.id == o.id && !o.checked) {
            o.checked = true
            change = true
        }
    })
    if (change) {
        checkChange()
        clearSearch()
    } else {
        ElMessage.warning(`${item.name}已选择`)
    }
}

const reload = () => {
    data.isReloading = true
    loadDepartment()
}
const loadDepartment = () => {
    memberService
        .queryEmployeeDepartmentList()
        .then((result) => {
            if (!result) {
                queryFinish(true)
                return
            }
            let value = result || []
            let newList = []
            if (value.length > 0) Array.prototype.push.apply(newList, getDepartmentList(value))

            data.listDepartment = newList
            queryFinish()
        })
        .catch((err) => {
            queryFinish(true, err && err.msg)
        })
}
const getDepartmentList = (value) => {
    let list = []
    value.forEach((item) => {
        if (item.departmentId) {
            list.push({
                id: item.departmentId,
                type: 'department',
                account: item.account,
                name: item.departmentName,
                label: item.departmentName,
                count: item.departmentEmployeeCount,
                description: `${item.departmentName}`,
                checked: false,
            })
        }
    })
    return list
}
const loadPeople = (isReloading = true) => {
    data.isReloading = true
    if (isReloading) {
        data.isReloadingFinish = false
    }
    let selectedOrganization = proxy.$storage.get('selectedOrganization')

    let lambda = `item.getEnable()&&item.getOrganization()=="${selectedOrganization.id}"`

    let pager = {
        start: isReloading ? 0 : data.listPeople.length,
        limit: 50,
        filter: `sql->sql.where(item-> ${lambda})`,
        navigations: [],
        sorter: 'sql->sql.orderby(item->item.getAccount(),true)',
    }

    memberService
        .queryEmployeeList(pager)
        .then((result) => {
            if (!result) {
                queryFinish(true)
                return
            }
            let count = result.count
            let value = result.list || []
            let newList = data.listPeople
            if (isReloading) newList = []

            if (value.length > 0) Array.prototype.push.apply(newList, getPeopleList(value))

            data.listPeople = newList
            if (newList.length >= count) {
                data.isReloadingFinish = true
                initFilterPositions()
                queryFinish()
            } else {
                loadPeople(false)
            }
        })
        .catch((err) => {
            queryFinish(true, err && err.msg)
        })
}

const getPeopleList = (value) => {
    return value.map((item) => {
        let department = (item.department && item.department.name) || ''
        let organization = (item.organization && item.organization.name) || ''
        return {
            id: item.id,
            type: 'unit',
            account: item.account,
            name: item.name,
            label: `${item.name}-${item.account}${department ? '（' + department + '）' : ''}`,
            phone: item.account,
            title: (item.position1 && item.position1.name) || '',
            departmentId: item.department && item.department.id,
            department: department,
            organization: organization,
            description: `${item.name}\n${department ? department + '\n' : ''}${item.account}`,
            checked: false,
        }
    })
}

const queryFinish = (isError = false, errMsg) => {
    // setTimeout(() => {
    // this.switchType(this.type)
    let totalCount = 0
    switch (data.type) {
        case 1:
            data.list = data.listDepartment
            data.list.forEach((item) => {
                totalCount += item.count || 0
            })
            data.listResult = data.listDepartment
            break
        case 2:
            data.list = data.listPeople
            data.listResult = data.listPeople
            totalCount = data.list.length
            break
    }
    data.allCount = totalCount
    data.noData = data.list.length == 0
    checkChange()
    clearSearch()

    data.isReloading = false
    if (isError) {
        data.isReloadingFinish = true
    }
    // }, 50)
}
const initFilterPositions = () => {
    let list = [{ id: '-1', name: '全部部门', selected: true }]
    data.listDepartment.forEach((item) => {
        list.push({
            id: item.id,
            name: item.name,
            selected: false,
        })
    })
    data.filterPositions = list
}

const filterPositionClick = (i) => {
    let item = data.filterPositions[i]
    if (data.selectedPosition.id == item.id) return
    data.filterPositions.forEach((item, index) => {
        item.selected = i == index
    })
    data.selectedPosition = JSON.parse(JSON.stringify(data.filterPositions[i]))
    // this.refresh()
    console.log(data.selectedPosition)

    updatePeopleList()
    data.allCount = data.list.length
    data.noData = data.list.length == 0
    checkChange()
    clearSearch()
}
const updatePeopleList = () => {
    if (!data.selectedPosition || data.selectedPosition.id == '-1') {
        data.list = data.listPeople
    } else {
        let id = data.selectedPosition.id
        data.list = data.listPeople.filter((item) => {
            return item.departmentId == id
        })
    }
}
</script>
<style lang="scss" scoped>
.work-assign-unit-dialog {
    :deep(.el-dialog.unit-dialog) {
        .el-dialog__body {
            padding: 0;
        }
    }
}
.modal {
    width: 100%;
    height: 34.125rem;
    display: flex;

    > div {
        width: 50%;
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
            border-right: 1px solid #d8d8d8;
            position: relative;

            .switch-container {
                flex-shrink: 0;
                display: flex;
                padding: 0.5625rem 0 0.9375rem;
                align-items: center;
                justify-content: center;

                .switch {
                    display: flex;
                    align-items: center;
                    border: 1px solid #b1bdf2;

                    div {
                        width: 5.75rem;
                        height: 1.875rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #6c78af;
                        font-size: 0.75rem;
                        background: white;
                        border-right: 1px solid #b1bdf2;
                        box-sizing: border-box;
                        cursor: pointer;
                        &:hover {
                            background: #f2f4ff;
                        }
                        &:active {
                            background: #e2e6f8;
                        }
                        &:last-of-type {
                            border-right: none;
                        }
                        &.selected {
                            color: white;
                            background: #5874e8;
                        }
                    }
                }
            }

            .filter-container {
                flex-shrink: 0;
                height: 2rem;
                background: #f9f9fc;
                display: flex;
                align-items: center;
                justify-content: center;

                .filter {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    a {
                        font-size: 0.75rem;
                        color: #8395b4;
                        min-width: 6.4rem;
                        text-align: center;
                    }

                    i {
                        color: #caccd8;
                    }
                }
            }
            .list {
                display: flex;
                flex-direction: column;
                width: 100%;

                .item {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;

                    // label {
                    color: #28292f;
                    font-size: 0.8125rem;
                    padding: 0.75rem 1.5625rem;
                    // box-sizing: border-box;
                    margin-right: 0;
                    &:hover {
                        background: #edf0fa;
                    }
                    // }
                    span {
                        flex-shrink: 0;
                        font-size: 0.75rem;
                        color: #6c78af;
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
                height: 28.125rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        &.right {
            // padding: 0.6875rem 1.3125rem;
            position: relative;

            .search-container {
                flex-shrink: 0;
                width: 100%;
                height: 3.375rem;
                padding: 0 1.3125rem;
                display: flex;
                align-items: center;
                box-sizing: border-box;

                .search {
                    padding: 0 0 0 0.5rem;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 2rem;
                    background: #ffffff;
                    border: 1px solid #dedede;
                    border-radius: 4px;

                    img:nth-of-type(1) {
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
                    img:nth-of-type(2) {
                        flex-shrink: 0;
                        width: 1rem;
                        height: 1rem;
                        padding: 0.25rem 0.75rem;
                        box-sizing: content-box;
                        cursor: pointer;
                    }
                }
            }
            .list {
                flex-shrink: 0;
                box-sizing: border-box;
                overflow: hidden;
                padding: 0 1.125rem;

                .item {
                    float: left;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    margin: 0.1875rem 0.25rem;
                    padding: 0.125rem;
                    background: #ecedf2;

                    span {
                        font-size: 0.75rem;
                        margin-left: 0.5rem;
                        color: #272f53;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                    }
                    img {
                        flex-shrink: 0;
                        margin-left: 0.125rem;
                        width: 0.4375rem;
                        height: 0.475rem;
                        box-sizing: content-box;
                        padding: 0.45rem;
                        cursor: pointer;
                    }
                }
            }
            .search-result {
                position: absolute;
                left: 1.3125rem;
                right: 1.3125rem;
                top: 3.0625rem;
                bottom: 0.6875rem;
                z-index: 1;
                display: flex;
                flex-direction: column;

                .search-content {
                    width: 100%;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16);
                    overflow-x: hidden;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;

                    .search-title {
                        flex-shrink: 0;
                        padding: 0.4375rem 1.5rem 0.625rem;
                        font-size: 0.75rem;
                        color: #6c78af;
                    }

                    .search-item {
                        flex-shrink: 0;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        padding: 1.0625rem 1.625rem;
                        box-sizing: border-box;
                        cursor: pointer;
                        &:hover {
                            background: #edf0fa;
                        }
                        div {
                            display: flex;
                            align-items: center;
                            span:nth-of-type(1) {
                                color: #272f53;
                                font-size: 0.875rem;
                                font-weight: bold;
                                word-break: break-all;

                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: -webkit-box;
                                -webkit-line-clamp: 1;
                                -webkit-box-orient: vertical;
                            }

                            span:nth-of-type(2) {
                                flex-shrink: 0;
                                color: #272f53;
                                font-size: 0.75rem;
                                margin-left: 0.625rem;
                            }
                        }

                        > span {
                            margin-top: 0.25rem;
                            color: #6c78af;
                            font-size: 0.75rem;
                        }
                    }

                    .empty {
                        flex-shrink: 0;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1.6875rem 0 2.3125rem;

                        span {
                            color: #bdc2d6;
                            font-size: 0.9375rem;
                        }
                    }
                }
            }
        }
    }
}
</style>
