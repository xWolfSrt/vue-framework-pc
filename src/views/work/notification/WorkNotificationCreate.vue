<template>
    <div class="work-notification-create-container" v-if="data.isShow">
        <div class="header">
            <div class="back" @click="closeClick(true)" v-if="!data.hideBack">
                <img :src="getAssetsFile('work/common/icon_back.png')" />
            </div>
            <span :style="{ 'margin-left': data.hideBack ? '1.675rem' : '0' }">通知公告</span>
            <div class="preview" @click="headPreviewClick">
                <img :src="getAssetsFile('work/common/icon_preview.png')" />
                <span>预览</span>
            </div>
        </div>
        <div class="center">
            <div class="steps">
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

            <div class="edit-erea">
                <div class="basic" :style="{ visibility: data.step == 1 ? 'visible' : 'hidden', left: data.step == 1 ? 0 : '-100%' }">
                    <!-- <app-work-basic-editor [captcha]="temp.captcha" [directory]="uploadDirectory" #basiceditor></app-work-basic-editor> -->
                    <WorkBasicEditor :captcha="data.temp.captcha" :directory="uploadDirectory" ref="basicEditor"></WorkBasicEditor>
                </div>
                <div class="editor" :style="{ visibility: data.step == 2 ? 'visible' : 'hidden', left: data.step == 2 ? 0 : '-100%' }">
                    <!-- <app-wang-editor [captcha]="temp.captcha" [directory]="uploadDirectory" [content]="content" #wangeditor></app-wang-editor> -->
                </div>
                <div class="people" :style="{ visibility: data.step == 3 ? 'visible' : 'hidden', left: data.step == 3 ? 0 : '-100%' }">
                    <!-- <app-work-assign #workassign></app-work-assign> -->
                </div>
            </div>
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
import { ref, reactive, getCurrentInstance } from 'vue'
import getAssetsFile from '../../../utils/pub-use'
import ZwLoading from '../../../components/ZwLoading.vue'
import globalService from '../../../utils/global-service'
import WorkBasicEditor from '../component/WorkBasicEditor.vue'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['refresh'])
const zwLoading = ref(null)
const basicEditor = ref(null)

const loadingBg = ref('white')
const data = reactive({
    isShow: false,
    step: 1,
    steps: ['填写基本信息', '完善内容详情', '选择指派人员'],

    sliderOffset: 0,
    sliderWidth: 146,
    sliderBarWidth: 30,

    isUnsaveShow: false,
    temp: {},
})
let category = 'ScheduleCategory_Notice'
let uploadDirectory = 'release/upload/union_api_link_send'

//如果copy=true,说明是发件箱复制，需要获取新的captcha,如果有id，说明是发件箱复制，或者草稿箱打开，需要查询发件详情，还原数据
const show = (copy, id) => {
    if (data.isShow) return
    data.step = 1
    updateTab()
    data.isShow = true
    data.temp.copy = copy
    if (id) {
        data.temp.id = id
        reload()
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
    // let basic = this.basicEditor.getContent(true)
    // if (!basic) return
    // this.zwPopup.showLoading('正在保存')
    // this.sendService.save(this.getSendContent(), {
    //     success: (result) => {
    //         if (!result) {
    //             this.saveError()
    //             return
    //         }
    //         setTimeout(() => {
    //             this.saveSuccess()
    //         }, 50)
    //     },
    //     fail: (error) => {
    //         this.saveError(error)
    //     },
    // })
}
const getSendContent = () => {
    // let basic = this.basicEditor.getContent()
    // let content = this.wangEditor.getContent()
    // let scope = this.workAssign.getContent()
    // let draft = {
    //     id: null,
    //     content: content,
    // }
    // return {
    //     category: this.category,
    //     title: basic.title,
    //     file: basic.file,
    //     photo: basic.photo,
    //     remark: basic.remark,
    //     deadline: basic.time,
    //     draft: JSON.stringify(draft),
    //     scope: scope,
    //     captcha: this.temp.captcha,
    // }
}
const preClick = () => {
    if (data.step > 1) {
        data.step -= 1
    }
    updateTab()
}
const nextClick = () => {
    // if (data.step < data.steps.length) {
    //     if (data.step == 1) {
    //         let content = basicEditor.getContent(true)
    //         if (!content) return
    //         data.temp.basicContent = content
    //         console.log(content)
    //     } else if (data.step == 2) {
    //         let content = wangEditor.getContent()
    //         data.temp.editorContent = content
    //         console.log(content)
    //     }
    //     data.step += 1
    // } else {
    //     let content = workAssign.getContent(true)
    //     if (!content) return
    //     confirmClick()
    // }
    // updateTab()
}
const confirmClick = () => {
    // this.zwPopup.showLoading('正在发布')
    // this.sendService.publish(this.getSendContent(), {
    //     success: (result) => {
    //         if (!result) {
    //             this.submitError()
    //             return
    //         }
    //         setTimeout(() => {
    //             this.submitSuccess()
    //         }, 50)
    //     },
    //     fail: (error) => {
    //         this.submitError(error)
    //     },
    // })
}

const updateTab = () => {
    data.sliderOffset = data.sliderWidth * (data.step - 1)
}

const saveSuccess = () => {
    // console.log('saveSuccess')
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast('保存成功')
    // this.refreshPre(false)
    // setTimeout(() => {
    //     this.closeClick()
    // }, 300)
}
const saveError = (msg) => {
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast(msg || '保存失败')
    // console.log('saveError')
}
const submitSuccess = () => {
    // console.log('submitSuccess')
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast('发布成功')
    // this.refreshPre(true)
    // setTimeout(() => {
    //     this.closeClick()
    // }, 300)
}
const submitError = (msg) => {
    // this.zwPopup.hideLoading()
    // this.zwPopup.toast(msg || '发布失败')
    // console.log('submitError')
}
const refreshPre = (isPublish) => {
    emits('refresh', isPublish)
}

const reload = (isRefresh = false) => {
    // this.loadingBg = isRefresh ? 'transparent' : 'white'
    // this.temp.isReloading = true
    // zwLoading.showLoading()
    // this.sendService.fetchSummary(this.temp.id, {
    //     success: (result) => {
    //         if (!result) {
    //             this.reloadError()
    //             return
    //         }
    //         this.disposeResult(result)
    //         this.reloadFinish()
    //     },
    //     fail: (error) => {
    //         this.reloadError()
    //     },
    // })
}
const disposeResult = (result) => {
    let schedule = result.schedule

    //如果是发件箱复制的话，每次获取新的captcha，如果是草稿箱还原，则使用原来的captcha
    if (data.temp.copy) {
        data.temp.captcha = data.globalService.getGuid()
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
    let content = ''
    if (draft) {
        content = draft.content
    }

    let scope = result.scope

    // this.basicEditor.setContent(basic)
    // this.wangEditor.setContent(content)
    // this.workAssign.setContent(scope)

    saveInitialContent()
}
const reloadError = () => {
    data.temp.isReloading = false
    zwLoading.showError()
}
const reloadFinish = () => {
    setTimeout(() => {
        data.temp.isReloading = false
        zwLoading.hide()
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
.work-notification-create-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100% - #{$workTopHeight});
    position: absolute;
    z-index: 101;
    left: 0;
    top: $workTopHeight;
    box-sizing: border-box;
    background: white;

    // animation: fadeIn 0.3s ease-in;
    // -webkit-animation-fill-mode: forwards;
    // animation-fill-mode: forwards;

    .header {
        width: 100%;
        height: 2.75rem;
        display: flex;
        align-items: center;
        padding: 0 1.625rem 0 0;
        box-sizing: border-box;
        background: white;
        border-bottom: 1px solid #c6c6c6;

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

    .center {
        width: 100%;
        height: calc(100% - 2.75rem - 4.75rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        padding: 0 3.125rem;
        // position: relative;
        // overflow-y: auto;
        // overflow-x: hidden;

        .steps {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 6rem;
            background: white;
            box-sizing: border-box;
            position: relative;

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

        .edit-erea {
            width: 100%;
            flex: 1;
            border: 1px solid #dfe8f7;
            border-top: 6px solid #6d89fd;
            box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.08);
            position: relative;
            > div {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
        }
    }
    .bottom {
        flex-shrink: 0;
        width: 100%;
        height: 4.75rem;
        display: flex;
        align-items: center;
        justify-content: center;

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
