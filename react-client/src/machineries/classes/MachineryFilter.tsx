export default interface MachineryFilter {
  filterDisplayName: string
  filterInternalName: string
  filterEntries: Array<{
    entryDisplayName: string
    entryInternalName: string
    selected: boolean
  }>
}
