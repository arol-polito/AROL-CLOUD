import type MachinerySortingAndFilters from './MachinerySortingAndFilters'

export default interface FilteringBarProps {
  machinerySortingAndFilters: MachinerySortingAndFilters
  setMachinerySortingAndFilters: Function
  setNumFiltersSelected: Function
}
