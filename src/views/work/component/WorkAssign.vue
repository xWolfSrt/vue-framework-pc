<template>
    <div class="container"></div>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const data = reactive({
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

    input: {},
    isAddGroupVisible: false,
    isAddGroupLoading: false,
})
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
<style lang="scss" scoped></style>
