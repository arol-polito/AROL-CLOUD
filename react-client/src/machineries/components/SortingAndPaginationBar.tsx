import { Box, Divider, HStack, Select, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import type SortingAndPaginationBarProps from '../classes/SortingAndPaginationBarProps'
import type Page from '../classes/Page'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

export default function SortingAndPaginationBar (props: SortingAndPaginationBarProps) {
  const paginationEntries = [10, 25, 50]

  function getShownItemsRange (): string {
    const from = props.sortingAndPagination.currentPage * props.sortingAndPagination.pageSize
    let to = (props.sortingAndPagination.currentPage + 1) * props.sortingAndPagination.pageSize
    if (to > props.sortingAndPagination.totalItems)
      to = props.sortingAndPagination.totalItems

    // console.log(from+" - "+to+" out of "+props.sortingAndPagination.totalItems)

    return `${from} - ${to}`
  }

  function handleSortDropdownChanged (event: React.ChangeEvent<HTMLSelectElement>) {
    const sortIndex = parseInt(event.target.value)
    props.setSortBy({
      by: props.sortingAndPagination.sortingEntries[sortIndex].entry,
      mode: 'ASC'
    })
  }

  function handlePageSizeDropdownChanged (event: React.ChangeEvent<HTMLSelectElement>) {
    props.setPage((val: Page) => ({
      currPage: val.currPage,
      pageSize: event.target.value,
      skeletonArray: Array(parseInt(event.target.value)).fill(1).map((x, y) => (x + y))
    })
    )
  }

  return (

        <HStack alignItems="stretch"
                justifyContent="space-between"
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow="2xl"
                rounded="lg"
                px={6}
                py={2}
                mt={2}
                mb={6}
        >
            <Box>
                <Text>{getShownItemsRange()} out of {props.sortingAndPagination.totalItems}</Text>
            </Box>
            <HStack flexWrap="nowrap">
                <Select
                    variant="unstyled"
                    icon={<ChevronUpDownIcon/>}
                    width="fit-content"
                    onChange={(e) => {
                      handleSortDropdownChanged(e)
                    }}
                    // value={props.machinerySortingAndFilters.sortingList.find((val)=>(val.selected))?.entry}
                >
                    {
                        props.sortingAndPagination.sortingEntries.map((sortValue, index) =>
                            <option key={sortValue.entry} value={index}>
                                Sort by {sortValue.entry}
                            </option>
                        )
                    }
                </Select>
                <Divider orientation="vertical" borderColor="gray.500"/>
                <Select
                    variant="unstyled"
                    icon={<ChevronUpDownIcon/>}
                    width="fit-content"
                    onChange={(e) => {
                      handlePageSizeDropdownChanged(e)
                    }}
                    // value={props.machinerySortingAndFilters.sortingList.find((val)=>(val.selected))?.entry}
                >
                    {
                        paginationEntries.map((val) =>
                            <option key={val} value={val}>
                                {val} items per page
                            </option>
                        )
                    }
                </Select>
            </HStack>
        </HStack>

  )
}
