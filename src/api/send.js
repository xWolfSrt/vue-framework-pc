import http from '../utils/http/httpclient'
let { post } = http

const queryList = (pager) =>
    post('/union/api/link/send/queryListResult', {
        pager: pager,
    })
//用于获取发件详情
const fetchStatistics = (send, limit) =>
    post('/union/api/link/send/fetchStatisticsSummaryResult', {
        send: send,
        limit: limit,
    })
//用于还原草稿箱编辑
const fetchSummary = (id) =>
    post('/union/api/link/send/fetchSummaryResult', {
        send: id,
    })
const toggle = (send, enable) =>
    post('/union/api/link/send/toggle', {
        send: send,
        enable: enable,
    })
const save = (item) => post('/union/api/link/send/save', item)

const clean = (items) => post('/union/api/link/send/clean', { items: items })

const publish = (item) => post('/union/api/link/send/publish', item)

const forward = (item) => post('/union/api/link/send/forward', item)

const listSendStatisticsView = (days) =>
    post('/union/api/link/send/listSendStatisticsView', {
        days: days,
    })
export default {
    queryList,
    fetchStatistics,
    fetchSummary,
    toggle,
    save,
    clean,
    publish,
    forward,
    listSendStatisticsView,
}
