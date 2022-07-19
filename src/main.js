import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './assets/js/responsive'
import './assets/js/organization'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import storage from './utils/localstorage'
import http from './utils/http/httpclient.js'
import pinia from './store/'
import * as echarts from 'echarts'

const app = createApp(App)
app.use(ElementPlus)
app.use(pinia)
app.use(router)

app.config.globalProperties.$http = http
app.config.globalProperties.$router = router
app.config.globalProperties.$storage = storage
app.config.globalProperties.$echarts = echarts

app.mount('#app')
