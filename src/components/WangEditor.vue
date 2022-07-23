<template>
    <div id="wang-editor">
        <Toolbar style="flex-shrink: 0" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
        <Editor
            style="flex: 1; overflow-y: auto"
            v-model="data.content"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
        />
    </div>
</template>
<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, reactive, shallowRef, getCurrentInstance, onMounted, onUnmounted, nextTick } from 'vue'
import { DomEditor } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import globalService from '../utils/global-service'
import fileUpload from '../utils/file/file-upload'

defineProps(['directory', 'captcha', 'content'])
const { proxy } = getCurrentInstance()
const data = reactive({
    directory: undefined,
    captcha: undefined,
    content: '',
})

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const mode = ref('default')
const toolbarConfig = {
    excludeKeys: ['group-more-style', 'fontFamily', 'todo', 'codeBlock', 'fullScreen', 'insertTable'],
}
const editorConfig = { placeholder: '请输入内容...', MENU_CONF: {} }

editorConfig.MENU_CONF['uploadImage'] = {
    async customUpload(file, insertFn) {
        let captcha = data.captcha || globalService.getGuid()
        let options = {
            server: 'cowx-gsdl-server',
            directory: `${data.directory}/${captcha}`,
        }
        fileUpload
            .cosUpload(file, options)
            .then((result) => {
                insertFn(result.url)
            })
            .catch((err) => {
                console.log(err)
                // ElMessage.error('加载失败')
            })
    },
}

editorConfig.MENU_CONF['uploadVideo'] = {
    async customUpload(file, insertFn) {
        let captcha = data.captcha || globalService.getGuid()
        let options = {
            server: 'cowx-gsdl-server',
            directory: `${data.directory}/${captcha}`,
        }
        fileUpload
            .cosUpload(file, options)
            .then((result) => {
                insertFn(result.url)
            })
            .catch((err) => {
                console.log(err)
                // ElMessage.error('加载失败')
            })
    },
}
onMounted(() => {
    data.directory = proxy.$props.directory
    data.captcha = proxy.$props.captcha
    data.content = proxy.$props.content
})

const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要！

    nextTick(() => {
        let toolbar = DomEditor.getToolbar(editor)
        console.log('`````````````', toolbar)
        const curToolbarConfig = toolbar.getConfig()
        console.log(curToolbarConfig.toolbarKeys) // 当前菜单排序和分组
    })

    console.log(editor.getAllMenuKeys()) // 当前菜单排序和分组
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})
onUnmounted(() => {})

const getContent = () => {
    const editor = editorRef.value
    if (editor == null) return
    return editor.getHtml()
}

const setContent = (content) => {
    if (!content) {
        content = ''
    }
    data.content = content

    const editor = editorRef.value
    if (editor == null) return
    editor.setHtml(content)
}
defineExpose({
    setContent,
    getContent,
})
</script>
<style lang="scss" scoped>
#wang-editor {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid #ccc;

    // ::ng-deep .w-e-toolbar {
    //     flex-shrink: 0;
    // }
    // ::ng-deep .w-e-text-container {
    //     height: auto;
    //     flex: 1;
    // }
}
</style>
