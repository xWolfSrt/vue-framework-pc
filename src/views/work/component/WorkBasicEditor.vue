<template>
    <div class="work-basic-editor">
        <div class="part">
            <div class="part-left">
                <!-- <span class="must">*</span> -->
                <span class="name">缩略图：</span>
            </div>
            <div class="part-right">
                <el-upload
                    ref="upload"
                    class="upload-thumbnail"
                    action="#"
                    accept="image/png, image/jpeg"
                    :auto-upload="false"
                    :on-change="thumbnailClick"
                    :show-file-list="false"
                >
                    <div class="thumbnail">
                        <div class="empty" v-if="!data.photo.thumbnail">
                            <img :src="getAssetsFile('work/common/icon_add_picture.png')" />
                        </div>
                        <img :src="data.photo.thumbnail" v-if="data.photo.thumbnail" />
                        <img
                            :src="getAssetsFile('work/question/icon_remove_picture.png')"
                            v-if="data.photo.thumbnail"
                            @click.stop="removeThumbnail"
                        />
                    </div>
                </el-upload>
            </div>
        </div>
        <div class="part">
            <div class="part-left">
                <span class="must">*</span>
                <span class="name">标题名称：</span>
            </div>
            <div class="part-right">
                <el-input v-model="data.input.title" placeholder="请输入" maxLength="100" clearable />
            </div>
        </div>

        <div class="part">
            <div class="part-left">
                <span class="must">*</span>
                <span class="name">考核日期：</span>
            </div>
            <div class="part-right">
                <div class="period">
                    <el-date-picker v-model="data.input.start" type="date" placeholder="请选择" :disabled-date="disabledDate" />

                    <!-- <div class="split"></div>
                <nz-date-picker [(ngModel)]="input.end" (ngModelChange)="onEndChange($event)"></nz-date-picker> -->
                </div>
            </div>
        </div>
        <div class="part">
            <div class="part-left">
                <!-- <span class="must">*</span> -->
                <span class="name">备注：</span>
            </div>
            <div class="part-right">
                <el-input v-model="data.input.remark" placeholder="请输入" maxLength="100" clearable />
            </div>
        </div>
        <div class="part">
            <div class="part-left">
                <!-- <span class="must">*</span> -->
                <span class="name">上传附件：</span>
            </div>
            <div class="part-right">
                <div class="file-container" v-if="data.isAddFileShow">
                    <el-upload
                        ref="upload"
                        class="upload-thumbnail"
                        action="#"
                        :accept="data.fileFiltersStr"
                        :auto-upload="false"
                        :on-change="addFile"
                        :show-file-list="false"
                    >
                        <div class="add">
                            <img :src="getAssetsFile('work/common/icon_add_file.png')" />
                            <span>添加附件</span>
                        </div>
                    </el-upload>
                    <span v-if="data.fileList.length == 0">无附件</span>
                    <div class="file" v-for="(file, i) in data.fileList" :key="i">
                        <img :src="getAssetsFile(file.icon)" />
                        <div>
                            <span>{{ file.name }}</span>
                            <span>{{ file.sizeText }}</span>
                        </div>
                        <div></div>
                        <button @click="removeFile(i)">删除</button>
                    </div>
                    <span>仅支持以下格式：{{ data.fileFilters.join('，') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import getAssetsFile from '../../../utils/pub-use'
import globalService from '../../../utils/global-service'
import pictureService from '../../../utils/picture-service'
import fileUpload from '../../../utils/file/file-upload'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()
defineProps(['captcha', 'directory'])
const data = reactive({
    photo: {},
    input: {},
    fileList: [],
    isAddFileShow: true,
    fileFilters: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg'],
    fileFiltersStr:
        'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/png, image/jpeg',
})

let captcha
let directory
onMounted(() => {
    captcha = proxy.$props.captcha
    directory = proxy.$props.directory
})

const removeThumbnail = () => {
    data.photo = {}
}
const thumbnailClick = (file) => {
    console.log(file)

    let options = {
        server: 'cowx-gsdl-server',
        directory: `${directory}/${captcha}`,
    }
    // showLoading('加载中')
    fileUpload
        .cosUpload(file.raw, options)
        .then((result) => {
            //  this.zwPopup.hideLoading()
            data.photo = {
                url: result.url,
                thumbnail: result.url && pictureService.compressPicture(result.url, { width: 412, height: 146 }),
            }
        })
        .catch((err) => {
            console.log(err)
            ElMessage.error('加载失败')
        })
}
const addFile = (file) => {
    console.log(file)

    let options = {
        server: 'cowx-gsdl-server',
        directory: `${directory}/${captcha}`,
    }

    fileUpload
        .cosUpload(file.raw, options)
        .then((result) => {
            //  this.zwPopup.hideLoading()

            console.log('success url:', result.url)
            console.log('success name:', result.name)
            console.log('success size:', result.size)
            // vm.hideLoading()
            let property = globalService.getFileProperty(result.url)
            let fileIcon = property.icon
            let fileType = property.type
            data.fileList.push({
                icon: fileIcon,
                name: decodeURI(result.name),
                type: fileType,
                size: result.size,
                sizeText: globalService.fileSizeChange(result.size),
                url: result.url,
            })
        })
        .catch((err) => {
            console.log(err)
            ElMessage.error('加载失败')
        })
}
const removeFile = (i) => {
    data.fileList.splice(i, 1)
}
const disabledDate = (time) => {
    // // 禁止选择过去日期（不能选择今天）
    // time.getTime() < Date.now()
    // // 禁止选择过去日期（可以选择今天）
    // time.getTime() < Date.now() - 24 * 60 * 60 * 1000
    // // 禁止选择未来日期（不能选择今天）
    // time.getTime() > Date.now() - 24 * 60 * 60 * 1000
    // // 禁止选择未来日期（可以选择今天）
    // time.getTime() > Date.now()

    return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const setContent = (item) => {
    // this.input.title = item.title
    // this.input.remark = item.remark
    // if (item.time) {
    //     // let start = this.dateService.convert(item.time)
    //     // if (start.getTime() >= new Date().getTime()) {
    //     this.input.start = this.dateService.convert(item.time)
    //     // }
    // }
    // let url = item.photo && this.pictureService.toPicture(item.photo)
    // this.photo = {
    //     url: url,
    //     thumbnail: url && this.compressPicture(url, 412, 146, true),
    // }
    // this.fileList = item.file || []
}
const getContent = (checkEmpty) => {
    // let title = (this.input.title && this.trimStr(this.input.title)) || ''
    // let remark = (this.input.remark && this.trimStr(this.input.remark)) || ''
    // if (checkEmpty && !title) {
    //     this.zwPopup.toast('请输入标题名称')
    //     return
    // }
    // if (checkEmpty && !this.input.start) {
    //     this.zwPopup.toast('请选择考核日期')
    //     return
    // }
    // let start = this.dateService.convert(this.dateService.format(this.input.start, 'yyyy-MM-dd 23:59:59'))
    // let today = this.dateService.convert(this.dateService.format(new Date(), 'yyyy-MM-dd 00:00:00'))
    // if (checkEmpty && start.getTime() < today.getTime()) {
    //     this.zwPopup.toast('考核日期不能早于当前时间')
    //     return
    // }

    // let photo = this.photo.url && JSON.stringify([{ Category: null, Index: 0, Items: [this.photo.url] }])
    // let time = this.dateService.format(this.input.start, 'yyyy-MM-dd 23:59:59')
    // let item = {
    //     title: title,
    //     photo: photo,
    //     time: time,
    //     remark: remark,
    //     file: this.getUplpadFiles(),
    // }
    return item
}

const getUplpadFiles = () => {
    // let result
    // if (this.fileList && this.fileList.length > 0) {
    //     let files = this.fileList.map((item) => {
    //         return {
    //             name: item.name,
    //             path: item.url,
    //             size: item.size,
    //         }
    //     })
    //     result = JSON.stringify(files)
    // }
    // return result
}
</script>
<style lang="scss" scoped>
.work-basic-editor {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 1.375rem 4.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    background: white;

    .part {
        flex-shrink: 0;
        width: 100%;
        display: flex;
        margin: 0.5625rem 0;
        line-height: 1;
        .part-left {
            margin-top: 0.4375rem;
            flex-shrink: 0;
            width: 5.8125rem;
            display: flex;
            justify-content: flex-end;
            margin-right: 0.5rem;

            .must {
                flex-shrink: 0;
                font-size: 0.8125rem;
                color: #ff5127;
                margin-right: 0.3125rem;
            }
            .name {
                font-size: 0.8125rem;
                color: #272f53;
            }
        }
        .part-right {
            flex: 1;

            input {
                border-radius: 4px;
            }
            .thumbnail {
                width: 12.875rem;
                height: 4.5625rem;
                background: #f5f6f8;
                border: 1px dashed #e6e6e6;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;

                .empty {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    img {
                        width: 1.5rem;
                        height: 1.5rem;
                    }
                }

                > img:nth-of-type(1) {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                    // animation: fadeIn 0.8s ease-in;
                    // -webkit-animation-fill-mode: forwards;
                    // animation-fill-mode: forwards;
                }

                > img:nth-of-type(2) {
                    background: rgba(0, 0, 0, 0.6);
                    width: 0.5rem;
                    height: 0.5rem;
                    padding: 0.3125rem;
                    box-sizing: content-box;
                    position: absolute;
                    right: 0;
                    top: 0;
                    cursor: pointer;
                }
            }

            .period {
                display: flex;
                align-items: center;
                nz-date-picker {
                    flex: 1;
                    border-radius: 4px;
                }
                .split {
                    flex-shrink: 0;
                    margin: 0 0.3125rem;
                    width: 0.875rem;
                    height: 1px;
                    background: #aaaaaa;
                }
            }

            .file-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;

                .add {
                    display: flex;
                    align-items: center;
                    height: 2rem;
                    margin-bottom: 0.3125rem;
                    padding: 0 1rem;
                    box-sizing: content-box;
                    cursor: pointer;

                    &:active {
                        background: #f9f9f9;
                    }

                    img {
                        width: 0.6875rem;
                        height: 0.6875rem;
                        margin-right: 0.5rem;
                    }

                    span {
                        color: #2970f5;
                        font-size: 0.75rem;
                    }
                }

                > span {
                    margin: 0.375rem 1.125rem 0.375rem;
                    color: #c5c5c5;
                    font-size: 0.875rem;
                    word-break: break-all;
                }
                .file {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    margin: 0.1875rem 0;
                    width: 100;
                    height: 3.8125rem;
                    background: #f9f9f9;
                    border: 1px solid #d3dbe8;
                    border-radius: 4px;
                    img {
                        flex-shrink: 0;
                        width: 2.3125rem;
                        height: auto;
                        margin: 0 0.75rem 0 0.5rem;
                    }
                    div:nth-of-type(1) {
                        flex: 1;
                        display: flex;
                        flex-direction: column;

                        span:nth-of-type(1) {
                            font-size: 0.875rem;
                            font-weight: bold;
                            color: #262626;
                            word-break: break-all;
                            line-height: 1.25rem;

                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                        }
                        span:nth-of-type(2) {
                            margin-top: 0.25rem;
                            font-size: 0.75rem;
                            color: #919eb5;
                        }
                    }

                    div:nth-of-type(2) {
                        flex-shrink: 0;
                        width: 1px;
                        height: 0.6875rem;
                        background: #d9d9d9;
                        margin: 0 0 0 0.75rem;
                    }
                    button {
                        width: 3.4375rem;
                        height: 3.4375rem;
                        background: #f9f9f9;
                        border: none;
                        line-height: 3.4375rem;
                        color: #2292f2;
                        cursor: pointer;

                        &::after {
                            border: none;
                        }
                        &:active {
                            background: #f9f9f9;
                        }
                    }
                }
            }
        }
    }
}
</style>
