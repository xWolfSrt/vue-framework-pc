import http from '../utils/http/httpclient'
let { post } = http

const query = (pager) =>
    post('/union/api/link/scope/query', {
        pager: pager,
    })

const add = (items) => post('/union/api/link/scope/add', { items: items })

const clean = (items) => post('/union/api/link/scope/clean', { items: items })

const modify = (items) => post('/union/api/link/scope/modify', { items: items })

export default {
    query,
    add,
    clean,
    modify,
}
