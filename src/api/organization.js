import http from '../utils/http/httpclient'
import pictureService from '../utils/picture-service.js'
let { post } = http

const queryList = () =>
    post('/platform/api/member/organization/listByAdministratorAndEmployee', {
        client: 'cowx-union-employee-provider-foreground-web',
    })

const getEmployeeSummaryResult = () => post('/platform/api/member/employee/getEmployeeSummaryResult', {})

const getList = (list) => {
    return (
        list &&
        list.map((item) => {
            return getItem(item)
        })
    )
}
const getItem = (item) => {
    return {
        id: item.id,
        category: item.category && item.category.code,
        captcha: item.captcha,
        name: item.name,
        function: item.function,
        module: item.module,
        province: item.province,
        city: item.city,
        cert: item.cert,
        photo: pictureService.getPicture(item.photo, { width: 120 }),
    }
}

export default {
    queryList,
    getEmployeeSummaryResult,
    getList,
    getItem,
}
