<template>
    <!-- <Navbar :canback="hideBack" :bg="'transparent'" :dark="false" @navbarBack="navbarBack"></Navbar> -->
    <div class="container">
        <div class="bg">
            <img :src="getAssetsFile('login/bg.png')" />
        </div>

        <div class="content">
            <div class="title">
                <span>赣商动力商联协同管理系统</span>
            </div>

            <div class="center">
                <div class="phone-login">
                    <span>手机号码登录</span>

                    <div class="input-content">
                        <label class="phone input-group" :class="mobileFocus ? 'focus' : ''" for="phone">
                            <input
                                v-model="phone"
                                id="phone"
                                type="tel"
                                oninput="if(value.length>11)value=value.slice(0,11)"
                                placeholder="请输入手机号码"
                                v-on:focus="focusInput('mobile', true)"
                                v-on:blur="focusInput('mobile', false)"
                            />
                        </label>
                        <div class="captcha-container">
                            <label class="captcha input-group" :class="captchaFocus ? 'focus' : ''" for="captcha">
                                <input
                                    v-model="captcha"
                                    id="captcha"
                                    type="tel"
                                    oninput="if(value.length>4)value=value.slice(0,4)"
                                    placeholder="请输入验证码"
                                    v-on:focus="focusInput('captcha', true)"
                                    v-on:blur="focusInput('captcha', false)"
                                />
                            </label>
                            <div class="captcha-btn" :class="{ disabled: captchaConfig.counting }" @click.prevent="getCaptcha">
                                <span v-show="!captchaConfig.counting">获取验证码</span>
                                <div v-show="captchaConfig.counting">重发({{ countDownText }}s)</div>
                            </div>
                        </div>

                        <div class="auto-login">
                            <img
                                @click="autoLoginClick"
                                :src="isAutoLogin ? getAssetsFile('login/icon_check_on.png') : getAssetsFile('login/icon_check_off.png')"
                            />
                            <span @click="autoLoginClick">自动登录</span>
                        </div>
                        <button class="next btn btn-lg btn-gradient" @click="login">登录</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import getAssetsFile from '../utils/pub-use'
import userService from '../api/user'
import organizationService from '../api/organization'
import Navbar from '../components/Navbar.vue'

const { proxy } = getCurrentInstance()

let hideBack = false
let is401 = false
let toHome = false

const phone = ref('')
const captcha = ref('')
const captchaConfig = reactive({
    sending: false,
    counting: false,
    disabled: false,
})

const mobileFocus = ref(false)
const captchaFocus = ref(false)
const isAutoLogin = ref(false)

let timer
const countDownText = ref(0)

defineProps({})
onMounted(() => {
    console.log(proxy)
    console.log(proxy.$router.currentRoute)
    console.log(proxy.$router.currentRoute.value.query)
    try {
        let params = proxy.$router.currentRoute.value.query
        if (params.needBack == 'false') hideBack = true
        if (params.is401 == 'true') is401 = true
        if (params.toHome == 'true') toHome = true
    } catch (error) {
        console.log(error)
    }

    proxy.$storage.remove('token')
    proxy.$storage.remove('currentAccount')
    if (is401) {
        ElMessage.error('登录已过期')
    }

    let lastLoginPhone = proxy.$storage.get('lastLoginPhone')
    if (lastLoginPhone) {
        phone.value = lastLoginPhone
    }

    let autoLogin = proxy.$storage.get('isAutoLogin')

    if (autoLogin != undefined || (autoLogin && autoLogin != 'undefined')) {
        isAutoLogin.value = autoLogin
    }
})

const navbarBack = () => {
    history.back()
}
function focusInput(type, focus) {
    if (type == 'mobile') mobileFocus.value = focus
    else captchaFocus.value = focus
    console.log('focusInput')
}
const autoLoginClick = () => {
    isAutoLogin.value = !isAutoLogin.value
}
function getCaptcha() {
    if (captchaConfig.sending || captchaConfig.counting) return
    if (!phone.value) {
        ElMessage.error('手机号码不能为空')
        return
    }

    if (!/^1\d{10}$/.test(phone.value)) {
        ElMessage.error('请输入11位的手机号码')
        return
    }
    showLoading('正在发送...')
    captchaConfig.sending = true

    userService
        .sendCaptcha(phone.value)
        .then((result) => {
            console.log(result)
            switch (result.status) {
                case 200:
                    sendCaptchaSuccess()
                    break
                default:
                    captchaConfig.sending = false
                    registerError('验证码发送失败')
                    break
            }
        })
        .catch((err) => {
            console.log(err)
            captchaConfig.sending = false
            registerError()
        })
}
function sendCaptchaSuccess() {
    hideLoading()
    ElMessage.success('验证码已发送')
    captchaConfig.sending = false
    countDownStart()
}
function countDownStart() {
    captchaConfig.counting = true
    countDownText.value = 60
    timer = setInterval(() => {
        countDownText.value--
        console.log(countDownText.value)
        if (countDownText.value === 0) {
            countDownStop()
            captchaConfig.counting = false
        }
    }, 1000)
}
function countDownStop() {
    clearInterval(timer)
}
function login() {
    if (!phone.value) {
        ElMessage.error('手机号码不能为空')
        return
    }
    if (!/^1\d{10}$/.test(phone.value)) {
        ElMessage.error('请输入11位的手机号码')
        return
    }
    if (!captcha.value) {
        ElMessage.error('请输入验证码')
        return
    }
    if (!/^1\d{10}$/.test(phone.value)) {
        ElMessage.error('请输入11位的手机号码')
        return
    }
    showLoading('正在登录')
    // userService
    //     .validateCaptcha(phone.value, captcha.value)
    //     .then((result) => {
    //         console.log(result)

    //         if (result) {
    //             console.log('验证成功', result)
    //             phoneRegisterOrLogin()
    //         } else {
    //             hideLoading()
    //             ElMessage.error('验证码不正确或已过期')
    //         }
    //     })
    //     .catch(({ msg, code }) => {
    //         console.log(msg)
    //         registerError(msg)
    //     })

    userService
        .validateCaptcha(phone.value, captcha.value)
        .then((result) => {
            console.log(result)
            if (result) {
                console.log('验证成功', result)
                return userService.registerOrLogin(phone.value, captcha.value)
            } else {
                hideLoading()
                ElMessage.error('验证码不正确或已过期')
            }
        })
        .then((result) => {
            console.log(result)
            // let token = result
            // proxy.$storage.set('token', token)
            proxy.$storage.set('lastLoginPhone', phone.value)
            return userService.getAccountSummary()
        })
        .then((result) => {
            if (result) {
                let account = userService.convertAccount(result)
                proxy.$storage.set('currentAccount', account)
                return organizationService.queryList()
            } else {
                registerError()
            }
        })
        .then((result) => {
            if (!result || result.length == 0) {
                ElMessage.error('暂未加入组织')
                // this.hideLoading()
            } else {
                console.log(result)
                registerSuccess()
            }
        })
        .catch(({ msg, code }) => {
            console.log(msg)
            registerError(msg)
        })
}
function phoneRegisterOrLogin() {
    userService
        .registerOrLogin(phone.value, captcha.value)
        .then((result) => {
            console.log(result)
            // let token = result
            // proxy.$storage.set('token', token)
            proxy.$storage.set('lastLoginPhone', phone.value)
            getAccount()
        })
        .catch((err) => {
            console.log(err)
            registerError()
        })
}
function getAccount() {
    userService
        .getAccountSummary()
        .then((result) => {
            if (result) {
                let account = userService.convertAccount(result)
                proxy.$storage.set('currentAccount', account)
                getOrganizationList()
            } else {
                registerError()
            }
        })
        .catch((err) => {
            console.log(err)
            registerError()
        })
}

function getOrganizationList() {
    organizationService
        .queryList()
        .then((result) => {
            if (!result || result.length == 0) {
                ElMessage.error('暂未加入组织')
                // this.hideLoading()
            } else {
                console.log(result)
                registerSuccess()
            }
        })
        .catch((err) => {
            console.log(err)
            registerError()
        })
}
function registerSuccess() {
    hideLoading()
    countDownStop()
    ElMessage.success('登录成功')

    setTimeout(() => {
        proxy.$storage.set('needRefreshHome', true)
        proxy.$storage.set('isAutoLogin', isAutoLogin.value)
        // if (this.is401) {
        // this.navbarBack()
        // } else {
        proxy.$router.push('/navigate')
        // }
    }, 300)
}
function registerError(msg) {
    setTimeout(() => {
        hideLoading()
        ElMessage.error(msg || '登录失败')
    }, 300)
}
function showLoading(content) {
    // Toast.loading({
    //     duration: 0,
    //     message: content || '加载中...',
    //     forbidClick: true,
    // })
}
function hideLoading() {
    // Toast.clear()
}
</script>
<style lang="scss" scoped>
.container {
    background: white;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    .bg {
        width: 100%;
        height: 100%;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    .content {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 2;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        .title {
            flex-shrink: 0;
            margin: 0 0 3.2rem;
            display: flex;
            flex-direction: column;
            align-items: center;

            span {
                font-size: 3.125rem;
                color: white;
                font-weight: bold;
            }
            > img:nth-of-type(1) {
                width: 9.875rem;
                height: auto;
            }
        }

        .center {
            flex-shrink: 0;
            width: 24.5rem;
            height: 26.25rem;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0px 5px 12px 0px rgba(0, 0, 0, 0.16);

            display: flex;
            flex-direction: column;
            position: relative;

            .phone-login {
                display: flex;
                flex-direction: column;
                width: 100%;
                padding: 0 2.25rem;
                box-sizing: border-box;

                > span {
                    margin-top: 3rem;
                    margin-bottom: 3.375rem;
                    font-size: 1.4375rem;
                    font-weight: bold;
                    text-align: left;
                    color: #272f53;
                }
                .input-content {
                    flex-shrink: 0;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .input-group {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    width: 100%;
                    height: 2.5rem;
                    position: relative;

                    background: #ffffff;
                    border: 1px solid #8395b4;
                    border-radius: 4px;
                    box-sizing: border-box;

                    &.focus {
                        border: 1px solid #5874e8;
                    }

                    input {
                        flex: 1;
                        height: 2.5rem;
                        line-height: 2.5rem;
                        padding: 0 0.875rem;
                        outline: none;
                        background: transparent;
                        border: none;
                        outline: medium;

                        font-size: 1rem;
                        font-weight: 400;
                        color: #383838;

                        *:focus {
                            outline: none;
                            background-color: transparent;
                        }

                        ::selection {
                            background: transparent;
                        }

                        ::-moz-selection {
                            background: transparent;
                        }

                        &::-webkit-input-placeholder {
                            /* WebKit, Blink, Edge */
                            color: #dfdfdf;
                            font-size: 1rem;
                        }
                        &:-moz-placeholder {
                            /* Mozilla Firefox 4 to 18 */
                            color: #dfdfdf;
                            font-size: 1rem;
                        }
                        &::-moz-placeholder {
                            /* Mozilla Firefox 19+ */
                            color: #dfdfdf;
                            font-size: 1rem;
                        }
                        &:-ms-input-placeholder {
                            /* Internet Explorer 10-11 */
                            color: #dfdfdf;
                            font-size: 1rem;
                        }
                    }
                }
                .captcha-container {
                    display: flex;
                    align-items: center;
                    margin-top: 0.5rem;

                    .captcha {
                        width: calc(100% - 8rem - 0.4375rem);
                        box-sizing: border-box;

                        input {
                            width: 100%;
                        }
                    }
                    .captcha-btn {
                        margin-left: 0.4375rem;
                        flex-shrink: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 2.5rem;
                        width: 8rem;
                        font-size: 0.875rem;

                        border: 1px solid #8395b4;
                        border-radius: 4px;
                        background: white;
                        cursor: pointer;
                        box-sizing: border-box;

                        span {
                            font-size: 0.875rem;
                            color: #272f536c;
                        }
                        &:hover {
                            background: #f2f4ff;
                        }
                        &:active {
                            background: #e2e6f8;
                        }
                        &.disabled {
                            background: #f8f8f8;
                            border: 1px solid #f8f8f8;
                            cursor: default;
                        }
                        div {
                            color: #cfcfcf;
                            display: inline-block;
                        }
                    }
                }
            }
        }
    }

    .auto-login {
        flex-shrink: 0;
        width: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0.625rem 1rem 0.625rem 0;
        margin-top: 0.625rem;
        cursor: pointer;
        img {
            width: 1rem;
            height: 1rem;
            margin-right: 0.75rem;
        }

        span {
            font-size: 0.875rem;
            color: #272f53;
        }
    }

    .next {
        flex-shrink: 0;
        width: 100%;
        margin-top: 2.5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        background: #5874e8;
        font-size: 1rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
            background: #7089f2;
        }
        &:active {
            background: #435dcc;
        }
    }
}
</style>
