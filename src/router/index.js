import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Splash from '@/views/Splash.vue'
import pinia from '../store'
import { appStore } from '../store/app-store'
import { workStore } from '../store/work-store'
const routes = [
    { path: '/', redirect: '/splash' },
    { path: '/splash', component: Splash },
    { path: '/login', component: () => import('@/views/Login.vue') },
    { path: '/navigate', component: () => import('@/views/Navigate.vue') },
    // 嵌套子路由，在父路由和子路由都keep-alive的情况下，会出现多次创建（挂载错乱）的问题
    // {
    //     path: '/home',
    //     component: () => import('@/views/home/HomeRoot.vue'),
    //     children: [
    //         { path: '', component: () => import('@/views/home/Home.vue') },
    //         { path: 'search', component: () => import('@/views/home/HomeSearch.vue') },
    //     ],
    // },
    // {
    //     path: '/live',
    //     component: () => import('@/views/live/LiveRoot.vue'),
    //     children: [{ path: '', component: () => import('@/views/live/Live.vue') }],
    // },
    // {
    //     path: '/personal',
    //     component: () => import('@/views/personal/PersonalRoot.vue'),
    //     children: [
    //         { path: '', component: () => import('@/views/personal/Personal.vue') },
    //         { path: 'details', component: () => import('@/views/personal/PersonalDetails.vue') },
    //         { path: 'settings', component: () => import('@/views/personal/PersonalSettings.vue') },
    //     ],
    // },
    {
        path: '/work',
        component: () => import('@/views/work/Work.vue'),
        children: [
            { path: '', component: () => import('@/views/work/WorkHome.vue') },
            // { path: 'search', component: () => import('@/views/work/WorkSearch.vue') },
            { path: 'notification', component: () => import('@/views/work/notification/WorkNotification.vue') },
            { path: 'question', component: () => import('@/views/work/question/WorkQuestion.vue') },
        ],
    },
    {
        path: '/contact',
        component: () => import('@/views/contact/Contact.vue'),
        // children: [
        //     { path: '', component: () => import('@/views/work/WorkHome.vue') },
        //     { path: 'search', component: () => import('@/views/work/WorkSearch.vue') },
        //     { path: 'notification', component: () => import('@/views/work/notification/WorkNotification.vue') },
        // ],
    },
    {
        path: '/schedule',
        component: () => import('@/views/schedule/Schedule.vue'),
        // children: [
        //     { path: '', component: () => import('@/views/work/WorkHome.vue') },
        //     { path: 'search', component: () => import('@/views/work/WorkSearch.vue') },
        //     { path: 'notification', component: () => import('@/views/work/notification/WorkNotification.vue') },
        // ],
    },
    {
        path: '/home',
        component: () => import('@/views/home/Home.vue'),
    },
    {
        path: '/home/search',
        component: () => import('@/views/home/HomeSearch.vue'),
    },
    {
        path: '/news/details',
        component: () => import('@/views/news/NewsDetails.vue'),
    },
    {
        path: '/live',
        component: () => import('@/views/live/Live.vue'),
    },
    {
        path: '/personal',
        component: () => import('@/views/personal/Personal.vue'),
    },
    {
        path: '/personal/details',
        component: () => import('@/views/personal/PersonalDetails.vue'),
    },
    {
        path: '/personal/settings',
        component: () => import('@/views/personal/PersonalSettings.vue'),
    },

    {
        path: '/:error*', // /:error -> 匹配 /, /one, /one/two, /one/two/three, 等
        name: '404',
        component: () => import('@/views/NotFound.vue'),
    },
]

const router = createRouter({
    routes,
    history: createWebHashHistory(),
    // history: createWebHistory('/'),
})

const appService = appStore(pinia) //传入pinia 解决afterEach中不能使用的问题
const workService = workStore(pinia) //传入pinia 解决afterEach中不能使用的问题
router.afterEach((to, from) => {
    // if (to.path.indexOf('/work') != -1) {
    appService.addTab(to.path)
    workService.addTab(to.path)
    // }
})
export default router
