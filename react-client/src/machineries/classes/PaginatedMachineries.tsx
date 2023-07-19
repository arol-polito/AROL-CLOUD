import Machinery from "./Machinery";

export default interface PaginatedMachineries {
    content: Machinery[]
    empty: boolean
    first: boolean
    last: boolean
    number: number
    numberOfElements: number
    pageable: {
        sort: {
            empty: boolean
            sorted: boolean
            unsorted: boolean
        }
        offset: number
        pageSize: number
        pageNumber: number
        unpaged: boolean
    }
    size: number
    sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
    }
    totalElements: number
    totalPages: number
}