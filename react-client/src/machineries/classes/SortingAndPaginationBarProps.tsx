import SortingAndPagination from "./SortingAndPagination";
import SortBy from "./SortBy";

export default interface SortingAndPaginationBarProps {
    sortingAndPagination: SortingAndPagination
    setSortingAndPagination: Function
    sortBy: SortBy
    setSortBy: Function
    setPage: Function
}