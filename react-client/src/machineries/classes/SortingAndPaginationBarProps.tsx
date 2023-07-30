import type SortingAndPagination from './SortingAndPagination'
import type SortBy from './SortBy'

export default interface SortingAndPaginationBarProps {
  sortingAndPagination: SortingAndPagination
  setSortingAndPagination: Function
  sortBy: SortBy
  setSortBy: Function
  setPage: Function
}
