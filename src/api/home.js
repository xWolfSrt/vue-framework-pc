import http from '../utils/http/httpclient'
import pictureService from '../utils/picture-service.js'
let { post } = http

const fetchWorkbench = () =>
    post('/union/api/link/workbench/fetchWorkbenchEmployeeSummaryResult', {
        enableSendStatistics: true,
    })
const fetchCalendar = (date, limit) =>
    post('/union/api/link/calendar/fetchCalendarEmployeeSummaryResult', {
        date: date,
        limit: limit,
    })

const fetchEmployeeContacts = (enableEmployees, enableMemberships, limit) =>
    post('/platform/api/member/contacts/getEmployeeContactsSummaryResult', {
        categories: ['OrganizationCategory_Union_GSL', 'OrganizationCategory_Union_SXH'],
        enableEmployees: enableEmployees,
        enableMemberships: enableMemberships,
        limit: limit,
    })

const queryEmployeeEmployeeContacts = (pager) =>
    post('/platform/api/member/contacts/queryEmployeeEmployeeContactsView', {
        pager: pager,
    })

const queryEmployeeMembershipContacts = () =>
    post('/platform/api/member/contacts/queryEmployeeMembershipContactsView', {
        pager: pager,
    })

export default {
    fetchWorkbench,
    fetchCalendar,
    fetchEmployeeContacts,
    queryEmployeeEmployeeContacts,
    queryEmployeeMembershipContacts,
}
