<template>
    <div class="work-container">
        <!-- <div style="width: 6.25rem; height: 100%; flex-shrink: 0"></div> -->
        <div class="work-content">
            <div class="top">
                <div class="header">
                    <div class="header-refresh" @click="refreshClick">
                        <img :src="getAssetsFile('work/common/icon_refresh.png')" />
                    </div>
                    <SwitchOrginization></SwitchOrginization>
                    <div class="header-search">
                        <img :src="getAssetsFile('work/common/icon_search.png')" @click="search" />
                        <input
                            id="content"
                            type="text"
                            maxlength="100"
                            placeholder="请输入搜索内容"
                            placeholder-style="color:#C3C3C3"
                            v-model="input.content"
                            @keyup.enter="search"
                            :disabled="!inputEnable"
                            ref="content"
                        />
                    </div>
                </div>
                <TabManager :tabs="workService.tabs" @close-tab="closeTabClick"></TabManager>
            </div>
            <div class="router-content">
                <router-view v-slot="{ Component, route }">
                    <!-- <component :is="Component" :key="route.fullPath" /> -->
                    <keep-alive :include="workService.keepAlive">
                        <component :is="Component" :key="route.fullPath" />
                    </keep-alive>
                </router-view>
                <!-- <router-view></router-view> -->
            </div>
        </div>
    </div>

    <Tabbar :code="'work'" @refresh="tabbarRefresh"></Tabbar>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, onDeactivated, onActivated } from 'vue'
import Tabbar from '../../components/Tabbar.vue'
import SwitchOrginization from '../../components/SwitchOrginization.vue'
import TabManager from '../../components/TabManager.vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { workStore } from '../../store/work-store'
import getAssetsFile from '../../utils/pub-use'
import { ElMessage } from 'element-plus'

// const keepAlive = reactive(['WorkHome'])

const { proxy } = getCurrentInstance()
const router = useRouter()
const workService = workStore()
const confirmSearch = ref('')
const inputEnable = ref(true)
const input = reactive({
    content: '',
})
const data = reactive({
    tabs: [],
})
onMounted(() => {
    console.log(router)

    // let man = new Man('a', 1, { name: 'b', grade: 'c' })
    // man.say()
    // man.saySchool()
    // man.jump()

    // let woman = new Woman('e', 2, { name: 'f', grade: 'g' })
    // woman.sing()

    // function Anim(name, type) {
    //     this.name = name
    //     this.type = type
    // }
    // Anim.prototype.run = function () {
    //     console.log(`${this.name} 是 ${this.type}`)
    // }
    // let mouse = new Anim('mouse', '鼠类')
    // let cat = new Anim('cat', '猫科')

    // console.log(mouse.name)
    // console.log(cat.name)
    // console.log(cat.constructor == mouse.constructor)
    // mouse.run()
    // cat.run()
    // console.log(cat.run == mouse.run)
    // console.log(cat.__proto__ === Anim.prototype)

    // console.log(mouse.hasOwnProperty('name'))

    // console.log(`-------------Object Function----------------------`)
    // let obj = {}
    // console.log(obj.__proto__ == Object.prototype) //true
    // console.log(Object.__proto__ == Function.prototype) //true
    // console.log(Object.prototype.__proto__) //null
    // console.log(Object.prototype.constructor == Object) //true
    // console.log(Object.constructor == Function.constructor) //true

    // function Person() {}
    // let fn = new Person()
    // console.log(fn.__proto__ == Person.prototype) //true
    // console.log(Person == Person.prototype.constructor) //true  每个原型都有一个constructor属性，指向该关联的构造函数
    // console.log(Person.__proto__ == Function.prototype) //true
    // console.log(fn.constructor == Person.prototype.constructor) //true 因为每一个对象都会从原型中“继承”属性，cat1中并没有属性constructor ，但是它的原型cat1.__proto__ 指向的是Animal.prototype，然而Animal.prototype原型中是有属性constructor的，于是cat1的constructor属性继承与原型中的constructor属性
    // console.log(fn.constructor == Person) //true 因为每一个对象都会从原型中“继承”属性，cat1中并没有属性constructor ，但是它的原型cat1.__proto__ 指向的是Animal.prototype，然而Animal.prototype原型中是有属性constructor的，于是cat1的constructor属性继承与原型中的constructor属性

    // console.log(Function.prototype.__proto__ == Object.prototype) //true Function.prototype是Object的实例对象
    // console.log(Object.__proto__ == Function.prototype) //true Object和Function都是构造函数，而所有的构造函数的都是Function的实例对象. 因此Object是Function的实例对象

    // console.log(Function.prototype == Function.__proto__) //true
    // console.log(Function.prototype.constructor == Function) //true

    // console.log(`-------------typeof---------------------`)
    // console.log(typeof 123 == 'number')
    // console.log(typeof 'abc' == 'string')
    // console.log(typeof true == 'boolean')
    // console.log(typeof { a: 1 } == 'object')
    // console.log(typeof [1, 2, 4] === 'object')
    // console.log(typeof new Date() === 'object')
    // console.log(typeof undefined == 'undefined')
    // console.log(typeof Symbol() == 'symbol')
    // console.log(typeof function () {} === 'function')

    var mediator = (function () {
        return {
            changed: function (obj) {
                if (obj === passwordInput && !nameInput.value) {
                    return alert('请先输入用户名')
                }

                if (obj === repeatPasswordInput && !passwordInput.value) {
                    return alert('请先输入密码')
                }

                if (obj === ageInputInput && !sexInput.value) {
                    return alert('请先选择性别')
                }
            },
        }
    })()
    console.log(mediator)

    console.log({
        changed: function (obj) {
            if (obj === passwordInput && !nameInput.value) {
                return alert('请先输入用户名')
            }

            if (obj === repeatPasswordInput && !passwordInput.value) {
                return alert('请先输入密码')
            }

            if (obj === ageInputInput && !sexInput.value) {
                return alert('请先选择性别')
            }
        },
    })
})

const tabbarRefresh = () => {
    workService.refreshPage(router.currentRoute.value.path)
}
const refreshClick = () => {
    workService.refreshPage(router.currentRoute.value.path)
}
const search = () => {
    console.log('search')
    if (!input.content && input.content != '0') {
        ElMessage.warning('请输入搜索内容')
        return
    }
    confirmSearch.value = input.content
    proxy.$storage.set('workConfirmSearchContent', confirmSearch.value)
    if (router.currentRoute.value.path == '/work/search') {
        workService.searchContent(confirmSearch.value, router.currentRoute.value.path)
    } else {
        router.push('/work/search')
    }
}
onBeforeRouteLeave((to, from) => {
    // const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
    // // 取消导航并停留在同一页面上
    // if (!answer) return false
})
onActivated(() => {
    console.log('Work---onActivated')
})
onDeactivated(() => {
    console.log('WorkHome---onDeactivated')
})
const closeTabClick = (index) => {
    workService.closeTab(index, router)
}
</script>
<style lang="scss" scoped>
@import '../../common/styles/variable/index.scss';

.work-container {
    width: 100%;
    height: 100%;
    display: flex;
    background: #f4f4f4;
    padding-left: $workLeftBarWeight;
    box-sizing: border-box;

    .work-content {
        height: 100%;
        width: 100%;
        background: #f4f4f4;
        position: relative;
        display: flex;
        flex-direction: column;

        .top {
            flex-shrink: 0;
            // width: 100%;
            height: $workTopHeight; //46 + 40px
            position: fixed;
            top: 0;
            left: 6.25rem;
            right: 0;
            z-index: 99;
            display: flex;
            flex-direction: column;
            background: #f4f4f4;

            .header {
                flex-shrink: 0;
                width: 100%;
                height: 2.875rem;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                position: relative;
                // background: #adadad;

                .header-refresh {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2.125rem;
                    height: 2.125rem;
                    margin-left: 0.5rem;
                    cursor: pointer;

                    img {
                        width: 0.875rem;
                        height: 0.875rem;
                    }
                }

                .header-search {
                    position: absolute;
                    right: 1.375rem;
                    top: 50%;
                    -webkit-transform: translate(0, -50%);
                    transform: translate(0, -50%);

                    padding: 0 0.8125rem 0 0.5rem;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    width: 15.25rem;
                    height: 1.75rem;
                    background: #ffffff;
                    border: 1px solid #dedede;
                    border-radius: 4px;

                    img {
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

                        outline: none;
                        background: transparent;
                        border: none;
                        outline: medium;
                        border-radius: 0.25rem;

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
                }
            }
        }
        .router-content {
            width: 100%;
            height: 100%;
            background: #adadad;
        }
    }
}
</style>
