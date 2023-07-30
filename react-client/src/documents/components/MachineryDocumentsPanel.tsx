import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import machineryService from '../../services/MachineryService'
import type Machinery from '../../machineries-map/components/Machinery'
import ToastContext from '../../utils/contexts/ToastContext'
import { FiSearch, FiX } from 'react-icons/fi'
import MachineryWithDocumentsCard from './MachineryWithDocumentsCard'
import type MachineryWithDocuments from '../interfaces/MachineryWithDocuments'
import documentsService from '../../services/DocumentsService'
import type FileMapEntry from '../../machinery/documents/interfaces/FileMapEntry'
import type FileMap from '../../machinery/documents/interfaces/FileMap'
import permissionChecker from '../../utils/PermissionChecker'
import PrincipalContext from '../../utils/contexts/PrincipalContext'
import axiosExceptionHandler from '../../utils/AxiosExceptionHandler'
import toastHelper from '../../utils/ToastHelper'


export default function MachineryDocumentsPanel () {
  const { principal } = useContext(PrincipalContext)
  const toast = useContext(ToastContext)

  const [machineriesWithDocuments, setMachineriesWithDocuments] = useState<MachineryWithDocuments[]>([])
  const [machinerySearch, setMachinerySearch] = useState<{
    searchTerm: string
    highlightTerm: string
    doSearch: boolean
  }>({
    searchTerm: '',
    highlightTerm: '',
    doSearch: false
  })
  const [machinerySort, setMachinerySort] = useState('none')

  const [loadingMachineries, setLoadingMachineries] = useState(true)

  // LOAD MACHINERIES & CORRESPONDING DOCUMENTS
  useEffect(() => {
    if (machinerySort !== 'none') return

    async function getMachineriesAndDocuments () {
      setLoadingMachineries(true)

      try {
        const machineriesMap = await machineryService.getMachineryByCompany()
        const machineriesArray: Machinery[] = []
        machineriesMap.forEach((val) => {
          machineriesArray.push(...val)
        })

        const machineriesWithDocumentsArray: MachineryWithDocuments[] = []

        for (const machinery of machineriesArray)
          if (permissionChecker.hasMachineryPermission(principal, machinery.uid, 'documentsRead')) {
            const fileMap = (await documentsService.getMachineryDocuments(machinery.uid)).fileMap as FileMap

            const documents: FileMapEntry[] = []
            Object.values(fileMap).forEach((fileMapEntry: FileMapEntry) => {
              if (!fileMapEntry.isDir)
                documents.push(fileMapEntry)
            })

            machineriesWithDocumentsArray.push({
              ...machinery,
              active: true,
              documents: documents.sort((a, b) => (a.id > b.id ? 1 : -1))
            })
          }

        if (machineriesWithDocuments.length > 0) {
          setMachineriesWithDocuments(machineriesWithDocumentsArray)

          setMachinerySearch((val) => {
            val.doSearch = true

            return { ...val }
          })

          toastHelper.makeToast(
            toast,
            'Sorting applied',
            'info'
          )

          setLoadingMachineries(false)

          return
        }

        setMachineriesWithDocuments(machineriesWithDocumentsArray)
      } catch (e) {
        console.error(e)
        axiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          'Documents could not be fetched'
        )
      }

      setLoadingMachineries(false)
    }

    getMachineriesAndDocuments()
  }, [machinerySort, machineriesWithDocuments.length, principal, toast])

  // HANDLE SEARCH
  useEffect(() => {
    if (!machinerySearch.doSearch) return

    const searchTerm = machinerySearch.searchTerm.toLowerCase()
    setMachineriesWithDocuments((val) => {
      val.forEach((el) => {
        if (!searchTerm ||
                    el.uid.toLowerCase().includes(searchTerm) ||
                    el.modelName.toLowerCase().includes(searchTerm) ||
                    el.modelType.toLowerCase().includes(searchTerm) ||
                    el.locationCluster.toLowerCase().includes(searchTerm) ||
                    (el.documents.find((document) => (document.name.toLowerCase().includes(searchTerm))) != null)
        )
          el.active = true
        else
          el.active = false
      })

      return [...val]
    })

    setMachinerySearch((val) => {
      val.doSearch = false
      val.highlightTerm = val.searchTerm

      return { ...val }
    })
  }, [machinerySearch, machineriesWithDocuments.length, principal, toast])

  // HANDLE SORT
  useEffect(() => {
    if (machinerySort === 'none') return

    setMachineriesWithDocuments((val) => {
      val.sort((a, b) => {
        switch (machinerySort) {
          case 'uid': {
            return a.uid > b.uid ? 1 : -1
          }
          case 'modelName': {
            return a.modelName > b.modelName ? 1 : -1
          }
          case 'type': {
            return a.modelType > b.modelType ? 1 : -1
          }
          case 'location': {
            return a.locationCluster > b.locationCluster ? 1 : -1
          }
          case 'num-dashboards': {
            return b.documents.length - a.documents.length
          }
          default: {
            console.error('Unknown sort term')

            return 0
          }
        }
      })

      return [...val]
    })

    toastHelper.makeToast(
      toast,
      'Sorting applied',
      'info'
    )
  }, [machinerySort, toast])

  // SEARCH TERM CHANGED EVENT
  function handleSearchTermChanged (e) {
    setMachinerySearch((val) => {
      val.searchTerm = e.target.value

      return { ...val }
    })
  }

  // HANDLE SEARCH BUTTON CLICKED
  function handleSearchButtonClicked () {
    setMachinerySearch((val) => {
      val.doSearch = true

      return { ...val }
    })
  }

  return (
        <VStack
            w="full"
            h="full"
        >
            <HStack
                p={6}
                w="full"
                borderWidth={1}
                borderColor="gray.200"
                bgColor="white"
                rounded="md"
            >
                <InputGroup size='md'>
                    <InputLeftElement
                        pointerEvents='none'
                        color='gray.300'
                        fontSize='1.2em'
                    >
                        <FiSearch/>
                    </InputLeftElement>
                    <Input
                        pr='4.5rem'
                        type="text"
                        placeholder='Search machinery or document'
                        value={machinerySearch.searchTerm}
                        onChange={handleSearchTermChanged}
                    />
                    <InputRightElement width='6.5rem'>
                        <Box
                            pr={1}
                            _hover={{
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setMachinerySearch({
                                searchTerm: '',
                                doSearch: true,
                                highlightTerm: ''
                              })
                            }}
                        >
                            <FiX size={18} color="gray"/>
                        </Box>
                        <Button
                            h='1.75rem'
                            size='sm'
                            colorScheme="blue"
                            onClick={handleSearchButtonClicked}
                        >
                            Search
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <Select
                    w="350px"
                    value={machinerySort}
                    onChange={(e) => {
                      setMachinerySort(e.target.value)
                    }}
                >
                    <option value='none'>Sort by default order</option>
                    <option value='uid'>Sort by machinery ID</option>
                    <option value='modelName'>Sort by machinery model</option>
                    <option value='type'>Sort by machinery type</option>
                    <option value='location'>Sort by production plant</option>
                    <option value='num-dashboards'>Sort by number of documents</option>
                </Select>
            </HStack>

            {
                !loadingMachineries &&
                machineriesWithDocuments
                  .filter((machineryWithDashboards) => (machineryWithDashboards.active))
                  .map((machineryWithDashboards) => (
                        <MachineryWithDocumentsCard
                            key={machineryWithDashboards.uid}
                            machineryWithDocuments={machineryWithDashboards}
                            highlightTerm={machinerySearch.highlightTerm}
                        />
                  ))
            }
            {
                !loadingMachineries &&
                machineriesWithDocuments
                  .filter((machineryWithDashboards) => (machineryWithDashboards.active))
                  .length === 0 &&
                <HStack
                    w="full"
                    h="200px"
                    justifyContent="center"
                    alignItems="center"
                >
                    {
                        machinerySearch.highlightTerm &&
                        <Text>Nothing matches your search term</Text>
                    }
                    {
                        !machinerySearch.highlightTerm &&
                        <Text>No machineries available</Text>
                    }
                </HStack>
            }
            {
                loadingMachineries &&
                <VStack
                    w="full"
                    h="300px"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Spinner size="xl"/>
                </VStack>
            }

        </VStack>
  )
}
