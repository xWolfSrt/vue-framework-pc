<template>
    <div class="app-tabbar">
        <div class="user">
            <img :src="(data.account && data.account.photo) || getAssetsFile('common/profile_photo.png')" @click.stop="personal" />
        </div>
        <div class="app">
            <div v-for="(tab, index) in data.tabs" :key="index">
                <div
                    class="app-tabbar-item"
                    v-if="tab.enable"
                    :title="tab.name"
                    :class="{ selected: currentCode == tab.code }"
                    @click="tabClick(tab.code)"
                >
                    <img :src="currentCode == tab.code ? tab.icon.selected : tab.icon.common" />
                    <span :class="currentCode == tab.code ? 'selected' : ''">{{ tab.name }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="personal-mask" v-if="data.isPersonalShow" @click="hidePersonal"></div>
    <div class="personal" v-if="data.isPersonalShow">
        <div class="info">
            <img :src="(data.account && data.account.photo) || getAssetsFile('common/profile_photo.png')" />
            <div>
                <span>{{ data.account && data.account.name }}</span>
                <span>{{ data.department || '' }}</span>
            </div>
        </div>
        <div class="list">
            <!-- <div class="item" (click)="isPersonalShow = false">
            <span>设置</span>
            <img class="next" [src]="spa('common/icon_personal_arrow.png')" />
        </div>
        <div class="item" (click)="modifyPassword()">
            <span>修改密码</span>
            <img class="next" [src]="spa('common/icon_personal_arrow.png')" />
        </div>
        <div class="item" (click)="isPersonalShow = false">
            <span>帮助</span>
            <img class="next" [src]="spa('common/icon_personal_arrow.png')" />
        </div> -->
            <div class="item" @click="loginOut">
                <span>退出登录</span>
                <img class="next" :src="getAssetsFile('common/icon_personal_arrow.png')" />
            </div>
        </div>
    </div>

    <el-dialog v-model="data.isLoginOutShow" title="退出登录" width="355px">
        <span>是否确定退出登录？</span>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeLoginout" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="confirmLoginOut" :loading="data.isOkLoading" :icon="Check" style="width: 110px"
                    >确定</el-button
                >
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import getAssetsFile from '../utils/pub-use'
import tabbarService from '../utils/tabbar-service'
import userService from '../api/user'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance()

const currentCode = ref('')

const data = reactive({
    tabs: [],
    account: undefined,
    department: undefined,
    isPersonalShow: false,
    isLoginOutShow: false,
    isOkLoading: false,
})

defineProps(['code'])
const emits = defineEmits(['refresh'])
onMounted(() => {
    currentCode.value = proxy.$props.code
    initTabbar()

    data.account = proxy.$storage.get('currentAccount')
    let employee = proxy.$storage.get('employeeInfo')

    if (employee) {
        data.department = `${(employee.organization && employee.organization.name) || ''}${
            (employee.department && employee.department.name) || ''
        }`
    }
})
const initTabbar = () => {
    data.tabs = tabbarService.getList()
}
const personal = () => {
    if (!checkUserLogin()) {
        return
    }
    data.isPersonalShow = true
}
const hidePersonal = () => {
    data.isPersonalShow = false
}
const checkUserLogin = (replace) => {
    let account = proxy.$storage.get('currentAccount')
    if (account == null) {
        ElMessage.info('请先登录')
        proxy.$router[replace ? 'replace' : 'push']('/login')
        return false
    }
    return true
}

const tabClick = (code) => {
    console.log(code)
    if (code == currentCode.value) {
        emits && emits('refresh')
    } else {
        let path
        data.tabs.forEach((tab) => {
            if (code == tab.code) {
                path = tab.path

                //判断上一次选择的标签页，如果存在，则跳转到上一次的标签页，否则跳转到首页
                switch (code) {
                    case 'work':
                        path = getLastSelectedTab(this.workService.getTabs(), tab)
                        break
                    case 'business':
                        path = getLastSelectedTab(this.businessService.getTabs(), tab)
                        break
                    case 'manage':
                        path = getLastSelectedTab(this.manageService.getTabs(), tab)
                        break
                    default:
                        path = tab.path
                        break
                }
            }
        })
        console.log(path)
        path && proxy.$router.push(path)
    }
}

const getLastSelectedTab = (tabs, current) => {
    let tab
    tabs &&
        tabs.forEach((item) => {
            if (item.selected) {
                tab = JSON.parse(JSON.stringify(item))
            }
        })
    console.log('getLastSelectedTab', tab)

    return (tab && tab.page) || current.path
}

const loginOut = () => {
    data.isPersonalShow = false
    data.isLoginOutShow = true
}

const closeLoginout = () => {
    data.isLoginOutShow = false
}

const confirmLoginOut = () => {
    data.isOkLoading = true
    userService
        .logout()
        .then((result) => {
            if (!result) {
                ElMessage.error('退出登录失败')
                data.isOkLoading = false
                data.isLoginOutShow = false
                return
            }
            ElMessage.success('已退出登录')
            disposeLoginOut()
            setTimeout(() => {
                data.isOkLoading = false
                data.isLoginOutShow = false
                proxy.$router.replace('/login')
            }, 500)
        })
        .catch((err) => {
            console.log(err)
            ElMessage.error(err.msg || '退出登录失败')
            hideLoading()
        })
}
const disposeLoginOut = () => {
    //清除登录信息
    proxy.$storage.remove('token')
    proxy.$storage.remove('currentAccount')
}
</script>
<style lang="scss" scoped>
@import '../common/styles/variable/index.scss';

.app-tabbar {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 998; //toastService z-index=1000
    width: $workLeftBarWeight;
    height: 100%;
    // box-shadow: 0px -5px 16px 0px rgba(65, 65, 65, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #282c34;

    .user {
        flex-shrink: 0;
        margin: 2.5rem 0 1.5rem;
        cursor: pointer;

        img:nth-of-type(1) {
            flex-shrink: 0;
            width: 2.875rem;
            height: 2.875rem;
            border-radius: 2.875rem;
            background: white;
            overflow: hidden;
            object-fit: cover;
        }
    }
    .app {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;

        > div {
            display: flex;
            flex-shrink: 0;
            width: 100%;
        }
        .app-tabbar-item {
            flex-shrink: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0.5625rem 0;
            padding: 0.4375rem 0;
            cursor: pointer;

            &.selected {
                background: #5874e8;
            }

            img {
                width: 2.5rem;
                height: 2.5rem;
            }

            span {
                color: #6c78af;
                font-size: 0.8125rem;
                &.selected {
                    color: white;
                }
            }
        }
    }
}

.personal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    opacity: 0;
    background: #000000;
}

.personal {
    position: fixed;
    top: 2.875rem;
    left: calc(#{$workLeftBarWeight} + 0.875rem);
    z-index: 1001;
    width: 14.5rem;

    display: flex;
    flex-direction: column;
    background: white;
    padding: 0.625rem 1.25rem;
    box-sizing: border-box;

    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16);

    animation: show-loading 0.2s ease;
    -moz-animation: show-loading 0.2s ease-in;
    -webkit-animation: show-loading 0.2s ease;

    .info {
        width: 100%;
        display: flex;
        padding: 1rem 0;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(220, 220, 220, 0.4);

        img {
            flex-shrink: 0;
            width: 2.875rem;
            height: 2.875rem;
            border-radius: 2.875rem;
            background: white;
            overflow: hidden;
            object-fit: cover;
            margin-right: 0.875rem;
        }
        div {
            display: flex;
            flex-direction: column;

            span:nth-of-type(1) {
                font-size: 1rem;
                color: #272f53;
                font-weight: bold;
            }

            span:nth-of-type(2) {
                margin-top: 0.25rem;
                font-size: 0.75rem;
                color: #8395b4;
            }
        }
    }
    .item {
        flex-shrink: 0;
        height: 2.25rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid rgba(220, 220, 220, 0.4);
        cursor: pointer;

        &:active {
            background-color: #f9f9f9;
        }
        &:last-child {
            border-bottom: 0;
        }

        span {
            font-size: 0.75rem;
            flex: 1;
            color: #272f53;
            margin-right: 0.5rem;
        }

        img {
            flex-shrink: 0;
            width: 0.375rem;
            height: auto;
        }
    }
}

@keyframes show-loading {
    0% {
        transform: translateZ(0) scale(0.5);
        opacity: 0.5;
    }

    100% {
        transform: translateZ(0) scale(1);
        opacity: 1;
    }
}
</style>
