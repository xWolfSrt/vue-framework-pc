import http from '../utils/http/httpclient'
let { post } = http

    // 非团体会员	  item.getOrganization() == 当前机构id
    // 本单位同事	  item.getOrganization() == 当前机构id
    // 商协会联络员	item.getOrganizationInf().getCategoryInfo().getCode == 'OrganizationCategory_Union_SXH' && item.getLinker
    // 工商联联络员	item.getOrganizationInf().getCategoryInfo().getCode == 'OrganizationCategory_Union_GSL' && item.getLinker

    // 商协会、工商联联络员省市区县：
    // 省级：item.getOrganizationInf().getProvince() != null && item.getOrganizationInf().getCity() == null && item.getOrganizationInf().getCounty() == null
    // 市级：item.getOrganizationInf().getProvince() != null && item.getOrganizationInf().getCity() != null && item.getOrganizationInf().getCounty() == null
    // 区县级：item.getOrganizationInf().getProvince() != null && item.getOrganizationInf().getCity() != null && item.getOrganizationInf().getCounty() != null

    //非团体会员
const queryMembershipList = (pager) =>
    post('/platform/api/member/membership/querySummaryResult', {
        pager: pager,
    })
 //非团体会员职位
    const queryMembershipTitleList = () =>
    post('/platform/api/member/title/listStatisticsView', {
      
    })
 //本单位同事
    //商协会联络员
    //工商联联络员
const queryEmployeeList = (pager) =>
    post('/platform/api/member/employee/querySummaryResult', {
        pager: pager,
    })

    //本单位同事部门
const queryEmployeeDepartmentList = () =>
    post('/platform/api/member/department/listStatisticsView', {
     
    })

export default {
    queryMembershipList,
    queryMembershipTitleList,
    queryEmployeeList,
    queryEmployeeDepartmentList,
}
