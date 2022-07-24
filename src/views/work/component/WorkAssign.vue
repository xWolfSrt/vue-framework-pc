<template>
    <div class="work-assign">
        <div class="content" :class="{ short: !data.hideImport }">
            <div class="part-container left">
                <div class="part vip">
                    <div class="head" @click="expendClick('vip')">
                        <span>非团体会员</span>
                        <span>（{{ data.list.vip.length }}）</span>
                        <div>
                            <span>{{ data.expend.vip ? '收起' : '展开' }}</span>
                            <img
                                :src="getAssetsFile(data.expend.vip ? 'work/common/icon_expend_on.png' : 'work/common/icon_expend_off.png')"
                            />
                        </div>
                    </div>
                    <div class="list" v-if="data.expend.vip">
                        <template v-for="(item, i) in data.list.vip" :key="i">
                            <el-tooltip class="box-item" effect="dark" placement="bottom">
                                <template #content>
                                    <span style="white-space: pre-wrap; word-break: break-all">{{ item.description }}</span>
                                </template>
                                <div class="item">
                                    <span>{{ item.name }}</span>
                                    <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('vip', i)" />
                                </div>
                            </el-tooltip>
                        </template>
                    </div>
                    <div class="split"></div>
                    <div class="add" @click="add('vip')">
                        <div>
                            <img :src="getAssetsFile('work/common/icon_add_people.png')" />
                            <span>添加非团体会员</span>
                        </div>
                    </div>
                </div>
                <div class="part unit">
                    <div class="head" @click="expendClick('unit')">
                        <span>本单位同事</span>
                        <span>（{{ data.list.unit.length }}）</span>
                        <div>
                            <span>{{ data.expend.unit ? '收起' : '展开' }}</span>
                            <img
                                :src="
                                    getAssetsFile(data.expend.unit ? 'work/common/icon_expend_on.png' : 'work/common/icon_expend_off.png')
                                "
                            />
                        </div>
                    </div>
                    <div class="list" v-if="data.expend.unit">
                        <!-- <div class="item" v-for="(item, i) in data.list.unit" :attr.data-tip="item.description">
                            <span>{{ item.name }}</span>
                            <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('unit', i)" />
                        </div> -->

                        <template v-for="(item, i) in data.list.unit" :key="i">
                            <el-tooltip class="box-item" effect="dark" placement="bottom">
                                <template #content>
                                    <span style="white-space: pre-wrap; word-break: break-all">{{ item.description }}</span>
                                </template>
                                <div class="item">
                                    <span>{{ item.name }}</span>
                                    <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('unit', i)" />
                                </div>
                            </el-tooltip>
                        </template>
                    </div>
                    <div class="split"></div>
                    <div class="add" @click="add('unit')">
                        <div>
                            <img :src="getAssetsFile('work/common/icon_add_people.png')" />
                            <span>添加本单位同事</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="part-container right">
                <div class="part gsl">
                    <div class="head" @click="expendClick('gsl')">
                        <span>工商联联络人</span>
                        <span>（{{ data.list.gsl.length }}）</span>
                        <div>
                            <span>{{ data.expend.gsl ? '收起' : '展开' }}</span>
                            <img
                                :src="getAssetsFile(data.expend.gsl ? 'work/common/icon_expend_on.png' : 'work/common/icon_expend_off.png')"
                            />
                        </div>
                    </div>
                    <div class="list" v-if="data.expend.gsl">
                        <!-- <div class="item" v-for="(item, i) in data.list.gsl" :attr.data-tip="item.description">
                            <span>{{ item.name }}</span>
                            <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('gsl', i)" />
                        </div> -->
                        <template v-for="(item, i) in data.list.gsl" :key="i">
                            <el-tooltip class="box-item" effect="dark" placement="bottom">
                                <template #content>
                                    <span style="white-space: pre-wrap; word-break: break-all">{{ item.description }}</span>
                                </template>
                                <div class="item">
                                    <span>{{ item.name }}</span>
                                    <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('gsl', i)" />
                                </div>
                            </el-tooltip>
                        </template>
                    </div>
                    <div class="split"></div>
                    <div class="add" @click="add('gsl')">
                        <div>
                            <img :src="getAssetsFile('work/common/icon_add_people.png')" />
                            <span>添加工商联联络人</span>
                        </div>
                    </div>
                </div>
                <div class="part sh">
                    <div class="head" @click="expendClick('sh')">
                        <span>商协会联络人</span>
                        <span>（{{ data.list.sh.length }}）</span>
                        <div>
                            <span>{{ data.expend.sh ? '收起' : '展开' }}</span>
                            <img
                                :src="getAssetsFile(data.expend.sh ? 'work/common/icon_expend_on.png' : 'work/common/icon_expend_off.png')"
                            />
                        </div>
                    </div>
                    <div class="list" v-if="data.expend.sh">
                        <!-- <div class="item" v-for="(item, i) in data.list.sh" :attr.data-tip="item.description">
                            <span>{{ item.name }}</span>
                            <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('sh', i)" />
                        </div> -->

                        <template v-for="(item, i) in data.list.sh" :key="i">
                            <el-tooltip class="box-item" effect="dark" placement="bottom">
                                <template #content>
                                    <span style="white-space: pre-wrap; word-break: break-all">{{ item.description }}</span>
                                </template>
                                <div class="item">
                                    <span>{{ item.name }}</span>
                                    <img :src="getAssetsFile('work/common/icon_remove_people.png')" @click="remove('sh', i)" />
                                </div>
                            </el-tooltip>
                        </template>
                    </div>
                    <div class="split"></div>
                    <div class="add" @click="add('sh')">
                        <div>
                            <img :src="getAssetsFile('work/common/icon_add_people.png')" />
                            <span>添加商协会联络人</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="import" @click="importGroupClick" v-if="!data.hideImport">
                <span>导入群组</span>
            </div>
            <div class="import" @click="saveGroupClick" v-if="!data.hideImport">
                <span>保存群组</span>
            </div>
            <div class="import" @click="clearClick">
                <span>清空已选列表</span>
            </div>
        </div>
    </div>
    <WorkAssignUnitSelector
        :visible="data.isUnitVisible"
        @cancel-click="cancelClick('unit')"
        @confirm-click="confirmClick($event, 'unit')"
    ></WorkAssignUnitSelector>
    <WorkImportGroup
        :visible="data.isImportGroupVisible"
        @cancel-click="cancelImportGroupClick"
        @confirm-click="confirmImportGroupClick"
    ></WorkImportGroup>
    <WorkSaveGroup :visible="data.isAddGroupVisible" :content="data.addGroupContent" @close-click="closeAddGroup"></WorkSaveGroup>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import getAssetsFile from '../../../utils/pub-use'
import WorkImportGroup from './WorkImportGroup.vue'
import WorkSaveGroup from './WorkSaveGroup.vue'
import WorkAssignUnitSelector from './WorkAssignUnitSelector.vue'
const { proxy } = getCurrentInstance()
defineProps(['captcha', 'directory'])
const data = reactive({
    hideImport: false,
    list: {
        unit: [],
        vip: [],
        sh: [],
        gsl: [],
    },
    expend: {
        unit: true,
        vip: true,
        sh: true,
        gsl: true,
    },

    isUnitVisible: false,
    isVipVisible: false,
    isShVisible: false,
    isGslVisible: false,

    isImportGroupVisible: false,
    isAddGroupVisible: false,
    addGroupContent: undefined,
})

onMounted(() => {
    data.hideImport = proxy.$props.hideImport || false
})

const expendClick = (type) => {
    data.expend[type] = !data.expend[type]
}

const remove = (type, i) => {
    data.list[type].splice(i, 1)
}

const add = (type) => {
    switch (type) {
        case 'unit':
            data.isUnitVisible = true
            break
        case 'vip':
            data.isVipVisible = true
            break
        case 'sh':
            data.isShVisible = true
            break
        case 'gsl':
            data.isGslVisible = true
            break
    }
}

const confirmClick = (list, type) => {
    switch (type) {
        case 'unit':
            list &&
                list.forEach((item) => {
                    data.list.unit.push({
                        id: item.id,
                        type: item.type,
                        name: item.name,
                        description: item.description,
                        account: item.account,
                        department: item.department,
                        organization: item.organization,
                        company: item.company,
                    })
                })
            break
        case 'vip':
            list &&
                list.forEach((item) => {
                    data.list.vip.push({
                        id: item.id,
                        type: item.type,
                        name: item.name,
                        description: item.description,
                        account: item.account,
                        department: item.department,
                        organization: item.organization,
                        company: item.company,
                    })
                })
            break
        case 'sh':
            list &&
                list.forEach((item) => {
                    data.list.sh.push({
                        id: item.id,
                        type: item.type,
                        name: item.name,
                        description: item.description,
                        account: item.account,
                        department: item.department,
                        organization: item.organization,
                        company: item.company,
                    })
                })
            break
        case 'gsl':
            list &&
                list.forEach((item) => {
                    data.list.gsl.push({
                        id: item.id,
                        type: item.type,
                        name: item.name,
                        description: item.description,
                        account: item.account,
                        department: item.department,
                        organization: item.organization,
                        company: item.company,
                    })
                })
            break
    }
    cancelClick(type)
}
const cancelClick = (type) => {
    switch (type) {
        case 'unit':
            data.isUnitVisible = false
            break
        case 'vip':
            data.isVipVisible = false
            break
        case 'sh':
            data.isShVisible = false
            break
        case 'gsl':
            data.isGslVisible = false
            break
    }
}

const importGroupClick = () => {
    data.isImportGroupVisible = true
}
const confirmImportGroupClick = (event) => {
    setContent(event)
    cancelImportGroupClick()
}
const cancelImportGroupClick = () => {
    data.isImportGroupVisible = false
}

const saveGroupClick = () => {
    let scope = getContent(true)
    if (!scope) return
    data.addGroupContent = scope
    data.isAddGroupVisible = true
}
const closeAddGroup = () => {
    data.isAddGroupVisible = false
}

const clearClick = () => {
    data.list.unit = []
    data.list.vip = []
    data.list.sh = []
    data.list.gsl = []
}
const setContent = (scope) => {
    if (!scope) return

    scope = JSON.parse(scope)

    let departments = scope.departments || []
    let employees = scope.employees || []
    let titles = scope.titles || []
    let memberships = scope.memberships || []

    let unit = []
    let vip = []
    let sh = []
    let gsl = []

    departments.forEach((item) => {
        if (item.type == 'department') {
            unit.push({
                id: item.id,
                type: item.type,
                name: item.name,
                description: `${item.name}`,
            })
        }
    })
    employees.forEach((item) => {
        if (item.type == 'unit') {
            unit.push({
                id: item.id,
                type: item.type,
                name: item.name,
                account: item.account,
                organization: item.organization,
                department: item.department,
                description: `${item.name}\n${item.department ? item.department + '\n' : ''}${item.account}`,
            })
        }

        if (item.type == 'sh') {
            sh.push({
                id: item.id,
                type: item.type,
                name: item.name,
                account: item.account,
                organization: item.organization,
                department: item.department,
                description: `${item.name}\n${item.organization ? item.organization + '\n' : ''}${item.account}`,
            })
        }
        if (item.type == 'gsl') {
            gsl.push({
                id: item.id,
                type: item.type,
                name: item.name,
                account: item.account,
                organization: item.organization,
                department: item.department,
                description: `${item.name}\n${item.organization ? item.organization + '\n' : ''}${item.account}`,
            })
        }
    })
    titles.forEach((item) => {
        if (item.type == 'title') {
            vip.push({
                id: item.id,
                type: item.type,
                name: item.name,
                description: `${item.name}`,
            })
        }
    })
    memberships.forEach((item) => {
        if (item.type == 'membership') {
            vip.push({
                id: item.id,
                type: item.type,
                name: item.name,
                account: item.account,
                company: item.company,
                description: `${item.name}\n${item.company ? item.company + '\n' : ''}${item.account}`,
            })
        }
    })
    data.list.unit = unit
    data.list.vip = vip
    data.list.sh = sh
    data.list.gsl = gsl
}
const getContent = (checkEmpty) => {
    let unit = data.list.unit
    let vip = data.list.vip
    let sh = data.list.sh
    let gsl = data.list.gsl

    if (checkEmpty && unit.length == 0 && vip.length == 0 && sh.length == 0 && gsl.length == 0) {
        // this.zwPopup.toast('请选择指派人员')
        ElMessage.error('请选择指派人员')
        return
    }
    let departments = []
    let employees = []
    let titles = []
    let memberships = []

    unit.forEach((item) => {
        if (item.type == 'department') {
            departments.push({
                id: item.id,
                type: item.type,
                name: item.name,
            })
        }
        if (item.type == 'unit') {
            employees.push({
                id: item.id,
                type: item.type,
                name: item.name,
                account: item.account,
                organization: item.organization,
                department: item.department,
            })
        }
    })
    vip.forEach((item) => {
        if (item.type == 'title') {
            titles.push({
                id: item.id,
                type: item.type,
                name: item.name,
            })
        }
        if (item.type == 'membership') {
            memberships.push({
                id: item.id,
                type: item.type,
                name: item.name,
                account: item.account,
                company: item.company,
            })
        }
    })

    sh.forEach((item) => {
        employees.push({
            id: item.id,
            type: item.type,
            name: item.name,
            account: item.account,
            organization: item.organization,
            department: item.department,
        })
    })

    gsl.forEach((item) => {
        employees.push({
            id: item.id,
            type: item.type,
            name: item.name,
            account: item.account,
            organization: item.organization,
            department: item.department,
        })
    })

    let scope = {
        departments: departments,
        employees: employees,
        titles: titles,
        memberships: memberships,
    }
    return JSON.stringify(scope)
}
defineExpose({
    setContent,
    getContent,
})
</script>
<style lang="scss" scoped>
.work-assign {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .content {
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        display: flex;

        &.short {
            height: calc(100% - 2.375rem);
        }
    }
    .bottom {
        flex-shrink: 0;
        width: 100%;
        height: 2.375rem;
        background: #f7f8fa;
        border-top: 1px solid #dfe8f7;
        padding: 0 1.6875rem;
        box-sizing: border-box;
        align-items: center;
        display: flex;

        .import {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 1.6875rem;
            background: #ffffff;
            border: 1px solid #b1bdf2;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 1rem;
            padding: 0 0.8125rem;
            box-sizing: border-box;

            &:hover {
                background: #f2f4ff;
            }
            &:active {
                background: #e2e6f8;
            }
            span {
                color: #5874e8;
                font-size: 0.75rem;
            }
        }
    }
    .part-container {
        width: 50%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0.75rem 1.5rem;
        &.left {
            border-right: 1px solid #d8d8d8;
        }
        .part {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 0.3125rem 0;

            .head {
                width: 100%;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                background: #f5f6f7;
                margin-bottom: 0.4375rem;
                cursor: pointer;

                > span:nth-of-type(1) {
                    flex-shrink: 0;
                    font-size: 0.75rem;
                    color: #272f53;
                    font-weight: bold;
                    margin-left: 1.125rem;
                }
                > span:nth-of-type(2) {
                    flex: 1;
                    font-size: 0.75rem;
                    color: #272f53;
                    margin-left: 0.25rem;
                }

                div {
                    flex-shrink: 0;
                    display: flex;
                    padding: 0.4375rem 0.9375rem;
                    box-sizing: border-box;
                    align-items: center;

                    span {
                        font-size: 0.75rem;
                        color: #8395b4;
                    }
                    img {
                        margin-left: 0.4375rem;
                        width: 0.75rem;
                        height: 0.375rem;
                    }
                }
            }

            .list {
                box-sizing: border-box;
                // overflow: hidden;
                padding: 0 0.8125rem;

                .item {
                    float: left;
                    box-sizing: border-box;
                    border: 1px solid #b1bdf2;
                    display: flex;
                    align-items: center;
                    margin: 0.1875rem 0.25rem;
                    padding: 0.125rem;

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

            .split {
                margin-top: 0.4375rem;
                width: 100%;
                height: 0.125rem;
                border-bottom: 1px dashed #b1bdf2;
            }
            .add {
                margin-top: 0.375rem;
                display: flex;
                align-items: center;
                justify-content: center;

                div {
                    display: flex;
                    align-items: center;
                    height: 1.625rem;
                    justify-content: center;
                    // border: 1px solid #5874e8;
                    padding: 0 1rem;
                    cursor: pointer;

                    &:hover {
                        background: #f9f9f9;
                    }
                    &:active {
                        background: #f9f9f9;
                    }

                    img {
                        width: 0.625rem;
                        height: 0.625rem;
                    }
                    span {
                        font-size: 0.75rem;
                        color: #5874e8;
                        margin-left: 0.25rem;
                    }
                }
            }
        }
    }
}

.modal-add-group {
    width: 100%;
    height: 9rem;
    display: flex;
    align-items: flex-start;
    padding: 1.875rem 1.5rem;
    box-sizing: border-box;
}
</style>
