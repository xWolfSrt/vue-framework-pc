import { createApp } from 'vue'
import App from './App.vue'
import './assets/js/responsive'
import './assets/js/organization'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import storage from './utils/localstorage'
import http from './utils/http/httpclient.js'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

app.config.globalProperties.$http = http
app.config.globalProperties.$router = router
app.config.globalProperties.$storage = storage
app.mount('#app')
