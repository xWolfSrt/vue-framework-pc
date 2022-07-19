import http from '../utils/http/httpclient'
let { post } = http

const queryList = (pager) =>
    post('/union/api/link/receive/queryListResult', {
        pager: pager,
    })

const fetchNotificationSummary = (id) =>
    post('/union/api/link/notice/fetchSummaryResult', {
        receive: id,
    })

const fetchQuestionSummary = (id) =>
    post('/union/api/link/question/fetchSummaryResult', {
        receive: id,
        enableStatistics: false,
    })

const fetchVoteSummary = (id) =>
    post('/union/api/link/vote/fetchSummaryResult', {
        receive: id,
        enableStatistics: false,
    })

const fetchActivitySummary = (id) =>
    post('/union/api/link/activity/fetchSummaryResult', {
        receive: id,
        enableStatistics: false,
    })

const fetchMeetingSummary = (id) =>
    post('/union/api/link/meeting/fetchSummaryResult', {
        receive: id,
    })

const fetchDocumentSummary = (id) =>
    post('/union/api/link/reference/fetchSummaryResult', {
        receive: id,
    })

const fetchSummary = (id) =>
    post('/union/api/link/receive/fetchSummaryResult', {
        receive: id,
    })

const count = (category) =>
    post('/union/api/link/receive/count', {
        category: category,
    })
const fetchStatistics = (category, days) =>
    post('/union/api/link/receive/fetchStatisticsSummaryResult', {
        category: category,
        days: days,
    })

//category = ReceiveCategory_Employee_BDW		本单位同事
// category = ReceiveCategory_Employee_GSL		工商联联络员
// category = ReceiveCategory_Employee_SXH		商协会联络员
const queryEmployeeList = (pager) =>
    post('/union/api/link/receive/queryEmployeeListResult', {
        pager: pager,
    })
const queryMembershipList = (pager) =>
    post('/union/api/link/receive/queryMembershipListResult', {
        pager: pager,
    })

const notify = (receive) =>
    post('/union/api/link/receive/notify', {
        receive: receive,
    })

export default {
    queryList,
    fetchNotificationSummary,
    fetchQuestionSummary,
    fetchVoteSummary,
    fetchActivitySummary,
    fetchDocumentSummary,
    fetchMeetingSummary,
    fetchSummary,
    count,
    fetchStatistics,
    queryEmployeeList,
    queryMembershipList,
    notify,
}
