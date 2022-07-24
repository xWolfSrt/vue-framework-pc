<template>
    <div class="work-question-create-container" v-if="data.isShow">
        <div class="header">
            <div class="back" @click="closeClick(true)" v-if="!data.hideBack">
                <img :src="getAssetsFile('work/common/icon_back.png')" />
            </div>
            <span :style="{ 'margin-left': data.hideBack ? '1.675rem' : '0' }">问卷调查</span>
            <div class="preview" @click="headPreviewClick">
                <img :src="getAssetsFile('work/common/icon_preview.png')" />
                <span>预览</span>
            </div>
        </div>
        <div class="steps">
            <div>
                <div class="step" v-for="(item, i) in data.steps" :key="i">
                    <div>
                        <div class="step-line">
                            <div v-if="i > 0" :class="{ selected: data.step >= i + 1 }"></div>
                        </div>
                        <div class="step-number" :class="{ complete: data.step > i + 1, current: data.step == i + 1 }">
                            <img v-if="data.step > i + 1" :src="getAssetsFile('auth/icon_right.png')" />
                            <span v-if="data.step <= i + 1" :class="{ complete: data.step > i + 1, current: data.step == i + 1 }">{{
                                i + 1
                            }}</span>
                        </div>
                        <div class="step-line">
                            <div v-if="i < data.steps.length - 1" :class="{ selected: data.step > i + 1 }"></div>
                        </div>
                    </div>
                    <span class="step-value" :class="{ selected: data.step >= i + 1 }">{{ item }}</span>
                </div>
                <div
                    class="step-slider"
                    :style="{
                        width: data.sliderBarWidth + 'px',
                        transform: 'translateX(' + data.sliderOffset + 'px)',
                        '-webkit-transform': 'translateX(' + data.sliderOffset + 'px)',
                    }"
                ></div>
            </div>
        </div>

        <div
            class="edit-erea basic"
            v-loading="loading"
            :style="{ visibility: data.step == 1 ? 'visible' : 'hidden' }"
            :class="{ hide: data.step != 1 }"
        >
            <WorkBasicEditor :captcha="data.temp.captcha" :directory="uploadDirectory" ref="basicEditor"></WorkBasicEditor>
        </div>
        <div
            class="question-border-top"
            :style="{ visibility: data.step == 2 ? 'visible' : 'hidden' }"
            :class="{ hide: data.step != 2 }"
        ></div>
        <div
            class="question-border-bottom"
            :style="{ visibility: data.step == 2 ? 'visible' : 'hidden' }"
            :class="{ hide: data.step != 2 }"
        ></div>
        <!-- <div class="question-border-left" :style="{ visibility: data.step == 2 ? 'visible' : 'hidden' }" :class="{ hide: data.step != 2 }"></div> -->
        <!-- <div class="question-border-right" :style="{ visibility: data.step == 2 ? 'visible' : 'hidden' }" :class="{ hide: data.step != 2 }"></div> -->
        <div class="question-erea editor" :style="{ visibility: data.step == 2 ? 'visible' : 'hidden' }" :class="{ hide: data.step != 2 }">
            <div>
                <WorkQuestionEditor :captcha="data.temp.captcha" :directory="uploadDirectory" ref="questionEditor"></WorkQuestionEditor>
            </div>
        </div>
        <div class="edit-erea people" :style="{ visibility: data.step == 3 ? 'visible' : 'hidden' }" :class="{ hide: data.step != 3 }">
            <WorkAssign ref="workAssign"></WorkAssign>
        </div>

        <div class="bottom">
            <div class="draft" @click="draftClick">保存至草稿箱</div>
            <div class="pre" v-if="data.step > 1" @click="preClick()">上一步</div>
            <div class="next" @click="nextClick">{{ data.step == data.steps.length ? '发布' : '下一步' }}</div>
        </div>
        <ZwLoading
            :isAbsolute="true"
            :top="'2.75rem'"
            :background="data.loadingBg"
            @errorTap="zwLoadingErrorTap"
            ref="zwLoading"
        ></ZwLoading>
    </div>

    <el-dialog v-model="data.isUnsaveShow" title="提示" width="355px">
        <span>内容还未保存，是否确定返回？</span>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeQuit" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="confirmQuit" :icon="Check" style="width: 110px">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, nextTick } from 'vue'
import { Close, Check } from '@element-plus/icons-vue'
import getAssetsFile from '../../../utils/pub-use'
import ZwLoading from '../../../components/ZwLoading.vue'
import globalService from '../../../utils/global-service'
import WorkBasicEditor from '../component/WorkBasicEditor.vue'
import WorkQuestionEditor from '../component/WorkQuestionEditor.vue'
import WorkAssign from '../component/WorkAssign.vue'
import sendService from '../../../api/send'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['refresh'])
const zwLoading = ref(null)
const basicEditor = ref(null)
const questionEditor = ref(null)
const workAssign = ref(null)

const loadingBg = ref('white')
const loading = ref(false)
const data = reactive({
    isShow: false,
    step: 1,
    steps: ['填写基本信息', '完善内容详情', '选择指派人员'],

    sliderOffset: 0,
    sliderWidth: 146,
    sliderBarWidth: 30,

    isUnsaveShow: false,
    temp: {},
    content: '',
})
let category = 'ScheduleCategory_Question'
let uploadDirectory = 'release/upload/union_api_link_send'
onMounted(() => {})
//如果copy=true,说明是发件箱复制，需要获取新的captcha,如果有id，说明是发件箱复制，或者草稿箱打开，需要查询发件详情，还原数据
const show = (copy, id) => {
    if (data.isShow) return
    data.step = 1
    updateTab()
    data.isShow = true
    data.temp.copy = copy
    if (id) {
        data.temp.id = id
        //v-if之后 zwLoading还未创建
        nextTick(() => {
            reload()
        })
    } else {
        //如果是新建的话，每次获取新的captcha，如果是草稿箱还原，则使用原来的captcha
        data.temp.captcha = globalService.getGuid()
        saveInitialContent()
    }
}
const closeClick = (checkModify) => {
    if (checkModify && checkContentModify()) {
        data.isUnsaveShow = true
        return
    }
    data.isShow = false
}
const closeQuit = () => {
    data.isUnsaveShow = false
}

const confirmQuit = () => {
    data.isUnsaveShow = false
    data.isShow = false
}
const saveInitialContent = () => {
    try {
        setTimeout(() => {
            let content = getSendContent()
            data.temp.initialContent = content && JSON.stringify(content)
            console.log(data.temp.initialContent)
        }, 300)
    } catch (error) {
        console.log('saveInitialContent error', error)
    }
}
const checkContentModify = () => {
    try {
        let content = getSendContent()
        let nowContent = content && JSON.stringify(content)
        if (nowContent != data.temp.initialContent) {
            return true
        }
        console.log(data.temp.initialContent)
        console.log(nowContent)
    } catch (error) {
        console.log('saveInitialContent error', error)
    }
    return false
}
const headPreviewClick = () => {
    // let basic = this.basicEditor.getContent(true)
    // if (!basic) return
    // this.notificationPreview && this.notificationPreview.show(this.category, this.getSendContent())
}
const draftClick = () => {
    let basic = basicEditor.value.getContent(true)
    if (!basic) return
    // this.zwPopup.showLoading('正在保存')
    loading.value = true
    sendService
        .save(getSendContent())
        .then((result) => {
            if (!result) {
                saveError()
                return
            }
            setTimeout(() => {
                saveSuccess()
            }, 50)
        })
        .catch((err) => {
            saveError(err && err.msg)
        })
}
const getSendContent = (isPublish = false) => {
    let basic = basicEditor.value.getContent()
    let content = questionEditor.value.getContent(false, isPublish)
    let scope = workAssign.value.getContent()
    let draft = {
        formInfo: content,
    }
    return {
        category: category,
        title: basic.title,
        file: basic.file,
        photo: basic.photo,
        remark: basic.remark,
        deadline: basic.time,
        draft: JSON.stringify(draft),
        scope: scope,
        captcha: data.temp.captcha,
    }
}
const preClick = () => {
    if (data.step > 1) {
        data.step -= 1
    }
    updateTab()
}
const nextClick = () => {
    if (data.step < data.steps.length) {
        if (data.step == 1) {
            let content = basicEditor.value.getContent(true)
            if (!content) return
            data.temp.basicContent = content
            console.log(content)
        } else if (data.step == 2) {
            let content = questionEditor.value.getContent(true)
            if (!content) return
            data.temp.editorContent = content
            console.log(content)
        }
        data.step += 1
    } else {
        let content = workAssign.value.getContent(true)
        if (!content) return
        confirmClick()
    }
    updateTab()
}
const confirmClick = () => {
    // this.zwPopup.showLoading('正在发布')
    loading.value = true
    sendService
        .publish(getSendContent(true))
        .then((result) => {
            if (!result) {
                submitError()
                return
            }
            setTimeout(() => {
                submitSuccess()
            }, 50)
        })
        .catch((err) => {
            submitError(err && err.msg)
        })
}

const updateTab = () => {
    data.sliderOffset = data.sliderWidth * (data.step - 1)
}

const saveSuccess = () => {
    console.log('saveSuccess')
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast('保存成功')
    loading.value = false
    ElMessage.success('保存成功')
    refreshPre(false)
    setTimeout(() => {
        closeClick()
    }, 300)
}
const saveError = (msg) => {
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast(msg || '保存失败')
    loading.value = false
    console.log('saveError')
}
const submitSuccess = () => {
    console.log('submitSuccess')
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast('发布成功')
    loading.value = false
    ElMessage.success('发布成功')
    refreshPre(true)
    setTimeout(() => {
        closeClick()
    }, 300)
}
const submitError = (msg) => {
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast(msg || '发布失败')
    loading.value = false
    console.log('submitError')
}
const refreshPre = (isPublish) => {
    emits('refresh', isPublish)
}

const reload = (isRefresh = false) => {
    loadingBg.value = isRefresh ? 'transparent' : 'white'
    data.temp.isReloading = true
    console.log(zwLoading)
    zwLoading.value.showLoading()
    sendService
        .fetchSummary(data.temp.id)
        .then((result) => {
            if (!result) {
                reloadError()
                return
            }
            disposeResult(result)
            reloadFinish()
        })
        .catch((err) => {
            console.log(err)
            reloadError()
        })
}
const disposeResult = (result) => {
    let schedule = result.schedule

    //如果是发件箱复制的话，每次获取新的captcha，如果是草稿箱还原，则使用原来的captcha
    if (data.temp.copy) {
        data.temp.captcha = globalService.getGuid()
    } else {
        data.temp.captcha = schedule.captcha
    }

    let file = schedule.file && JSON.parse(schedule.file)
    let basic = {
        title: schedule.title,
        photo: schedule.photo,
        time: result.deadline,
        remark: result.remark,
        file: globalService.getFiles(file),
    }

    let draft = schedule.draft && JSON.parse(schedule.draft)

    let scope = result.scope
    basicEditor.value.setContent(basic)
    questionEditor.value.setContent(draft && draft.formInfo)
    workAssign.value.setContent(scope)

    saveInitialContent()
}
const reloadError = () => {
    data.temp.isReloading = false
    zwLoading.value.showError()
}
const reloadFinish = () => {
    setTimeout(() => {
        data.temp.isReloading = false
        zwLoading.value.hide()
    }, 300)
}
const zwLoadingErrorTap = () => {
    reload()
}

defineExpose({
    show,
})
</script>
<style lang="scss" scoped>
@import '../../../common/styles/variable/index.scss';
.work-question-create-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 91;
    left: 0;
    top: 0;
    box-sizing: border-box;
    background: white;

    // animation: fadeIn 0.3s ease-in;
    // -webkit-animation-fill-mode: forwards;
    // animation-fill-mode: forwards;
    padding-top: calc(#{$workTopHeight} + 2.75rem + 6rem);

    .header {
        height: 2.75rem;
        display: flex;
        align-items: center;
        padding: 0 1.625rem 0 0;
        box-sizing: border-box;
        background: white;
        border-bottom: 1px solid #c6c6c6;

        position: fixed;
        top: $workTopHeight;
        left: $workLeftBarWeight;
        right: 0;
        z-index: 200;
        min-width: calc(#{$minScreenWidth} - #{$workLeftBarWeight});

        .back {
            flex-shrink: 0;
            width: 2.75rem;
            height: 2.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            img {
                width: 1.0625rem;
                height: 1.0625rem;
            }
        }
        > span {
            flex: 1;
            font-weight: bold;
            font-size: 0.875rem;
            color: #272f53;
        }

        .preview {
            flex-shrink: 0;
            width: 6.8125rem;
            height: 1.875rem;
            border: 1px solid #cdd1e0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &:hover {
                background: #f2f4ff;
            }
            &:active {
                background: #e2e6f8;
            }

            img {
                width: 1.1875rem;
                height: auto;
                margin-right: 0.5625rem;
            }
            span {
                // font-weight: bold;
                font-size: 0.875rem;
                color: #5874e8;
            }
        }
    }
    .steps {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 6rem;
        background: white;
        box-sizing: border-box;
        position: fixed;
        top: calc(#{$workTopHeight} + 2.75rem);
        left: $workLeftBarWeight;
        right: 0;
        z-index: 200;
        min-width: calc(#{$minScreenWidth} - #{$workLeftBarWeight});

        > div {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 6rem;
            position: relative;
        }
        .step {
            width: 146px;
            display: flex;
            flex-shrink: 0;
            align-items: center;
            flex-direction: column;

            > div {
                width: 100%;
                display: flex;
                align-items: center;

                .step-line {
                    flex: 1;
                    height: 3px;

                    div {
                        flex: 1;
                        height: 3px;
                        border-bottom: 3px solid #c6d1fd;

                        &.selected {
                            border-bottom: 3px solid #5874e8;
                        }
                    }
                }

                .step-number {
                    flex-shrink: 0;
                    width: 2rem;
                    height: 2rem;
                    background: #5874e8;
                    border-radius: 2rem;
                    margin: 0 0.4375rem;
                    background: #b2c2de;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;

                    &.complete {
                        background: #5874e8;
                    }
                    &.current {
                        background: #5874e8;
                    }
                    img {
                        width: 1rem;
                        height: 0.8125rem;
                    }

                    span {
                        font-size: 1.25rem;
                        color: white;
                        line-height: 1;

                        &.complete {
                            color: white;
                        }
                        &.current {
                            color: white;
                        }
                    }
                }
            }
            .step-value {
                margin-top: 0.5rem;
                flex-shrink: 0;
                font-size: 0.75rem;
                color: #8395b4;
                &.selected {
                    color: #5874e8;
                }
            }
        }

        .step-slider {
            position: absolute;
            content: ' ';
            left: 0;
            bottom: 0;
            width: 30px;
            height: 30px;
            margin-left: 58px;
            // border-radius: 4px;
            // background-color: #6d89fa;
            -webkit-transition: -webkit-transform 0.3s;
            transition: -webkit-transform 0.3s;
            transition: transform 0.3s;
            transition: transform 0.3s, -webkit-transform 0.3s;

            &:after {
                border: 15px solid transparent;
                border-bottom: 15px solid #6d89fa;
                width: 0;
                height: 0;
                position: absolute;
                right: 0px;
                content: ' ';
            }
        }
    }

    // .center {
    //     width: 100%;
    //     height: calc(100% - 2.75rem - 4.75rem);
    //     display: flex;
    //     flex-direction: column;
    //     align-items: center;
    //     box-sizing: border-box;
    //     padding: 0 3.125rem;
    //     // position: relative;
    //     // overflow-y: auto;
    //     // overflow-x: hidden;

    .edit-erea {
        // border: 1px solid #dfe8f7;
        border-top: 0.375rem solid #6d89fd;
        box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.08);
        position: fixed;
        top: calc(#{$workTopHeight} + 2.75rem + 6rem);
        left: calc(#{$workLeftBarWeight} + 3.125rem);
        right: 3.125rem;
        bottom: 4.75rem;
        z-index: 201;

        min-width: calc(#{$minScreenWidth} - #{$workLeftBarWeight} - 3.125rem - 3.125rem);

        &.basic {
            overflow-y: auto;
            overflow-x: hidden;
        }

        &.hide {
            left: -100%;
            right: 100%;
        }
    }

    .question-border-top {
        // border: 1px solid #6d89fd;
        // border-top: 6px solid #6d89fd;
        height: 0.375rem;
        background: #6d89fd;
        box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.08);
        position: fixed;
        top: calc(#{$workTopHeight} + 2.75rem + 6rem);
        left: calc(#{$workLeftBarWeight} + 3.125rem);
        right: 3.125rem;
        // bottom: 4.75rem;
        z-index: 200;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        min-width: calc(#{$minScreenWidth} - #{$workLeftBarWeight} - 3.125rem - 3.125rem);
        &.hide {
            left: -100%;
            right: 100%;
        }
    }
    .question-border-left {
        background: #dfe8f7;
        width: 1px;
        box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.08);
        position: fixed;
        top: calc(#{$workTopHeight} + 2.75rem + 6rem);
        bottom: 4.75rem;
        left: calc(#{$workLeftBarWeight} + 3.125rem);
        z-index: 200;

        box-sizing: border-box;
        &.hide {
            left: -100%;
            right: 100%;
        }
    }
    .question-border-right {
        background: #dfe8f7;
        width: 1px;
        box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.08);
        position: fixed;
        top: calc(#{$workTopHeight} + 2.75rem + 6rem);
        bottom: 4.75rem;
        right: 3.125rem;
        z-index: 200;
        box-sizing: border-box;
        &.hide {
            left: -100%;
            right: 100%;
        }
    }
    .question-border-bottom {
        background: #dfe8f7;
        box-shadow: 0px 3px 12px 0px rgb(0 0 0 / 8%);
        position: fixed;
        bottom: 4.75rem;
        left: calc(6.25rem + 3.125rem);
        right: 3.125rem;
        z-index: 200;
        box-sizing: border-box;
        height: 1px;
        min-width: calc(#{$minScreenWidth} - #{$workLeftBarWeight} - 3.125rem - 3.125rem);
        &.hide {
            left: -100%;
            right: 100%;
        }
    }

    .question-erea {
        flex: 1;
        padding: 0.375rem 3.125rem 4.75rem;
        box-sizing: border-box;
        width: 100%;
        > div {
            width: 100%;
            height: 100%;
            border: 1px solid #dfe8f7;
            border-top: 0;
            border-bottom: 0;
        }
        &.hide {
            position: fixed;
            left: -100%;
            right: 100%;
            z-index: 200;
        }
    }
    .bottom {
        flex-shrink: 0;
        height: 4.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        position: fixed;
        z-index: 199;
        bottom: 0;
        left: $workLeftBarWeight;
        right: 0;
        min-width: calc(#{$minScreenWidth} - #{$workLeftBarWeight});

        div {
            width: 6.8125rem;
            height: 2rem;
            margin: 0 0.25rem;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            box-sizing: border-box;
        }
        .draft {
            background: #ffffff;
            border: 1px solid #cdd1e0;
            color: #272f53;
            font-weight: bold;
            cursor: pointer;
            &:hover {
                background: #f2f4ff;
            }
            &:active {
                background: #e2e6f8;
            }
        }
        .pre {
            background: #ffffff;
            border: 1px solid #b1bdf2;
            color: #6c78af;
            cursor: pointer;
            &:hover {
                background: #f2f4ff;
            }
            &:active {
                background: #e2e6f8;
            }
        }
        .next {
            background: #5874e8;
            border: 1px solid #5874e8;
            color: white;
            cursor: pointer;
            &:hover {
                background: #7089f2;
            }
            &:active {
                background: #435dcc;
            }
        }
    }
}
</style>
