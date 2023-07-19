import MachineryFilter from "./MachineryFilter";

export default interface MachinerySortingAndFilters {
    sortingList: Array<{
        entry: string
        selected: boolean
    }>
    filtersMap: Map<string, MachineryFilter>
    searchTerm: string,
    submit: boolean

}