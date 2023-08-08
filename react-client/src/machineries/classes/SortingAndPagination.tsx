export default interface SortingAndPagination {
  currentPage: number
  pageSize: number
  totalItems: number
  sortingEntries: Array<{
    entry: string
    selected: boolean
  }>
}
