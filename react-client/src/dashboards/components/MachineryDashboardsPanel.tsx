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
import React, {useContext, useEffect, useState} from 'react'
import type MachineryWithDashboards from '../interfaces/MachineryWithDashboards'
import machineryService from '../../services/MachineryService'
import type Machinery from '../../machineries-map/components/Machinery'
import dashboardService from '../../services/DashboardService'
import ToastContext from '../../utils/contexts/ToastContext'
import {FiSearch, FiX} from 'react-icons/fi'
import MachineryWithDashboardsCard from './MachineryWithDashboardsCard'
import type SavedDashboard from '../../machinery/dashboard/interfaces/SavedDashboard'
import permissionChecker from '../../utils/PermissionChecker'
import PrincipalContext from '../../utils/contexts/PrincipalContext'
import axiosExceptionHandler from '../../utils/AxiosExceptionHandler'
import toastHelper from '../../utils/ToastHelper'

export default function MachineryDashboardsPanel() {
    const {principal} = useContext(PrincipalContext)
    const toast = useContext(ToastContext)

    const [machineriesWithDashboards, setMachineriesWithDashboards] = useState<MachineryWithDashboards[]>([])
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

    // LOAD MACHINERIES & CORRESPONDING DASHBOARDS
    useEffect(() => {
        if (machinerySort !== 'none') return

        async function getMachineriesAndDashboards() {
            setLoadingMachineries(true)

            try {
                const machineriesMap = await machineryService.getMachineryByCompany()
                const machineriesArray: Machinery[] = []
                machineriesMap.forEach((val) => {
                    machineriesArray.push(...val)
                })

                const machineriesWithDashboardsArray: MachineryWithDashboards[] = []

                for (const machinery of machineriesArray)
                    if (permissionChecker.hasMachineryPermission(principal, machinery.uid, 'dashboardsRead')) {
                        let dashboards: SavedDashboard[]
                        try {
                            dashboards = await dashboardService.getSavedDashboards(machinery.uid)
                        } catch (e) {
                            dashboards = []
                        }

                        machineriesWithDashboardsArray.push({
                            ...machinery,
                            active: true,
                            dashboards
                        })
                    }

                if (machineriesWithDashboards.length > 0) {
                    setMachineriesWithDashboards(machineriesWithDashboardsArray)

                    setMachinerySearch((val) => {
                        val.doSearch = true

                        return {...val}
                    })

                    toastHelper.makeToast(
                        toast,
                        'Sorting applied',
                        'info'
                    )

                    setLoadingMachineries(false)

                    return
                }

                setMachineriesWithDashboards(machineriesWithDashboardsArray)
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboards could not be fetched'
                )
            }

            setLoadingMachineries(false)
        }

        getMachineriesAndDashboards()
    }, [machinerySort, machineriesWithDashboards.length, principal, toast])

    // HANDLE SEARCH
    useEffect(() => {
        if (!machinerySearch.doSearch) return

        const searchTerm = machinerySearch.searchTerm.toLowerCase()
        setMachineriesWithDashboards((val) => {
            val.forEach((el) => {
                if (!searchTerm ||
                    el.uid.toLowerCase().includes(searchTerm) ||
                    el.modelName.toLowerCase().includes(searchTerm) ||
                    el.modelType.toLowerCase().includes(searchTerm) ||
                    el.locationCluster.toLowerCase().includes(searchTerm) ||
                    (el.dashboards.find((dash) => (dash.name.toLowerCase().includes(searchTerm))) != null)
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

            return {...val}
        })
    }, [machinerySearch])

    // HANDLE SORT
    useEffect(() => {
        if (machinerySort === 'none') return

        setMachineriesWithDashboards((val) => {
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
                        return b.dashboards.length - a.dashboards.length
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
    function handleSearchTermChanged(e) {
        setMachinerySearch((val) => {
            val.searchTerm = e.target.value

            return {...val}
        })
    }

    // HANDLE SEARCH BUTTON CLICKED
    function handleSearchButtonClicked() {
        setMachinerySearch((val) => {
            val.doSearch = true

            return {...val}
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
                        placeholder='Search machinery or dashboard'
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
                    <option value='num-dashboards'>Sort by number of dashboards</option>
                </Select>
            </HStack>

            {
                !loadingMachineries &&
                machineriesWithDashboards
                    .filter((machineryWithDashboards) => (machineryWithDashboards.active))
                    .map((machineryWithDashboards) => (
                        <MachineryWithDashboardsCard
                            key={machineryWithDashboards.uid}
                            machineryWithDashboards={machineryWithDashboards}
                            highlightTerm={machinerySearch.highlightTerm}
                        />
                    ))
            }
            {
                !loadingMachineries &&
                machineriesWithDashboards
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
