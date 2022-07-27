<template>
    <div class="container" v-loading="data.isReloading">
        <div class="left">
            <div class="chart-container">
                <div class="chart-header">
                    <div></div>
                    <span>统计信息</span>
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

                <!-- <el-button @click="testDebounce">防抖测试</el-button>
                <el-button @click="testThrottle">节流测试</el-button> -->
            </div>
        </div>
        <div class="right">
            <div class="right-header">
                <div></div>
                <span>待办事项</span>
                <span v-if="data.totalCount">（{{ data.totalCount }}）</span>
            </div>
            <div class="right-list" v-if="!data.noData">
                <div class="right-item" v-for="(item, index) in data.list" :key="index" @click="itemClick(index)">
                    <span>{{ item.category }}</span>
                    <div>
                        <span>{{ item.name }}</span>
                        <span>发布单位：{{ item.agent }}</span>
                        <span>发布日期：{{ item.time }}</span>
                        <span>查看</span>
                    </div>
                </div>
                <div class="reloading" v-if="data.isReloadingSchedule">
                    <img :src="getAssetsFile('icon_loading_circle.gif')" style="width: 1.875rem; height: 1.875rem" />
                </div>
                <div class="loadingMore" v-if="data.isLoadingMore">
                    <img :src="getAssetsFile('icon_loading_circle.gif')" />
                    <span>正在加载...</span>
                </div>
                <div class="nomore" v-if="data.isNoMoreShow">已无更多</div>
            </div>
            <div class="none" v-if="data.noData">
                <img :src="getAssetsFile('common/icon_data_empty.png')" />
                <span>暂无相关数据</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, reactive, getCurrentInstance, onMounted, onDeactivated, onActivated } from 'vue'
import getAssetsFile from '../../utils/pub-use'
import homeService from '../../api/home'
import sendService from '../../api/send'
import receiveService from '../../api/receive'
import dateService from '../../utils/date-service'
import { workStore } from '../../store/work-store'
import { cloneDeep, debounce, throttle } from 'lodash'
import globalService from '../../utils/global-service'
const { proxy } = getCurrentInstance()
const workService = workStore()

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
let isOnInit = false
const isActived = ref(false)
const setPageCallback = () => {
    console.log(proxy.$router)
    workService.setPageCallback(proxy.$router.currentRoute.value.path, {
        refresh: (result) => {
            console.log('WorkHome--PageCallback--refresh')
            reloadFull()
        },
    })

    // this.receiveService.addReadListener(this.router.url, {
    //     refresh: (result) => {
    //         console.log('WorkHome--addRead--refresh')
    //         this.reloadFull()
    //     },
    // })
}
onActivated(() => {
    console.log('WorkHome---onActivated')
    isActived.value = true

    if (!isOnInit) {
        isOnInit = true
    } else {
        onShow()
    }
})
onDeactivated(() => {
    console.log('WorkHome---onDeactivated')
    isActived.value = false
})
const onShow = () => {
    console.log('WorkHome---onShow---')
    // this.reloadFull()
    setPageCallback()
    refreshChart()
}

onMounted(() => {
    console.log('WorkHome---onMounted')
    setPageCallback()
    initChart([], [], [])
    reloadFull()
    // startChatWebSocket()
    addChartOnResizeListener()

    //-------call、apply、bind
    // let obj = {
    //     name: 'a',
    //     age: 1,
    //     scholl: '康康大学',
    //     sayHello: function (job, hobby) {
    //         console.log(`我在${this.scholl},我是${this.name},年龄${this.age},是个${job},爱好是${hobby},${this.min}`)
    //     },
    // }
    // obj.sayHello('程序员', '打篮球')

    // let obj1 = {
    //     name: 'b',
    //     age: 2,
    //     min: 10,
    // }
    // obj.sayHello.call(obj1, '建造师', '音乐')
    // let args = ['建造师', '音乐', 'aaaa']
    // obj.sayHello.apply(obj1, [...args])

    // let obj2 = '1111'
    // obj.sayHello.apply(obj2, [...args])

    // let fun = obj.sayHello.bind(obj1, '建造师222', '音乐222')
    // console.log(fun)
    // fun()

    //-------原型
    // function Animal(weight) {
    //     this.weight = weight
    // }
    // Animal.prototype.name = 'animal'
    // Animal.prototype.height = 10
    // var cat1 = new Animal()
    // var pinkCat = cat1
    // console.log(cat1)
    // console.log(pinkCat)

    // console.log('cat1.__proto__ === Animal.prototype', cat1.__proto__ === Animal.prototype)

    //-------Set
    // let a = [1, 1, 2, 2, 3, 4, 5, 6, 7, 7]
    // let arr = new Set(a)
    // console.log(arr)
    // console.log(Array.from(arr))

    //-------Map
    // let map = new Map()
    // map.set('name', 'wangdi')
    // map.set('say', () => {
    //     console.log('say~~~~~~~~~~~~`')
    // })
    // map.set(a, '一个数组')

    // console.log(map.get('name'))
    // console.log(map.get(a))
    // map.get('say')()
    // console.log(map.keys())
    // console.log(map.values())
    // console.log(map.entries())
    // map.forEach((item) => {
    //     console.log(item)
    // })

    //------- Object.assign
    // let ob1 = { a: 1 }
    // let ob2 = { b: 2, c: 3 }
    // let ob3 = {
    //     say: () => {
    //         console.log('ob3')
    //     },
    //     a: [1, 2, 3, 4],
    // }
    // Object.assign(ob1, ob2, ob3)
    // console.log(ob1)
    // ob1.say()
    // console.log(Object.entries(ob1))

    //-------深拷贝、浅拷贝
    // let ob1 = {
    //     a: 1,
    //     b: 2,
    //     C: {
    //         d: 3,
    //         e: 4,
    //         x: [1, 2, 3, 4, 5],
    //     },
    //     f: new Date(),
    //     g: () => {
    //         console.log('ob1 g')
    //     },
    // }
    // let ob2 = ob1
    // ob2.a = 2
    // ob2.C.d = 5
    // ob2.g()
    // console.log(ob1, ob2)

    // let ob2 = { ...ob1 }
    // ob2.a = 2
    // ob2.C.d = 5
    // ob2.g()
    // console.log(ob1, ob2)

    // let ob2 = Object.assign({}, ob1)
    // ob2.a = 2
    // ob2.C.d = 5
    // ob2.g()
    // console.log(ob1, ob2)

    // let ob2 = JSON.parse(JSON.stringify(ob1))
    // ob2.a = 2
    // ob2.C.d = 5
    // // ob2.g()
    // console.log(ob1, ob2)

    // let ob2 = cloneDeep(ob1)
    // ob2.a = 2
    // ob2.C.d = 5
    // ob2.g()
    // console.log(ob1, ob2)

    //-------break.continue
    // out: for (let i = 0; i < 10; i++) {
    //     for (let j = 0; j < 5; j++) {
    //         if (i == 3) {
    //             continue out
    //         }
    //         console.log(`${i}---${j}`)
    //     }
    //     if (i == 6) {
    //         break out
    //     }
    //     console.log(`${i}---【】`)
    // }
    // console.log(`---【】`)

    //-------for-in,for-of
    // let a = ['red', 'green', 'yellow']
    // let b = {
    //     name: 'red',
    //     age: 18,
    // }
    // let map = new Map()
    // map.set('student', 'abc')
    // map.set('school', 'def')

    // for (const key in a) {
    //     console.log(key, a[key])
    // }

    // for (const key in b) {
    //     console.log(key, b[key])
    // }

    // for (const iterator of a) {
    //     console.log(iterator)
    // }
    // for (const iterator of map) {
    //     let [i, j] = iterator
    //     console.log(iterator)
    //     console.log(i, j)
    // }

    // let stus = ['Sam', '22', '男']
    // stus.size = 3
    // Array.prototype.name = '1111'
    // for (let stu in stus) {
    //     console.log(stu)
    // }

    //-------iterator
    // let arr = 'study'
    // let arr = ['red', 'green', 'yellow']
    // let iterator = arr[Symbol.iterator]()
    // let done = false
    // while (!done) {
    //     let next = iterator.next()
    //     console.log(next)
    //     console.log(next.value)
    //     console.log(next.done)
    //     if (next.done) done = true
    // }
    //类数组对象，数值键名，length，部署Symbol.iterator 迭代生成函数
    // let obj = {
    //     0: 'a',
    //     1: 'b',
    //     2: 'c',
    //     length: 3,
    //     [Symbol.iterator]: Array.prototype[Symbol.iterator],
    // }
    // for (const iterator of obj) {
    //     console.log(iterator)
    // }

    // let set = new Set([1, 1, 2, 3, 4, 5, 5, 5, 6])
    // console.log(set)
    // let iterator = set[Symbol.iterator]()
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())
    // for (const iterator of set) {
    //     console.log(iterator)
    // }

    // let map = new Map()
    // map.set('student', 'abc')
    // map.set('school', 'def')
    // let iterator = map[Symbol.iterator]()
    // console.log(iterator.next())
    // console.log(iterator.next())
    // console.log(iterator.next())

    // 有一个数组，它的长度为1000，里边存放的是1-100之间的整数，如何实现统计里边每个数字出现的次数及其将它们按出现次数的多到少排序
    // let arr = new Array(100)
    // for (let index = 0; index < arr.length; index++) {
    //     arr[index] = globalService.getRndInteger(1, 100)
    // }
    // let map = new Map()
    // for (const iterator of arr) {
    //     if (map.has(iterator)) {
    //         let count = map.get(iterator) + 1
    //         map.set(iterator, count)
    //     } else {
    //         map.set(iterator, 1)
    //     }
    // }
    // let arr1 = Array.from(map)
    // arr1.sort((a, b) => {
    //     return b[1] - a[1]
    // })
    // console.log(arr)
    // console.log(map)
    // console.log(arr1)
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
    data.isReloading = true
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
    let _data = result.receiveUnsubmitPagerResult

    let count = _data && _data.count
    let value = (_data && _data.list) || []
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

    console.log(data.list)
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
        let _data = map[module.code]
        module.notify = (_data && _data.count > 0) || false
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
        data.isReloading = false
    }, 300)
}

const reloadSchedule = () => {
    temp.refreshMode = 2

    data.isReloadingSchedule = true
    temp.startNum = 0
    loadSchedule({ start: 0 })
}
const onReachBottom = () => {
    // 使用v-infinite-scroll时，会在keep-alive中报错
    console.log('onReachBottom')
    //正在加载更多且当前已达最大数量则不再加载
    if (data.isReloadingSchedule || data.isLoadingMore || data.list.length >= data.totalCount) return
    loadMoreSchedule()
}
const loadMoreSchedule = () => {
    temp.refreshMode = 3
    temp.startNum = data.list.length
    loadSchedule()
}
const loadSchedule = (config) => {
    let isReloading = config && config.start == 0

    //如果是重新加载且当前正在reload,则取消之前的请求
    // if (isReloading && this.isReloading && this.temp.requestTask) {
    //   this.temp.requestTask.abort();
    // }
    data.isReloadingSchedule = isReloading
    data.isLoadingMore = !isReloading
    if (isReloading) {
        // this.list = []
        data.isNoMoreShow = false
        data.totalCount = 0
        data.noData = false
    }

    let account = proxy.$storage.get('currentAccount')
    let selectedOrganization = proxy.$storage.get('selectedOrganization')

    let lambda = `!item.getSubmit()&&item.getCategoryInfo().getCode() != "ReceiveCategory_Membership" &&item.getOrganizationInfo().getId()=="${selectedOrganization.id}" &&item.getAccount()=="${account.account}"`

    let pager = {
        start: isReloading ? 0 : data.list.length,
        limit: 10,
        filter: `sql->sql.where(item-> ${lambda})`,
        navigations: ['sendInfo.scheduleInfo.categoryInfo'],
        sorter: 'sql->sql.orderby(item->item.getSendInfo().getTimestamp(),false)',
    }

    receiveService
        .queryList(pager)
        .then((result) => {
            if (!result) {
                queryFinish(true)
                return
            }
            let count = result.count
            let value = result.list || []
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
            queryFinish()
        })
        .catch((err) => {
            queryFinish(true, error)
        })
}
const queryFinish = (isError = false, errMsg) => {
    console.log('queryFinish', temp.refreshMode)
    switch (temp.refreshMode) {
        case 1:
        // if (isError) {
        //     this.zwLoading.showError()
        // } else {
        //     this.zwLoading.hide()
        // }
        case 2:
            data.isReloadingSchedule = false
            data.noData = !data.list || data.list.length == 0
            break
        case 3:
            data.isLoadingMore = false
            break
    }
}

let myChart
const initChart = (name, data1, data2) => {
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

const filterDayClick = (i) => {
    let item = data.filterDays[i]
    if (data.selectedDay.value == item.value) return
    data.filterDays.forEach((item, index) => {
        item.selected = i == index
    })
    data.selectedDay = JSON.parse(JSON.stringify(data.filterDays[i]))
    refresh()
}

const refresh = () => {
    sendService
        .listSendStatisticsView(data.selectedDay.value)
        .then((result) => {
            if (!result) {
                return
            }
            disposeStatisticsResult(result)
        })
        .catch((err) => {
            console.log(err)
        })
}

const disposeStatisticsResult = (result) => {
    disposeChartData(result)
}
const refreshChart = () => {
    myChart && myChart.resize()
    addChartOnResizeListener()
}

const addChartOnResizeListener = () => {
    setTimeout(() => {
        window.onresize = () => {
            myChart && myChart.resize()
        }
    }, 200)
}
const testThrottle = throttle(
    () => {
        console.log('test throttle')
    },
    2000,
    {
        leading: true,
        trailing: true,
    }
)
const testDebounce = debounce(
    () => {
        console.log('test debounce')
    },
    2000,
    {
        leading: true,
        trailing: false,
    }
)
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

                    // a {
                    //     font-size: 0.875rem;
                    //     color: #6c78af;
                    // }

                    // i {
                    //     color: #caccd8;
                    // }

                    .el-dropdown-link {
                        cursor: pointer;
                        color: var(--el-color-primary);
                        display: flex;
                        align-items: center;
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
