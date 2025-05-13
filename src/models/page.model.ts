export interface PageModel<T> {
    content: T[],
    pageable: {
        sort: {
            sorted: boolean,
            empty: boolean,
            unsorted: boolean
        },
        pageNumber: number,
        pageSize: number,
        offset: number,
        paged: boolean,
        unpaged: boolean
    },
    totalPages: number,
    totalElements: number,
    last: boolean,
    size: number,
    number: number,
    sort: {
        sorted: boolean,
        empty: boolean,
        unsorted: boolean
    },
    numberOfElements: number,
    first: boolean,
    empty: boolean
}