import {
    Box,
    Button,
    Checkbox,
    Heading,
    HStack,
    Input,
    List,
    ListItem,
    useColorModeValue,
    VStack
} from '@chakra-ui/react'
import {FiChevronDown, FiChevronUp} from 'react-icons/fi'
import React, {useState} from 'react'
import type FilteringBarProps from '../classes/FilteringBarProps'
import type MachinerySortingAndFilters from '../classes/MachinerySortingAndFilters'

export default function FilteringBar(props: FilteringBarProps) {
    const [filtersBarOpen, setFiltersBarOpen] = useState(false)
    const [numFiltersSelected, setNumFiltersSelected] = useState<number>(0)
    const [searchTerm, setSearchTerm] = useState<string>('')

    function toggleFiltersBar() {
        setFiltersBarOpen(current => !current)
    }

    function handleSearchButtonPressed() {
        props.setMachinerySortingAndFilters((val: MachinerySortingAndFilters) => {
            val.searchTerm = searchTerm
            val.submit = true

            return {...val}
        })
        setFiltersBarOpen(false)
    }

    return (
        <>
            <VStack
                alignItems="flex-start"
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow="2xl"
                rounded="lg"
                p={6}
                mt={6}
            >
                <HStack width="100%" flexWrap="wrap" justifyContent="space-between" gap={5}>
                    <HStack flexWrap="nowrap">
                        <Button
                            colorScheme="blue"
                            size="md"
                            rightIcon={filtersBarOpen ? <FiChevronUp/> : <FiChevronDown/>}
                            onClick={toggleFiltersBar}
                        >
                            {numFiltersSelected} filters selected
                        </Button>
                    </HStack>
                    <HStack ml="0!important" flexWrap="nowrap">
                        <Input
                            type="text"
                            placeholder="Type here to search"
                            bg="white"
                            borderColor="var(--chakra-colors-blue-500)"
                            width="fit-content"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                            }}
                        />
                        <Button
                            colorScheme="blue"
                            size="md"
                            onClick={handleSearchButtonPressed}
                        >
                            Search
                        </Button>
                    </HStack>
                </HStack>
                {
                    filtersBarOpen &&
                    <FiltersBar
                        machinerySortingAndFilters={props.machinerySortingAndFilters}
                        setMachinerySortingAndFilters={props.setMachinerySortingAndFilters}
                        setNumFiltersSelected={setNumFiltersSelected}
                    />
                }
            </VStack>

        </>
    )
}

function FiltersBar(props: FilteringBarProps) {
    function handleTopLevelFilterCheckboxChanged(filterKey: string, event: React.ChangeEvent<HTMLInputElement>) {
        if (!props.machinerySortingAndFilters) return false
        if (props.machinerySortingAndFilters.filtersMap.get(filterKey) == null) return false

        props.setMachinerySortingAndFilters((val: MachinerySortingAndFilters) => {
            val.filtersMap.get(filterKey)?.filterEntries.forEach((filterValue: any) => (filterValue.selected = event.target.checked))

            const numEntriesAffected = val.filtersMap.get(filterKey)?.filterEntries.length;
            if (numEntriesAffected !== undefined)
                props.setNumFiltersSelected((val: number) => {
                    if (event.target.checked)
                        return val + numEntriesAffected

                    return val - numEntriesAffected
                })


            return {
                sortingList: val.sortingList,
                filtersMap: new Map(val.filtersMap)
            }
        });

        return true;
    }

    function handleFilterCheckboxChanged(filterKey: string, filterValue: string, event: React.ChangeEvent<HTMLInputElement>) {
        if (!props.machinerySortingAndFilters) return false
        if (props.machinerySortingAndFilters.filtersMap.get(filterKey) == null) return false

        props.setMachinerySortingAndFilters((val: MachinerySortingAndFilters) => {
            const filterEntries = val.filtersMap.get(filterKey)?.filterEntries;
            if (filterEntries) {
                const foundFilterEntry = filterEntries.find((value) => (value.entryInternalName === filterValue))
                if (foundFilterEntry)
                    foundFilterEntry.selected = event.target.checked
            }

            return {
                sortingList: val.sortingList,
                filtersMap: new Map(val.filtersMap)
            }
        })
        props.setNumFiltersSelected((val: number) => {
            if (event.target.checked)
                return val + 1

            return val - 1
        })

        return true;
    }

    function controlIfAllFilterCheckboxesChecked(filterKey: string) {
        if (!props.machinerySortingAndFilters) return false
        if (props.machinerySortingAndFilters.filtersMap.get(filterKey) == null) return false

        return props.machinerySortingAndFilters.filtersMap.get(filterKey)?.filterEntries.filter((val) => !val.selected).length === 0
    }

    function controlIfFilterCheckboxesAreIndeterminate(filterKey: string) {
        if (!props.machinerySortingAndFilters) return false
        if (props.machinerySortingAndFilters.filtersMap.get(filterKey) == null) return false

        const numUnchecked = props.machinerySortingAndFilters.filtersMap.get(filterKey)?.filterEntries.filter((val) => !val.selected).length

        return numUnchecked !== 0 &&
            numUnchecked !== props.machinerySortingAndFilters.filtersMap.get(filterKey)?.filterEntries.length
    }

    return (
        <HStack justifyContent="left" alignItems="flex-start" flexWrap="wrap">
            {
                Array.from(props.machinerySortingAndFilters.filtersMap.keys()).map((filterKey: string) =>
                    <Box key={filterKey} pr={3} mt="5!important">
                        <VStack alignItems="left">
                            <Checkbox
                                isChecked={controlIfAllFilterCheckboxesChecked(filterKey)}
                                isIndeterminate={controlIfFilterCheckboxesAreIndeterminate(filterKey)}
                                onChange={(e) => (handleTopLevelFilterCheckboxChanged(filterKey, e))}
                            >
                                <Heading size="sm">
                                    {props.machinerySortingAndFilters.filtersMap.get(filterKey)?.filterDisplayName}
                                </Heading>
                            </Checkbox>
                            <List pl={6} mt={1} spacing={3} maxHeight="250px" overflowY="auto">
                                {props.machinerySortingAndFilters.filtersMap.get(filterKey)?.filterEntries.map((filterEntry) =>
                                    <ListItem key={`${filterKey}_${filterEntry.entryInternalName}`}>
                                        <Checkbox
                                            isChecked={filterEntry.selected}
                                            onChange={(e) => handleFilterCheckboxChanged(filterKey, filterEntry.entryInternalName, e)}
                                        >
                                            {filterEntry.entryDisplayName}
                                        </Checkbox>
                                    </ListItem>
                                )}
                            </List>

                            {/* <Select bg={"white"} borderColor={"var(--chakra-colors-blue-500)"}> */}
                            {/*    {filterKeys.get(filterKey)?.entries.map((filterEntry: string) => */}
                            {/*            <option */}
                            {/*                id={"entry_"+filterKey+"_"+filterEntry} */}
                            {/*                // value={filterEntry} */}
                            {/*            > */}
                            {/*                <Checkbox>{filterEntry}</Checkbox> */}
                            {/*            </option> */}
                            {/*        )} */}
                            {/* </Select> */}
                        </VStack>
                        {/* <Divider orientation={"vertical"} color={"red.500"} width={"5px"} height={"100%"} /> */}
                    </Box>
                )
            }
        </HStack>
    )
}
