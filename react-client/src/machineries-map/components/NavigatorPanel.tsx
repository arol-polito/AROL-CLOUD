import {Box, Button, Divider, Heading, HStack, Image, Spinner, Text, VStack} from '@chakra-ui/react'
import type Machinery from './Machinery'
import React, {Fragment, useContext} from 'react'
import {FiChevronLeft, FiFileText, FiGrid, FiLock} from 'react-icons/fi'
import {useNavigate} from 'react-router-dom'
import permissionChecker from '../../utils/PermissionChecker'
import PrincipalContext from '../../utils/contexts/PrincipalContext'

interface NavigatorPanelPros {
    machineries: Map<string, Machinery[]>
    setMachineries: React.Dispatch<React.SetStateAction<Map<string, Machinery[]>>>
    machineriesLoading: boolean
    navigator: Navigator
    setNavigator: React.Dispatch<React.SetStateAction<Navigator>>
}

interface Navigator {
    stage: number
    clusterLocation: string
    machineryUID: string
}

export default function NavigatorPanel(props: NavigatorPanelPros) {

    const {machineriesLoading, machineries} = props;
    const {navigator, setNavigator} = props;

    const navigate = useNavigate()

    const {principal} = useContext(PrincipalContext)

    function handleClusterLocationClicked(clusterLocation: string) {
        setNavigator((val) => {
            val.stage = 1
            val.clusterLocation = clusterLocation

            return {...val}
        })
    }

    function handleMachineryClicked(machineryUID: string) {
        setNavigator((val) => {
            val.stage = 2
            val.machineryUID = machineryUID

            return {...val}
        })
    }

    function handleDashboardButtonClicked() {
        if (navigator.stage !== 2) return
        navigate(
            `/machinery/${navigator.machineryUID}/dashboard`,
            {
                state: {
                    machinery: machineries.get(navigator.clusterLocation)
                        ?.find((el) => (el.uid === navigator.machineryUID)),
                    dashboardName: null
                }
            })
    }

    function handleDocumentsButtonClicked() {
        if (navigator.stage !== 2) return
        navigate(
            `/machinery/${navigator.machineryUID}/documents`,
            {
                state: machineries.get(navigator.clusterLocation)
                    ?.find((el) => (el.uid === navigator.machineryUID))
            })
    }

    function handleBackClicked(stage: number) {
        if (stage === 1)
            setNavigator((val) => {
                val.stage = 0

                return {...val}
            })
        else if (stage === 2)
            setNavigator((val) => {
                val.stage = 1

                return {...val}
            })
    }

    return (
        <VStack
            minW="300px"
            maxW="300px"
            h="500px"
            overflowY="auto"
            overflowX="hidden"
            justifyContent="flex-start"
        >
            {navigator.stage === 0 &&
                <VStack py={2}>
                    <Heading size="sm">Locations</Heading>
                </VStack>
            }
            {navigator.stage === 1 &&
                <HStack
                    minWidth="full"
                    alignContent="center"
                    py={2}
                    _hover={{
                        bgColor: 'gray.200',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        handleBackClicked(1)
                    }}
                >
                    <FiChevronLeft/>
                    <Heading w="full" textAlign="center" mr="14px!important"
                             size="sm">{navigator.clusterLocation}</Heading>
                </HStack>
            }
            {navigator.stage === 2 &&
                <HStack
                    minWidth="full"
                    alignContent="center"
                    py={2}
                    _hover={{
                        bgColor: 'gray.200',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        handleBackClicked(2)
                    }}
                >
                    <FiChevronLeft/>
                    <VStack w="full" textAlign="center" mr="14px!important">
                        <Text fontSize="xs" color="gray.500">{navigator.clusterLocation}</Text>
                        <Heading size="sm">{navigator.machineryUID}</Heading>
                    </VStack>
                </HStack>
            }

            <Divider orientation="horizontal"/>

            {
                !machineriesLoading &&
                navigator.stage === 0 &&
                machineries.size > 0 &&
                <VStack
                    w="full"
                    h="full"
                    justifyContent="space-between"
                >
                    <VStack
                        w="full">
                        {
                            Array.from(machineries.entries()).map((entry) => (
                                <Fragment key={entry[0]}>
                                    <VStack
                                        w="full"
                                        // alignItems={"flex-start"}
                                        _hover={{
                                            bgColor: 'gray.200',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            handleClusterLocationClicked(entry[0])
                                        }}
                                    >
                                        <HStack>
                                            <VStack>
                                                <Text fontSize="lg" color="gray.700">
                                                    {entry[0]}
                                                </Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {entry[1].length} machineries
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </VStack>
                                    <Divider orientation="horizontal"/>
                                </Fragment>
                            ))
                        }
                    </VStack>
                    {
                        permissionChecker.isManagerOrAbove(principal) &&
                        <Button
                            w="full"
                            colorScheme="blue"
                            leftIcon={<FiLock/>}
                            onClick={() => {
                                navigate('/permissions')
                            }}
                        >
                            Machinery permissions
                        </Button>
                    }
                </VStack>
            }
            {
                !machineriesLoading &&
                navigator.stage === 0 &&
                machineries.size === 0 &&
                <Text fontSize="md" maxW="full" textAlign="center" my="8!important">
                    Your company has no machineries registered. <br/>
                    Please contact Arol Support to register your machineries.
                </Text>
            }
            {
                !machineriesLoading &&
                navigator.stage === 1 &&
                machineries.get(navigator.clusterLocation)?.map((entry) => (
                    <Fragment key={entry.uid}>
                        <VStack
                            w="full"
                            // alignItems={"flex-start"}
                            _hover={{
                                bgColor: 'gray.200',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                handleMachineryClicked(entry.uid)
                            }}
                        >
                            <HStack>
                                <VStack>
                                    <Text fontSize="lg" color="gray.700">
                                        {entry.uid}
                                    </Text>
                                    <Text fontSize="sm" color="gray.700">
                                        {entry.modelName}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {entry.modelType}
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                        <Divider orientation="horizontal"/>
                    </Fragment>
                ))
            }

            {
                !machineriesLoading &&
                navigator.stage === 2 &&
                [
                    machineries.get(navigator.clusterLocation)
                        ?.find((el) => (el.uid === navigator.machineryUID))
                ]
                    .map((entry) => (
                        <Fragment key={entry?.uid}>
                            <VStack
                                w="full"
                                h="full"
                                justifyContent="space-between"
                            >
                                <VStack
                                    w="full"
                                    overflowY="auto"
                                >
                                    <Box boxSize='150px'>
                                        <Image
                                            src={require(`./../../assets/machineries/${entry?.modelID}.png`)}
                                            alt='Dan Abramov'
                                        />
                                    </Box>
                                    <Text fontSize="lg" color="gray.700">
                                        {entry?.modelName}
                                    </Text>
                                    <Text fontSize="sm" color="gray.700">
                                        {entry?.numHeads} heads
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {entry?.modelType}
                                    </Text>
                                </VStack>
                                <VStack
                                    w="full"
                                    overflowY="hidden"
                                >
                                    <Button
                                        colorScheme="blue"
                                        w="full"
                                        leftIcon={<FiGrid/>}
                                        isDisabled={!permissionChecker.hasMachineryPermission(principal, entry?.uid || '', 'dashboardsRead')}
                                        title={!permissionChecker.hasMachineryPermission(principal, entry?.uid || '', 'dashboardsRead') ? 'Operation not permitted' : ''}
                                        onClick={handleDashboardButtonClicked}
                                    >
                                        Open dashboard
                                    </Button>
                                    <Button
                                        colorScheme="teal"
                                        w="full"
                                        leftIcon={<FiFileText/>}
                                        isDisabled={!permissionChecker.hasMachineryPermission(principal, entry?.uid || '', 'documentsRead')}
                                        title={!permissionChecker.hasMachineryPermission(principal, entry?.uid || '', 'documentsRead') ? 'Operation not permitted' : ''}
                                        onClick={handleDocumentsButtonClicked}
                                    >
                                        Machinery documents
                                    </Button>
                                </VStack>
                            </VStack>
                        </Fragment>
                    ))
            }
            {
                machineriesLoading &&
                <VStack
                    w="full"
                    h="full"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Spinner size="xl"/>
                </VStack>
            }

        </VStack>
    )
}
