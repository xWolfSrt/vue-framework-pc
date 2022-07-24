<template>
    <div class="work-question-editor">
        <div class="left">
            <span>添加题目</span>
            <div id="type" class="type-list">
                <div class="type-item" v-for="(item, i) in data.typeList" :key="i" @click="typeClick(i)">
                    <!-- <div class="custom-type-placeholder"></div> -->
                    <img :src="getAssetsFile(item.icon)" />
                    <span>{{ item.name }}</span>
                    <img :src="getAssetsFile('work/question/icon_add_type.png')" />
                </div>
            </div>
        </div>
        <div class="center">
            <div id="group-empty" class="group-empty" v-if="data.list.length == 0">
                <span> 点击左侧的题型 或把题型拖入此区域</span>
            </div>
            <div class="add-group" v-if="data.list.length > 0" @click="addGroup">
                <span>添加分组</span>
            </div>
            <div class="center-list" v-if="data.list.length > 0">
                <div class="center-item" v-for="(item, i) in data.list" :key="i">
                    <!-- <div class="custom-group-placeholder"></div> -->
                    <!-- <div class="custom-group-preview">{{ item.name }}</div> -->
                    <div class="group">
                        <span>{{ item.name }}</span>
                        <img :src="getAssetsFile('work/question/icon_edit.png')" @click="editGroup(i)" />
                        <img :src="getAssetsFile('work/question/icon_drag_group.png')" />
                        <img :src="getAssetsFile('work/question/icon_remove_group.png')" @click="removeGroup(i)" />
                    </div>
                    <div :id="item.id" class="children" :class="{ dragging: data.isCdkDragChildStarted }">
                        <div
                            class="child"
                            :class="{ selected: child.selected }"
                            v-for="(child, j) in item.children"
                            :key="j"
                            @click="childClick(i, j)"
                        >
                            <!-- <div class="custom-child-placeholder"></div>
                            <div class="custom-child-preview">{{ child.name || '题目名称' + (j + 1) }}</div> -->
                            <div class="child-head" :class="{ unselected: !child.selected }">
                                <span :style="{ visibility: child.must ? 'visible' : 'hidden' }">*</span>
                                <span>{{ j + 1 }}.</span>
                                <el-input v-model="child.name" :placeholder="'题目名称' + (j + 1)" maxLength="100" clearable />
                                <img
                                    class="child-drag"
                                    :class="{ selected: child.selected }"
                                    :src="getAssetsFile('work/question/icon_drag_group.png')"
                                />
                                <img
                                    class="child-remove"
                                    :class="{ selected: child.selected }"
                                    :src="getAssetsFile('work/question/icon_remove_group.png')"
                                    @click="removeChild(i, j)"
                                />
                            </div>

                            <template v-if="child.type == 'text-single' || child.type == 'text-multiple'">
                                <div class="choose single">
                                    <div
                                        class="selection"
                                        :class="{ unselected: !child.selected }"
                                        v-for="(selection, k) in child.selections"
                                        :key="k"
                                    >
                                        <img class="selection-drag" :src="getAssetsFile('work/question/icon_drag_child.png')" />
                                        <!-- <nz-input-group
                                        [nzPrefix]="child.type == 'text-single' ? prefixSingle : prefixMultiple"
                                    >
                                    </nz-input-group> -->
                                        <el-input v-model="selection.name" :placeholder="' 选项' + (k + 1)" maxLength="100" clearable>
                                            <template #prefix>
                                                <div class="prefix-single" v-if="child.type == 'text-single'"></div>
                                                <div class="prefix-multiple" v-else></div>
                                            </template>
                                            <template #suffix>
                                                <span
                                                    class="selection-other-tag"
                                                    v-if="selection.editable && child.selected"
                                                    :style="{
                                                        height: '1.375rem',
                                                        'line-height': '1.375rem',
                                                        background: '#F7F8FA',
                                                        border: '1px solid #dedede',
                                                        'margin-left': '.5rem',
                                                        'font-size': '.75rem',
                                                        padding: '0 .5rem',
                                                        'text-align': 'center',
                                                        color: ' #A1A1A1',
                                                    }"
                                                    >允许填空</span
                                                >
                                            </template>
                                        </el-input>

                                        <!-- <ng-template #prefixSingle><div class="prefix-single"></div></ng-template>
                                    <ng-template #prefixMultiple><div class="prefix-multiple"></div></ng-template>
                                    <ng-template #inputClearTpl>
                                        <span
                                            class="selection-other-tag"
                                            v-if="selection.editable && child.selected"
                                            :style="{
                                                height: '1.375rem',
                                                background: '#F7F8FA',
                                                border: '1px solid #dedede',
                                                'margin-left': '.5rem',
                                                'font-size': '.75rem',
                                                padding: '0 .5rem',
                                                'text-align': 'center',
                                                color: ' #A1A1A1',
                                                'line-heigth': '1.375rem'
                                            }"
                                            >允许填空</span
                                        >
                                
                                    </ng-template> -->
                                        <img
                                            class="selection-remove"
                                            :class="{ selected: child.selected }"
                                            :src="getAssetsFile('work/question/icon_remove_selection.png')"
                                            @click="removeSelection(i, j, k)"
                                        />
                                    </div>
                                </div>
                            </template>

                            <template v-if="child.type == 'text-question'">
                                <div class="question">
                                    <div>内容</div>
                                </div>
                            </template>
                            <template v-if="child.type == 'picture-single' || child.type == 'picture-multiple'">
                                <div class="picture">
                                    <!-- <nz-list nzGrid>
                                    <div nz-row [nzGutter]="12">
                                        <div
                                            nz-col
                                            [nzXXl]="3"
                                            [nzXl]="6"
                                            [nzLg]="6"
                                            [nzMd]="6"
                                            [nzSm]="6"
                                            [nzXs]="6"
                                            *ngFor="let selection of child.selections; let k = index"
                                        >
                                            <nz-list-item>
                                                <div class="picture-item" :class="{ unselected: !child.selected }">
                                                    <div class="photo">
                                                        <img [src]="selection.thumbnail" @click="pickPhoto(i, j, k)" />
                                                        <img
                                                            :src="getAssetsFile('work/question/icon_remove_picture.png')"
                                                            @click="removeSelection(i, j, k)"
                                                        />
                                                    </div>
                                                    <nz-input-group
                                                        [nzPrefix]="child.type == 'picture-single' ? prefixSingle : prefixMultiple"
                                                    >
                                                        <textarea
                                                            nz-input
                                                            [placeholder]="'选项' + (k + 1)"
                                                            [nzAutosize]="{ minRows: 1, maxRows: 10 }"
                                                            [(ngModel)]="selection.name"
                                                            maxlength="100"
                                                        ></textarea>
                                                    </nz-input-group>
                                                    <ng-template #prefixSingle>
                                                        <div class="prefix-single">
                                                            <div></div>
                                                        </div>
                                                    </ng-template>
                                                    <ng-template #prefixMultiple>
                                                        <div class="prefix-multiple">
                                                            <div></div>
                                                        </div>
                                                    </ng-template>
                                                </div>
                                            </nz-list-item>
                                        </div>
                                        <div nz-col [nzXXl]="3" [nzXl]="6" [nzLg]="6" [nzMd]="6" [nzSm]="6" [nzXs]="6">
                                            <nz-list-item>
                                                <div class="add-photo" @click="addPictureItem(i, j)">
                                                    <img :src="getAssetsFile('work/question/icon_add_picture.png')" />
                                                    <span>上传图片</span>
                                                </div>
                                            </nz-list-item>
                                        </div>
                                    </div>
                                </nz-list> -->
                                </div>
                            </template>
                            <div
                                class="child-bottom"
                                v-if="(child.type == 'text-single' || child.type == 'text-multiple') && child.selected"
                            >
                                <div @click="addSingleSelection(i, j)">
                                    <img :src="getAssetsFile('work/question/icon_add_option.png')" />
                                    <span>添加单个选项</span>
                                </div>
                                <div @click="addMultipleSelection(i, j)">
                                    <img :src="getAssetsFile('work/question/icon_add_options.png')" />
                                    <span>批量添加选项</span>
                                </div>
                                <div @click="addOtherSelection(i, j)" v-if="!data.isVote">
                                    <img :src="getAssetsFile('work/question/icon_add_option.png')" />
                                    <span>添加【允许填空】选项</span>
                                </div>
                            </div>
                        </div>
                        <div
                            class="children-empty"
                            :class="{ selected: item.selected }"
                            v-if="item.children.length == 0"
                            @click="groupClick(i)"
                        >
                            点击左侧的题型 或把题型拖入此区域
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- :style="{ visibility: selectedIndex.j != -1 ? 'visible' : 'hidden' }"  -->
        <div class="right" :class="{ show: data.selectedIndex.j != -1 }">
            <div class="right-content" v-if="data.selectedIndex.i != -1 && data.selectedIndex.j != -1">
                <span>题目设置</span>
                <div class="must">
                    <span>此题必填</span>

                    <el-switch v-model="data.list[data.selectedIndex.i].children[data.selectedIndex.j].must" />
                </div>
                <!-- <div class="type" v-if="list[selectedIndex.i].children[selectedIndex.j].type == 'picture'">
                <span>题型</span>
                <div class="type-switch">
                    <div
                        :class="{ selected: !list[selectedIndex.i].children[selectedIndex.j].pictureMultiple }"
                        @click="list[selectedIndex.i].children[selectedIndex.j].pictureMultiple = false"
                    >
                        单选
                    </div>
                    <div
                        :class="{ selected: list[selectedIndex.i].children[selectedIndex.j].pictureMultiple }"
                        @click="list[selectedIndex.i].children[selectedIndex.j].pictureMultiple = true"
                    >
                        多选
                    </div>
                </div>
            </div> -->
                <div
                    class="limit"
                    v-if="
                        data.list[data.selectedIndex.i].children[data.selectedIndex.j].type == 'text-multiple' ||
                        data.list[data.selectedIndex.i].children[data.selectedIndex.j].type == 'picture-multiple'
                    "
                >
                    <span>可选范围</span>
                    <div class="select min">
                        <span>最少</span>
                        <!-- <nz-select
                        [(ngModel)]="list[selectedIndex.i].children[selectedIndex.j].min"
                        [compareWith]="compareFn"
                        [nzNotFoundContent]="'无可选项'"
                        (ngModelChange)="configMinChange($event)"
                        nzAllowClear
                        nzPlaceHolder="不限"
                    >
                        <nz-option
                            *ngFor="let option of list[selectedIndex.i].children[selectedIndex.j].minOptionList"
                            [nzValue]="option"
                            [nzLabel]="option.label"
                        ></nz-option>
                    </nz-select> -->
                    </div>
                    <div class="select max">
                        <span>最多</span>
                        <!-- <nz-select
                        [(ngModel)]="list[selectedIndex.i].children[selectedIndex.j].max"
                        [compareWith]="compareFn"
                        [nzNotFoundContent]="'无可选项'"
                        (ngModelChange)="configMaxChange($event)"
                        nzAllowClear
                        nzPlaceHolder="不限"
                    >
                        <nz-option
                            *ngFor="let option of list[selectedIndex.i].children[selectedIndex.j].maxOptionList"
                            [nzValue]="option"
                            [nzLabel]="option.label"
                        ></nz-option>
                    </nz-select> -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <el-dialog v-model="data.isAddGroupVisible" :title="data.isAddGroup ? '添加分组' : '修改分组名称'" width="438px">
        <div class="modal-add-group">
            <el-input v-model="data.input.group" placeholder="请输入分组名称" maxLength="100" clearable />
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeAddGroup" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="confirmAddGroup" :icon="Check" style="width: 110px">确定</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="data.isAddSelectionVisible" title="批量添加选项" width="600px">
        <div class="modal-add-selection">
            <span>每行代表一个选项，可以添加多个选项</span>

            <el-input v-model="data.input.content" :rows="12" resize="none" type="textarea" placeholder="请输入" maxlength="200" />
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeAddSelection" :icon="Close" style="width: 110px">取消</el-button>
                <el-button type="primary" @click="confirmAddSelection" :icon="Check" style="width: 110px">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import { Close, Check } from '@element-plus/icons-vue'
import globalService from '../../../utils/global-service'
import pictureService from '../../../utils/picture-service'
import getAssetsFile from '../../../utils/pub-use'
const { proxy } = getCurrentInstance()
defineProps(['captcha', 'directory', 'isVote'])
const data = reactive({
    isVote: false,

    input: {},
    temp: {},
    typeList: [],

    list: [],
    groupId: ['group-empty'], //用于关联拖动列表
    //当前选中的光标位置
    selectedIndex: {
        i: -1,
        j: -1,
    },

    isCdkDragChildStarted: false,
    input: {},
    isAddGroupVisible: false,
    isAddGroup: true,

    isAddSelectionVisible: false,
})

let captcha
let directory
onMounted(() => {
    captcha = proxy.$props.captcha
    directory = proxy.$props.directory
    data.isVote = proxy.$props.isVote || false

    data.typeList = data.isVote
        ? [
              { code: 'text-single', icon: 'work/question/icon_type_single.png', name: '文本单选题' },
              { code: 'text-multiple', icon: 'work/question/icon_type_multiple.png', name: '文本多选题' },
              { code: 'picture-single', icon: 'work/question/icon_type_picture.png', name: '图片单选题' },
              { code: 'picture-multiple', icon: 'work/question/icon_type_picture.png', name: '图片多选题' },
          ]
        : [
              { code: 'text-single', icon: 'work/question/icon_type_single.png', name: '文本单选题' },
              { code: 'text-multiple', icon: 'work/question/icon_type_multiple.png', name: '文本多选题' },
              { code: 'text-question', icon: 'work/question/icon_type_question.png', name: '文本问答题' },
              { code: 'picture-single', icon: 'work/question/icon_type_picture.png', name: '图片单选题' },
              { code: 'picture-multiple', icon: 'work/question/icon_type_picture.png', name: '图片多选题' },
          ]
})

const typeClick = (i) => {
    let item = data.typeList[i]
    let newItem = initItemByCode(item.code)
    //如果当前列表为空，则添加默认分组
    if (data.list.length == 0) {
        data.list.push({
            id: globalService.getGuid(),
            name: '默认分组',
            selected: true,
            children: [newItem],
        })
        data.selectedIndex = {
            i: 0,
            j: 0,
        }
        updateGroupId()
    } else {
        // 根据当前选中的位置，插入新题目
        if (data.selectedIndex.j == -1) {
            //如果选择的分组中没有题目,则直接向该分组中添加题目
            data.list[data.selectedIndex.i].children.push(newItem)
            data.selectedIndex.j = 0
        } else {
            //否则插入到下一条
            data.list[data.selectedIndex.i].children[data.selectedIndex.j].selected = false //取消上一个的选中状态
            data.list[data.selectedIndex.i].children.splice(data.selectedIndex.j + 1, 0, newItem) //添加新题目
            data.selectedIndex.j += 1
        }
    }
}

const initItemByCode = (code) => {
    let newItem
    switch (code) {
        case 'text-single':
        case 'text-multiple':
            newItem = {
                type: code,
                selected: true,
                must: true,
                min: null,
                max: null,
                minOptionList: [
                    { label: '不限', value: -1 },
                    { label: '1', value: 1 },
                    { label: '2', value: 2 },
                    { label: '3', value: 3 },
                ],
                maxOptionList: [
                    { label: '不限', value: -1 },
                    { label: '1', value: 1 },
                    { label: '2', value: 2 },
                    { label: '3', value: 3 },
                ],
                id: globalService.getGuid(),
                name: '',
                selections: [
                    {
                        id: globalService.getGuid(),
                        name: '',
                    },
                    {
                        id: globalService.getGuid(),
                        name: '',
                    },
                    {
                        id: globalService.getGuid(),
                        name: '',
                    },
                ],
            }
            break
        case 'text-question':
            newItem = {
                type: code,
                selected: true,
                must: true,
                id: globalService.getGuid(),
                name: '',
                content: '',
            }
            break
        case 'picture-single':
        case 'picture-multiple':
            newItem = {
                type: code,
                selected: true,
                must: true,
                min: null,
                max: null,
                minOptionList: [{ label: '不限', value: -1 }],
                maxOptionList: [{ label: '不限', value: -1 }],
                id: globalService.getGuid(),
                name: '',
                selections: [],
            }
            break
    }
    return newItem
}
const updateGroupId = () => {
    data.groupId = data.list.map((item) => {
        return item.id
    })
    data.groupId.unshift('group-empty')
}

const addGroup = () => {
    data.isAddGroup = true
    data.input.group = ''
    data.isAddGroupVisible = true
}
const confirmAddGroup = () => {
    let name = (data.input.group && globalService.trimStr(data.input.group)) || ''
    if (!name) {
        ElMessage.warning('请输入分组名称')
        return
    }
    if (data.isAddGroup) {
        let id = globalService.getGuid()
        let group = {
            id: id,
            name: name,
            selected: true,
            children: [],
        }
        data.list[data.selectedIndex.i].selected = false
        if (data.selectedIndex.j != -1) {
            data.list[data.selectedIndex.i].children[data.selectedIndex.j].selected = false //取消上一个的选中状态
        }
        data.list.splice(data.selectedIndex.i + 1, 0, group) //添加新题目
        data.selectedIndex = {
            i: data.selectedIndex.i + 1,
            j: -1,
        }
        updateGroupId()
    } else {
        data.list[data.temp.editGroupIndex].name = name
    }

    closeAddGroup()
}

const closeAddGroup = () => {
    data.input.group = ''
    data.isAddGroupVisible = false
}

const editGroup = (i) => {
    data.input.group = data.list[i].name
    data.temp.editGroupIndex = i
    data.isAddGroup = false
    data.isAddGroupVisible = true
}

const groupClick = (i) => {
    //取消之前组的选中
    data.list[data.selectedIndex.i].selected = false
    if (data.selectedIndex.j != -1) {
        data.list[data.selectedIndex.i].children[data.selectedIndex.j].selected = false //取消上一个组上一个题目的选中状态
    }
    data.list[i].selected = true
    data.selectedIndex = {
        i: i,
        j: -1,
    }
}
const removeGroup = (i) => {
    let list = data.list
    let isLast = i == list.length - 1 //当前删除的是否是最后一个分组
    list.splice(i, 1)
    //如果已经没有分组，则默认不选
    if (list.length == 0) {
        data.selectedIndex = {
            i: -1,
            j: -1,
        }
    } else {
        //如果删除的分组不是当前选中的分组，则更新位置
        if (data.selectedIndex.i != i) {
            for (let index = 0; index < list.length; index++) {
                let item = list[index]
                if (item.selected) {
                    data.selectedIndex.i = index
                }
            }
        } else {
            // 如果要删除的是最后一个分组，则选择上一个分组否则继续选择当前位置的分组
            if (isLast) {
                list[i - 1].selected = true
                data.selectedIndex.i -= 1
                //优先选择上一个分组的最后一个题目，如果没有题目，则选中分组

                //如果顺移后的分组没有题目，则默认选中分组
                let length = list[data.selectedIndex.i].children.length
                if (length == 0) {
                    data.selectedIndex.j = -1
                } else {
                    //否则选择最后一个题目
                    list[data.selectedIndex.i].children[length - 1].selected = true
                    data.selectedIndex.j = length - 1
                }
            } else {
                list[i].selected = true
                data.selectedIndex.i = i

                //如果顺移后的分组没有题目，则默认选中分组
                let length = list[data.selectedIndex.i].children.length
                if (length == 0) {
                    data.selectedIndex.j = -1
                } else {
                    //否则选择第一个题目
                    list[data.selectedIndex.i].children[0].selected = true
                    data.selectedIndex.j = 0
                }
            }
        }
    }
    updateGroupId()
}

const removeChild = (i, j) => {
    let children = data.list[i].children
    let isLast = j == children.length - 1 //当前删除的是否是分组中最后一个题目
    children.splice(j, 1)
    //如果当前选择的位置不在删除题目的组中，则不处理
    if (data.selectedIndex.i != i) {
        return
    }
    // 如果删除的不是当前选中的题目,更新选择位置
    if (data.selectedIndex.j != j) {
        for (let index = 0; index < children.length; index++) {
            let item = children[index]
            if (item.selected) {
                data.selectedIndex.j = index
            }
        }
    } else {
        //如果删除前只剩一个题目，则选中当前分组
        if (children.length == 0) {
            data.selectedIndex = {
                i: i,
                j: -1,
            }
        } else {
            // 如果要删除的是分组中最后一个题目，则选择上一个题目
            if (isLast) {
                children[j - 1].selected = true
                data.selectedIndex = {
                    i: i,
                    j: j - 1,
                }
            } else {
                children[j].selected = true
                data.selectedIndex = {
                    i: i,
                    j: j,
                }
            }
        }
    }
}
const removeSelection = (i, j, k) => {
    data.list[i].children[j].selections.splice(k, 1)
    updateMinMaxOptionList(i, j)
}
const addSingleSelection = (i, j) => {
    let child = data.list[i].children[j]
    let selections = child.selections

    let type = child.type
    selections.push({
        id: globalService.getGuid(),
        name: '',
    })
    if (type == 'text-multiple') {
        updateMinMaxOptionList(i, j)
    }
}
const addMultipleSelection = (i, j) => {
    data.temp.addSelectionGroup = i
    data.temp.addSelectionChild = j

    data.isAddSelectionVisible = true
}
const addOtherSelection = (i, j) => {
    let child = data.list[i].children[j]
    let selections = child.selections

    let type = child.type
    selections.push({
        id: globalService.getGuid(),
        editable: true,
        name: '其他',
    })
    if (type == 'text-multiple') {
        updateMinMaxOptionList(i, j)
    }
}
const closeAddSelection = () => {
    data.input.content = ''
    data.isAddSelectionVisible = false
}

const confirmAddSelection = () => {
    let content = (data.input.content && globalService.trimStr(`${data.input.content}`)) || ''
    if (!content) {
        ElMessage.warning('请输入内容')
        return
    }
    try {
        let list = content.split('\n')
        let i = data.temp.addSelectionGroup
        let j = data.temp.addSelectionChild
        let child = data.list[i].children[j]
        let selections = child.selections
        //检查当前选项内容是否都为空，如果是，则全部清除，使用批量添加的内容
        let isEmpty = true
        selections &&
            selections.forEach((item) => {
                let value = (item.name && globalService.trimStr(`${item.name}`)) || ''
                if (value) {
                    isEmpty = false
                }
            })

        if (isEmpty) {
            selections = []
        }
        list.forEach((item) => {
            if (item) {
                selections.push({
                    id: globalService.getGuid(),
                    name: item,
                })
            }
        })
        child.selections = selections

        let type = child.type
        if (type == 'text-multiple') {
            updateMinMaxOptionList(i, j)
        }
    } catch (error) {
        console.log(error)
    }
    closeAddSelection()
}
const childClick = (i, j) => {
    data.list.forEach((group, gindex) => {
        group.selected = gindex == i //选择该分组
        group.children.forEach((child, cindex) => {
            child.selected = i == gindex && j == cindex //选择该题目
        })
    })
    data.selectedIndex = {
        i: i,
        j: j,
    }
}

const addPictureItem = (i, j) => {
    // let captcha = this.captcha
    // let directory = this.uploadDirectory
    // this.zwPhotoPicker.showPickerDirect(
    //     this,
    //     {
    //         start: () => {
    //             this.zwPopup.showLoading('加载中', true)
    //         },
    //         success: (url, name) => {
    //             console.log('success url:', url)
    //             console.log('success name:', name)
    //             this.zwPopup.hideLoading()
    //             this.addPictureSelection(i, j, url)
    //         },
    //         fail: (msg) => {
    //             console.log('fail msg', msg)
    //             this.zwPopup.hideLoading()
    //             this.zwPopup.toast(msg || '加载失败')
    //         },
    //         progress: (progress) => {},
    //     },
    //     {
    //         server: this.constantService.cos.server,
    //         directory: `${directory}/${captcha}`,
    //     },
    //     new ZwPhotoPickerConfig(false)
    // )
}
const addPictureSelection = (i, j, url) => {
    let child = data.list[i].children[j]
    let selections = child.selections

    let type = child.type
    selections.push({
        id: globalService.getGuid(),
        name: '',
        thumbnail: pictureService.compressPicture(url, { width: 268 }),
        url: url,
    })
    if (type == 'picture-multiple') {
        updateMinMaxOptionList(i, j)
    }
}
const pickPhoto = (i, j, k) => {
    // let captcha = this.temp.captcha
    // let directory = this.uploadDirectory
    // this.zwPhotoPicker.showPickerDirect(
    //     this,
    //     {
    //         start: () => {
    //             this.zwPopup.showLoading('加载中', true)
    //         },
    //         success: (url, name) => {
    //             console.log('success url:', url)
    //             console.log('success name:', name)
    //             this.zwPopup.hideLoading()
    //             this.modifyPhoto(i, j, k, url)
    //         },
    //         fail: (msg) => {
    //             console.log('fail msg', msg)
    //             this.zwPopup.hideLoading()
    //             this.zwPopup.toast(msg || '加载失败')
    //         },
    //         progress: (progress) => {},
    //     },
    //     {
    //         server: this.constantService.cos.server,
    //         directory: `${directory}/${captcha}`,
    //     },
    //     new ZwPhotoPickerConfig(false)
    // )
}

const modifyPhoto = (i, j, k, url) => {
    let child = data.list[i].children[j]
    let selection = child.selections[k]

    let type = child.type
    selection.thumbnail = pictureService.compressPicture(url, { width: 268 })
    selection.url = url
}
const configMinChange = (event) => {
    console.log('configMinChange', event)

    let value = event.value
    let item = data.list[data.selectedIndex.i].children[data.selectedIndex.j]
    let min = (item.min && item.min.value) || 0
    let max = (item.max && item.max.value) || 0

    //如果选择的最小值，大于或等于之前选择的最大值，则清空已选的最大值，并更新最大值 可选列表
    if (value > max) {
        item.max = null
    }
    // 最小选择不限时
    let length = item.selections.length
    if (value == -1) {
        value = 1
    }
    let option = [{ label: '不限', value: -1 }]
    for (let index = value; index <= length; index++) {
        let v = index
        option.push({ label: `${v}`, value: v })
    }
    item.maxOptionList = option
}
const configMaxChange = (event) => {
    console.log('configMaxChange', event)
}
const configMustChange = (event) => {
    console.log('configMustChange', event)
}

const updateMinMaxOptionList = (i, j) => {
    //当题目选项发生变化时，更新最小最大选项列表
    let item = data.list[i].children[j]
    // let length = item.selections.length
    // let min = (item.min && item.min.value) || -1
    // let max = (item.max && item.max.value) || -1
    // if (min > length || length == 0) {
    //     item.min = null
    //     min = -1
    // }
    // if (max > length || length == 0) {
    //     item.max = null
    //     max = -1
    // }
    // let minOption = [{ label: '不限', value: -1 }]
    // let maxOption = [{ label: '不限', value: -1 }]
    // for (let index = 1; index <=length; index++) {
    //     let v = index
    //     if (index <= length) {
    //         minOption.push({ label: `${v}`, value: v })
    //     }

    //     if (index <= length && index >= min) {
    //         maxOption.push({ label: `${v}`, value: v })
    //     }
    // }
    // item.minOptionList = minOption
    // item.maxOptionList = maxOption
    updateMinMaxOption(item)
}

const updateMinMaxOption = (item) => {
    let length = item.selections.length
    let min = (item.min && item.min.value) || -1
    let max = (item.max && item.max.value) || -1
    if (min > length || length == 0) {
        item.min = null
        min = -1
    }
    if (max > length || length == 0) {
        item.max = null
        max = -1
    }
    let minOption = [{ label: '不限', value: -1 }]
    let maxOption = [{ label: '不限', value: -1 }]
    for (let index = 1; index <= length; index++) {
        let v = index
        if (index <= length) {
            minOption.push({ label: `${v}`, value: v })
        }

        if (index <= length && index >= min) {
            maxOption.push({ label: `${v}`, value: v })
        }
    }
    item.minOptionList = minOption
    item.maxOptionList = maxOption
}

//如果需要检查是否为空，则只检查文本单选/多选题的标题是否为空
//如果是发布，将删除未设置选项名称的选项
const getContent = (checkEmpty, isPublish = false) => {
    let list = []

    for (let i = 0; i < data.list.length; i++) {
        let group = data.list[i]

        let fields = []
        let children = group.children

        for (let j = 0; j < children.length; j++) {
            let child = children[j]
            // if (checkEmpty && !child.name) {
            //     this.zwPopup.toast(`分组：${group.name}，第${j + 1}题，题目名称不能为空`)
            //     return
            // }
            let category = getCategory(child.type)
            if (category) {
                let title = child.name || `题目名称${j + 1}`
                let config = {
                    must: child.must,
                }
                let options = []
                let blanks = []
                switch (child.type) {
                    case 'text-single':
                    case 'text-multiple':
                        child.selections.forEach((selection, k) => {
                            //如果不是发布，则有没有名字都保存
                            // if (selection.name || !isPublish) {
                            let value = (selection.name && globalService.trimStr(`${selection.name}`)) || `选项${k + 1}`
                            options.push({
                                id: '',
                                title: value,
                            })
                            //可编辑选项
                            if (selection.editable) {
                                blanks.push({
                                    id: '',
                                    title: value,
                                })
                            }
                            // }
                        })
                        if (checkEmpty && checkSameOptions(options)) {
                            ElMessage.warning(`分组：${group.name}，第${j + 1}题，存在相同选项`)
                            return
                        }
                        if (child.min && child.min.value != -1) config.min = child.min.value
                        if (child.max && child.max.value != -1) config.max = child.max.value
                        break
                    case 'picture-single':
                    case 'picture-multiple':
                        child.selections.forEach((selection, k) => {
                            //如果不是发布，则有没有名字都保存
                            // if (selection.name || !isPublish) {
                            let value = (selection.name && globalService.trimStr(`${selection.name}`)) || `选项${k + 1}`
                            options.push({
                                id: '',
                                title: value,
                                config: JSON.stringify({ url: selection.url }),
                            })
                            // }
                        })
                        if (checkEmpty && checkSameOptions(options)) {
                            ElMessage.warning(`分组：${group.name}，第${j + 1}题，存在相同选项`)
                            return
                        }
                        if (child.min && child.min.value != -1) config.min = child.min.value
                        if (child.max && child.max.value != -1) config.max = child.max.value
                        break
                    case 'text-question':
                        blanks.push({
                            id: '',
                            title: title,
                        })
                        break
                }
                if (checkEmpty && child.type != 'text-question' && options.length == 0) {
                    ElMessage.warning(`分组：${group.name}，第${j + 1}题，选项列表不能为空`)
                    return
                }
                fields.push({
                    id: '',
                    title: title,
                    category: category,
                    options: options,
                    blanks: blanks,
                    config: JSON.stringify(config),
                })
            }
        }
        list.push({
            id: '',
            title: group.name,
            fields: fields,
        })
    }
    let draft = {
        id: '',
        groups: list,
    }
    return {
        draft: JSON.stringify(draft),
    }
}
const checkSameOptions = (options) => {
    let flag = false

    options.forEach((item) => {
        let title = item.title

        let t = options.filter((option) => {
            return title == option.title
        })
        if (t.length > 1) {
            flag = true
        }
    })
    return flag
}
const getCategory = (type) => {
    // let map = {
    //     'text-single': '29e3dd7b-1389-4caa-9dc9-0be79f3019c2', //UICategory_Selector
    //     'text-multiple': 'bc8ee0e4-3381-4cb5-a8d6-2bb8d52d6cce', //UICategory_Textbox
    //     'text-question': '728b8d17-eb56-4cc5-b8a2-9bcbb586bfac', //UICategory_Textarea
    //     'picture-single': '57e0461d-406e-46d4-9995-1c1700468f34', //UICategory_ImageUploader
    //     'picture-multiple': '3db9c4a5-1e0b-49e1-a825-a64af77f53d5', //UICategory_FileUploader
    // }
    let map = {
        'text-single': '29ec8436-fb93-455b-960b-01f241aa9214', //UICategory_SingleSelector_Text
        'text-multiple': '1c9f0526-7b4d-43f5-82ee-909fe9018c86', //UICategory_MultipleSelector_Text
        'text-question': 'ed0185dc-5353-4caf-b1a5-de07dbbdda8c', //UICategory_QuestionAnswer_Text
        'picture-single': 'cef38c08-bdc6-49ba-9c81-a12b2a4f916e', //UICategory_SingleSelector_Image
        'picture-multiple': 'aa9de250-796a-424e-b61c-69170bb9816b', //UICategory_MultipleSelector_Image
    }
    return map[type]
}
const getType = (category) => {
    let map = {
        '29ec8436-fb93-455b-960b-01f241aa9214': 'text-single', //UICategory_SingleSelector_Text
        '1c9f0526-7b4d-43f5-82ee-909fe9018c86': 'text-multiple', //UICategory_MultipleSelector_Text
        'ed0185dc-5353-4caf-b1a5-de07dbbdda8c': 'text-question', //UICategory_QuestionAnswer_Text
        'cef38c08-bdc6-49ba-9c81-a12b2a4f916e': 'picture-single', //UICategory_SingleSelector_Image
        'aa9de250-796a-424e-b61c-69170bb9816b': 'picture-multiple', //UICategory_MultipleSelector_Image
    }
    return map[category]
}
const setContent = (formInfo) => {
    if (!formInfo || !formInfo.draft) return

    let draft = JSON.parse(formInfo.draft)
    let groups = draft.groups || []

    let list = []

    groups.forEach((group) => {
        let children = []

        let fields = group.fields || []

        fields.forEach((field) => {
            let type = getType(field.category)

            let config = field.config && JSON.parse(field.config)
            let must, min, max

            if (config) {
                must = config.must || false
                min = config.min && { label: `${config.min}`, value: config.min }
                max = config.max && { label: `${config.max}`, value: config.max }
            }
            let options = field.options || []
            let blanks = field.blanks || []
            let selections = []

            options.forEach((option) => {
                switch (type) {
                    case 'text-single':
                    case 'text-multiple':
                        let editable = checkInBlanks(option.title, blanks)
                        selections.push({
                            id: globalService.getGuid(),
                            name: option.title,
                            editable: editable,
                        })
                        break
                    case 'picture-single':
                    case 'picture-multiple':
                        let config = option.config && JSON.parse(option.config)

                        let thumbnail, url
                        if (config && config.url) {
                            thumbnail = pictureService.compressPicture(config.url, { width: 268 })
                            url = config.url
                        }
                        selections.push({
                            id: globalService.getGuid(),
                            name: option.title,
                            url: url,
                            thumbnail: thumbnail,
                        })
                        break
                }
            })

            let item = {
                id: globalService.getGuid(),
                type: type,
                name: field.title,
                must: must,
            }
            if (type == 'text-single' || type == 'picture-single') {
                item.selections = selections
            } else if (type == 'text-multiple' || type == 'picture-multiple') {
                item.selections = selections
                item.min = min
                item.max = max
                updateMinMaxOption(item)
            }
            children.push(item)
        })
        list.push({
            id: globalService.getGuid(),
            name: group.title,
            children: children,
        })
    })
    data.list = list

    //更新拖拽关联的groupId
    data.groupId = data.list.map((item) => {
        return item.id
    })
    data.groupId.unshift('group-empty')

    //更新当前选中的光标位置
    if (data.list.length > 0) {
        data.selectedIndex.i = 0
        let children = data.list[data.selectedIndex.i].children

        if (children.length > 0) {
            data.selectedIndex.j = 0
            data.list[data.selectedIndex.i].selected = false
            data.list[data.selectedIndex.i].children[data.selectedIndex.j].selected = true
        } else {
            data.list[data.selectedIndex.i].selected = true
            data.selectedIndex.j = -1
        }
    } else {
        data.selectedIndex = {
            i: -1,
            j: -1,
        }
    }
    console.log(data.selectedIndex)
    console.log(data.list)
}

const checkInBlanks = (target, blanks) => {
    let flag = false
    blanks &&
        blanks.forEach((item) => {
            if (item.title == target) {
                flag = true
            }
        })
    return flag
}

defineExpose({
    setContent,
    getContent,
})
</script>
<style lang="scss" scoped>
@import '../../../common/styles/variable/index.scss';

.work-question-editor {
    width: 100%;
    height: 100%;
    display: flex;
    box-sizing: border-box;
    background: #f8f8f8;

    .left {
        flex-shrink: 0;
        width: 12.1875rem;
        // height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0.875rem 1rem;
        background: white;
        position: fixed;
        z-index: 1;
        top: calc(#{$workTopHeight} + 2.75rem + 6rem + 6px);
        left: calc(#{$workLeftBarWeight} + 3.125rem + 1px);
        bottom: calc(4.75rem + 1px);
        > span {
            flex-shrink: 0;
            font-size: 0.875rem;
            color: #272f53;
            font-weight: bold;
            margin-bottom: 0.6875rem;
        }
    }

    .center {
        margin-left: 12.1875rem;
        width: calc(100% - 12.1875rem - 12.1875rem);
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0 1rem 0.5rem;
        border-left: 1px solid #dbdbdb;
        border-right: 1px solid #dbdbdb;
        background: #f8f8f8;

        .add-group {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            padding: 0.5rem 0 0.375rem;
            width: 100%;
            background: #f8f8f8;
            box-sizing: border-box;

            position: relative;
            z-index: 100;
            top: calc(#{$workTopHeight} + 2.75rem + 6rem + 6px);
            position: sticky;

            // &:hover {
            //     background: #f2f4ff;
            // }
            // &:active {
            //     background: #e2e6f8;
            // }

            span {
                width: 5.25rem;
                height: 1.625rem;
                background: #ffffff;
                border: 1px solid #b1bdf2;
                font-size: 0.75rem;
                line-height: 1;
                color: #6c78af;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;

                &:active {
                    background: #f9f9f9;
                }
            }
        }
    }

    .right {
        flex-shrink: 0;
        width: 12.1875rem;
        height: 100%;
        // position: fixed;
        // z-index: 101;
        // top: calc(#{$workTopHeight} + 2.75rem + 6rem + 6px);
        // right: calc(3.125rem + 1px);
        // bottom: calc(4.75rem + 1px);
        // overflow: hidden;
        // overflow-x: hidden;
        // overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        background: white;

        animation: filter-hide-right 0.3s ease-out;
        -webkit-animation-fill-mode: forwards;
        animation-fill-mode: forwards;

        &.show {
            animation: filter-show-right 0.3s ease-in;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
        }

        .right-content {
            flex-shrink: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 0.875rem 1rem;
            background: white;

            position: relative;
            z-index: 100;
            top: calc(#{$workTopHeight} + 2.75rem + 6rem + 6px);
            position: sticky;

            > span {
                flex-shrink: 0;
                font-size: 0.875rem;
                color: #272f53;
                font-weight: bold;
                margin-bottom: 0.6875rem;
            }
            .must {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                height: 2.75rem;
                justify-content: space-between;
                border-bottom: 1px solid #e8e8e8;

                span {
                    font-size: 0.75rem;
                    color: #272f53;
                }
            }
            .type {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                height: 2.75rem;
                justify-content: space-between;
                border-bottom: 1px solid #e8e8e8;

                span {
                    font-size: 0.75rem;
                    color: #272f53;
                }
                .type-switch {
                    width: 5.625rem;
                    height: 1.625rem;
                    background: #ffffff;
                    border: 1px solid #b1bdf2;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;

                    div {
                        flex: 1;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.75rem;
                        color: #6c78af;
                        &.selected {
                            color: white;
                            background: #5874e8;
                        }
                    }
                }
            }
            .limit {
                flex-shrink: 0;
                width: 100%;
                display: flex;
                flex-direction: column;
                padding: 1rem 0;

                > span {
                    font-size: 0.75rem;
                    color: #272f53;
                    margin-bottom: 0.5625rem;
                }
                .select {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    margin: 0.25rem 0;

                    span {
                        font-size: 0.75rem;
                        color: #272f53;
                        margin-right: 0.75rem;
                    }

                    nz-select {
                        flex-shrink: 0;
                        width: 5.875rem;
                    }

                    ::ng-deep .ant-select-selector {
                        border-radius: 4px;
                    }
                }
            }
        }
    }
}

@keyframes filter-show-right {
    0% {
        // transform: translateX(100%);
        opacity: 0;
        visibility: hidden;
    }

    100% {
        // transform: translateX(0);
        opacity: 1;
        visibility: visible;
    }
}
@keyframes filter-hide-right {
    0% {
        // transform: translateX(0);
        opacity: 1;
        visibility: visible;
    }

    100% {
        // transform: translateX(100%);
        opacity: 0;
        visibility: hidden;
    }
}

// 嵌套Scss后将使DragDrop样式丢失
.group-empty {
    flex-shrink: 0;
    width: 100%;
    height: 9.0625rem;
    border: 1px dashed #bcc9ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
    position: relative;

    span {
        position: absolute;
        left: 50%;
        top: 50%;
        font-size: 0.75rem;
        color: #8395b4;
        z-index: 2;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
}

// 嵌套Scss后将使DragDrop样式丢失
.type-list {
    width: 100%;
    display: flex;
    flex-direction: column;
}
.type-item {
    flex-shrink: 0;
    width: 100%;
    height: 2rem;
    display: flex;
    align-items: center;
    padding: 0 0.8125rem;
    box-sizing: border-box;
    border: 1px solid #d0d8e6;
    border-radius: 4px;
    margin: 0.25rem 0;
    background: white;
    cursor: pointer;

    &:hover {
        background: #f2f4ff;
    }
    &:active {
        background: #e2e6f8;
    }

    img:nth-of-type(1) {
        flex-shrink: 0;
        width: 0.875rem;
        height: 0.875rem;
        margin-right: 0.625rem;
    }

    span {
        flex: 1;
        font-size: 0.75rem;
        color: #272f53;
    }
    img:nth-of-type(2) {
        flex-shrink: 0;
        width: 0.6875rem;
        height: 0.6875rem;
        margin-left: 0.625rem;
    }
}

// 嵌套Scss后将使DragDrop样式丢失
.center-list {
    width: 100%;
    height: calc(100% - 1.625rem - 0.375rem);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    // overflow-x: hidden;
    // overflow-y: auto;
}
.center-item {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    margin: 0.375rem 0;

    .group {
        width: 100%;
        height: 2.125rem;
        display: flex;
        align-items: center;
        padding-right: 0.4375rem;
        box-sizing: border-box;
        border: 1px solid transparent;
        span {
            flex: 1;
            font-size: 0.75rem;
            color: #272f53;
            margin-left: 1.1875rem;

            text-overflow: ellipsis;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
        }

        img {
            flex-shrink: 0;
            width: 1.125rem;
            height: 1.125rem;
            box-sizing: content-box;
            padding: 0.25rem 0.4375rem;
            cursor: pointer;

            &:active {
                background: #f9f9f9;
            }
        }
    }
}
// 嵌套Scss后将使DragDrop样式丢失
.children {
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    // max-height: 25rem;
    // overflow-y: auto;
}
// .children.dragging {
//     max-height: 25rem;
//     overflow-y: auto;
// }
.child {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid transparent;
    padding: 0.75rem 0;
    box-sizing: border-box;
    border-top: 1px solid #f1f1f1;
    // border-bottom: 1px solid #f1f1f1;
    background: white;
    &.selected {
        border: 1px solid #5874e8;
        box-shadow: 0px 3px 12px 0px rgba(0, 0, 0, 0.08);
    }

    .child-bottom {
        flex-shrink: 0;
        width: 100%;
        display: flex;
        align-items: center;
        margin-top: 0.75rem;
        padding: 0 2.8125rem;
        box-sizing: border-box;
        div {
            height: 1.5625rem;
            margin: 0 0.375rem;
            padding: 0 0.375rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            &:active,
            &:hover {
                background: #f9f9f9;
            }
            img {
                width: 0.625rem;
                height: 0.625rem;
                margin-right: 0.625rem;
            }
            span {
                font-size: 0.75rem;
                color: #5874e8;
                line-height: 1;
                font-weight: bold;
            }
        }
    }
}

.child-head {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.4375rem 0 1.1875rem;
    box-sizing: border-box;

    &:hover .child-drag {
        visibility: visible;
    }
    &:hover .child-remove {
        visibility: visible;
    }

    span:nth-of-type(1) {
        flex-shrink: 0;
        font-size: 0.75rem;
        color: #ff5127;
    }
    span:nth-of-type(2) {
        flex-shrink: 0;
        font-size: 0.75rem;
        color: #272f53;
        margin-left: 0.375rem;
        margin-right: 0.5rem;
    }

    input {
        flex: 1;
    }
    nz-input-group {
        flex: 1;
        height: 2rem;
        padding-top: 0;
        padding-bottom: 0;
        margin-right: 6px;
    }
    .child-drag,
    .child-remove {
        flex-shrink: 0;
        width: 1.125rem;
        height: 1.125rem;
        box-sizing: content-box;
        padding: 0.25rem 0.4375rem;
        visibility: hidden;
        cursor: pointer;

        &:active {
            background: #f9f9f9;
        }

        &.selected {
            visibility: visible;
        }
    }

    &.unselected {
        nz-input-group {
            border: 1px solid transparent;
        }
    }
}
.child.cdk-drag-preview {
    .child-drag,
    .child-remove {
        visibility: visible;
    }
}
.children-empty {
    flex-shrink: 0;
    width: 100%;
    height: 9.0625rem;
    border: 1px dashed #bcc9ff;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    color: #acacac;
    &.selected {
        background: white;
        border: 1px solid #5874e8;
        color: #8395b4;
    }
}

.question {
    width: 100%;
    height: 4.8rem;
    display: flex;
    flex-direction: column;
    padding: 0.75rem 4.6875rem 0 3rem;
    background: white;
    box-sizing: border-box;

    div {
        box-sizing: border-box;
        padding: 0.625rem;
        color: #d9d9d9;
        border: 1px solid #d9d9d9;
        height: 100%;
        width: 100%;
    }
}

.picture {
    flex-shrink: 0;
    width: 100%;
    padding: 0.75rem 3rem 0;
    box-sizing: border-box;
    overflow: hidden;

    .picture-item {
        // float: left;
        box-sizing: border-box;
        // width: 8.375rem;
        background: white;
        border: 1px solid #b1bdf2;
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        position: relative;
        // margin: 0.375rem;

        .photo {
            width: 100%;
            height: 8.375rem;
            position: relative;
            cursor: pointer;
            img:nth-of-type(1) {
                object-fit: contain;
                width: 100%;
                height: 100%;
            }

            img:nth-of-type(2) {
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

        nz-input-group {
            border: none;
            border-top: 1px solid #b1bdf2;
        }
        textarea {
            resize: none;
            font-size: 0.75rem;
            line-height: 1.25rem;

            &::-webkit-scrollbar {
                width: 8px;
                // height: 200px;
            }

            /*滚动条滑块*/
            &::-webkit-scrollbar-thumb {
                /*滚动条里面小方块*/
                // border-radius: 10px;
                box-shadow: inset 0 0 5px #d8d8d8;
                background: #a8a8a8;
            }

            /*滚动条轨道*/
            &::-webkit-scrollbar-track {
                /*滚动条里面轨道*/
                box-shadow: inset 0 0 5px #d8d8d8;
                // border-radius: 10px;
                background: #f1f1f1;
            }
        }

        .prefix-single {
            display: flex;
            flex-direction: column;
            height: 100%;
            div {
                width: 0.875rem;
                height: 0.875rem;
                border: 1px solid #8395b4;
                border-radius: 50%;
                // margin-right: 0.25rem;
                margin-top: 0.5rem;
            }
        }

        .prefix-multiple {
            display: flex;
            flex-direction: column;
            height: 100%;
            div {
                width: 0.875rem;
                height: 0.875rem;
                border: 1px solid #8395b4;
                // margin-right: 0.25rem;
                margin-top: 0.5rem;
            }
        }

        &.unselected {
            textarea {
                border: 1px solid transparent;

                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }
    }
    .add-photo {
        // width: 8.375rem;
        height: 11.0625rem;
        background: #ffffff;
        border: 1px solid #b1bdf2;
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        cursor: pointer;
        // margin: 0.375rem;

        &:active {
            background: #f9f9f9;
        }
        img {
            width: 1.75rem;
            height: 1.75rem;
        }
        span {
            font-size: 0.8125rem;
            color: #95aed8;
            margin-top: 1rem;
            text-align: center;
        }
    }
}
// 嵌套Scss后将使DragDrop样式丢失
.choose {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0.3125rem 0;
    background: white;
}

.selection {
    margin: 0.1875rem 0;
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.4375rem 0 1.1875rem;
    box-sizing: border-box;

    &:hover .selection-drag {
        visibility: visible;
    }
    &:hover .selection-remove {
        visibility: visible;
    }
    .selection-drag {
        flex-shrink: 0;
        width: 1.3125rem;
        height: 1.625rem;
        box-sizing: content-box;
        margin-left: 2rem;
        margin-right: 0.3125rem;
        visibility: hidden;
        cursor: pointer;
    }

    input {
        flex: 1;
    }

    nz-input-group {
        flex: 1;
        height: 2rem;
        padding-top: 0;
        padding-bottom: 0;
        margin-right: 6px;
    }
    .prefix-single {
        width: 0.875rem;
        height: 0.875rem;
        border: 1px solid #8395b4;
        border-radius: 50%;
        // margin-right: 0.25rem;
    }

    .prefix-multiple {
        width: 0.875rem;
        height: 0.875rem;
        border: 1px solid #8395b4;
        // margin-right: 0.25rem;
    }
    .selection-remove {
        flex-shrink: 0;
        width: 1.125rem;
        height: 1.125rem;
        box-sizing: content-box;
        padding: 0.25rem 0.4375rem;
        margin-right: 2rem; // 0.4375rem +  0.4375rem + 1.125rem
        visibility: hidden;
        cursor: pointer;

        &.selected {
            visibility: visible;
        }
    }

    &.unselected {
        nz-input-group {
            border: 1px solid transparent;
        }
    }
}
.selection.cdk-drag-preview {
    .selection-drag {
        visibility: visible;
    }
    .selection-remove {
        visibility: visible;
    }
}
.cdk-drag-placeholder {
    opacity: 0;
}

//拖动排序
.type-list.cdk-drag-preview {
    box-sizing: border-box;
    // border-radius: 4px;
    // box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
// .type-list.cdk-drag-placeholder {
//     opacity: 0;
// }
.custom-type-placeholder {
    width: 100%;
    height: 2rem;
}
.type-list.cdk-drop-list-dragging .type-item:not(.cdk-drag-placeholder) {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

//拖动排序
.center-list.cdk-drag-preview {
    box-sizing: border-box;
    // border-radius: 4px;
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

// .cdk-drag-placeholder {
//     opacity: 0;
// }
.cdk-drag-animating {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.center-list.cdk-drop-list-dragging .center-item:not(.cdk-drag-placeholder) {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.custom-group-placeholder {
    flex-shrink: 0;
    // background: #f9f9f9;
    border: solid 1px #6d89fd;
    background: white;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 1.875rem;
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    opacity: 1;
}
.custom-group-preview {
    flex-shrink: 0;
    width: 15rem;
    min-height: 6.25rem;
    padding: 1rem 2rem;
    font-size: 0.875rem;
    border: 1px dashed #bcc9ff;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    color: #acacac;
}

//拖动排序
.child.cdk-drag-preview {
    box-sizing: border-box;
    // border-radius: 4px;
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.children.cdk-drop-list-dragging .child:not(.cdk-drag-placeholder) {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.custom-child-placeholder {
    flex-shrink: 0;
    background: #f9f9f9;
    border: solid 1px #6d89fd;
    background: white;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 1.875rem;
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    opacity: 1;
}
.custom-child-preview {
    flex-shrink: 0;
    width: 15rem;
    min-height: 6.25rem;
    padding: 1rem 2rem;
    font-size: 0.875rem;
    border: 1px dashed #bcc9ff;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    color: #acacac;
}

//拖动排序
.choose.cdk-drag-preview {
    box-sizing: border-box;
    // border-radius: 4px;
    // box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
.choose:last-child {
    border: none;
}
.choose.cdk-drop-list-dragging .selection:not(.cdk-drag-placeholder) {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.modal-add-group {
    width: 100%;
    height: 9rem;
    display: flex;
    align-items: flex-start;
    padding: 1.875rem 1.5rem;
    box-sizing: border-box;
}

.modal-add-selection {
    width: 100%;
    // height: 21.875rem;
    display: flex;
    flex-direction: column;
    padding: 0rem 1rem 0.5rem;
    box-sizing: border-box;

    span {
        flex-shrink: 0;
        font-size: 0.75rem;
        color: #8395b4;
        font-weight: bold;
        margin-bottom: 0.6875rem;
    }

    textarea {
        flex: 1;
        width: 100%;
        resize: none;
    }
}
</style>
