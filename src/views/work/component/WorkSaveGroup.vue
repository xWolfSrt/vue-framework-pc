<template>
    <el-dialog v-model="data.isVisible" title="保存群组" width="438px" :before-close="handleCancel" :close-on-click-modal="false">
        <div class="modal-add-group">
            <el-input v-model="data.input.name" placeholder="请输入群组名称" maxLength="100" clearable />
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleCancel" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="handleOk" :icon="Check" style="width: 110px" :loading="data.isAddGroupLoading"
                    >确定</el-button
                >
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'
import { Close, Check } from '@element-plus/icons-vue'
import getAssetsFile from '../../../utils/pub-use'
import scopeService from '../../../api/scope'
import globalService from '../../../utils/global-service'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
const props = defineProps(['visible', 'content'])

const emits = defineEmits(['closeClick'])

const data = reactive({
    isVisible: false,
    isAddGroupLoading: false,
    input: {},
    content: '',
})
watch(
    () => props.visible,
    (now, pre) => {
        data.isVisible = now
        console.log('change visible', now, pre)
    }
)
watch(
    () => props.content,
    (now, pre) => {
        data.content = now
        console.log('change content', now, pre)
    }
)
const handleOk = () => {
    let name = (data.input.name && globalService.trimStr(data.input.name)) || ''
    if (!name) {
        ElMessage.error('请输入群组名称')
        return
    }
    let account = proxy.$storage.get('currentAccount')
    let selectedOrganization = proxy.$storage.get('selectedOrganization')

    let item = {
        name: name,
        config: data.content,
        account: account.account,
        organization: selectedOrganization.id,
    }
    data.isAddGroupLoading = true

    scopeService
        .add([item])
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
const saveSuccess = () => {
    console.log('saveSuccess')
    ElMessage.success('群组已保存')
    handleCancel()
}
const saveError = (msg) => {
    ElMessage.error(msg || '保存失败')
    handleCancel()
    console.log('saveError')
}

const handleCancel = () => {
    data.input.name = ''
    data.isAddGroupLoading = false
    emits('closeClick')
}
</script>
<style lang="scss" scoped>
.modal-add-group {
    width: 100%;
    height: 9rem;
    display: flex;
    align-items: flex-start;
    padding: 1.875rem 1.5rem;
    box-sizing: border-box;
}
</style>
