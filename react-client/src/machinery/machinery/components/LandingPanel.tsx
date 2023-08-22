import {Divider, HStack, Text, useColorModeValue, VStack} from '@chakra-ui/react'
import {FiFileText, FiGrid} from 'react-icons/fi'
import {useNavigate} from 'react-router-dom'
import type Machinery from '../../../machineries-map/components/Machinery'
import React, {useContext, useEffect, useState} from 'react'
import PrincipalContext from '../../../utils/contexts/PrincipalContext'
import permissionChecker from '../../../utils/PermissionChecker'

interface LandingPanelProps {
    machinery: Machinery
}

export default function LandingPanel(props: LandingPanelProps) {

    const {machinery} = props;

    const navigate = useNavigate()

    const {principal} = useContext(PrincipalContext)

    const [hasDashboardsAccess, setHasDashboardsAccess] = useState(true)
    const [hasDocumentsAccess, setHasDocumentsAccess] = useState(true)

    useEffect(() => {
        setHasDashboardsAccess(permissionChecker.hasAnyDashboardAccess(principal))
        setHasDocumentsAccess(permissionChecker.hasAnyDocumentsAccess(principal))
    }, [principal])

    function handleNavigate(to: string) {
        navigate(to, {state: machinery})
    }

    return (
        <VStack
            h="400px"
            w="full"
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow="2xl"
            rounded="lg"
            p={6}
        >
            <HStack
                w="full"
                h="full"
                alignItems="center"
            >
                <VStack
                    h="full"
                    flexGrow={1}
                    alignItems="center"
                    justifyContent="center"
                    mr={2}
                    _hover={hasDashboardsAccess
                        ? {
                            cursor: 'pointer',
                            bgColor: 'gray.100'
                        }
                        : {
                            cursor: 'not-allowed'
                        }}
                    title={!hasDashboardsAccess ? 'Operation not permitted' : ''}
                    onClick={() => {
                        hasDashboardsAccess && handleNavigate(`/machinery/${machinery.uid}/dashboard`)
                    }}
                >
                    <FiGrid size={100} color={hasDashboardsAccess ? '#000000' : '#A0AEC0'}/>
                    <Text fontSize="2xl" pt={3} color={hasDashboardsAccess ? 'black' : 'gray.400'}>Dashboard</Text>
                </VStack>
                <Divider orientation="vertical" h="full" pr={2}/>
                <VStack
                    h="full"
                    flexGrow={1}
                    alignItems="center"
                    justifyContent="center"
                    _hover={hasDocumentsAccess
                        ? {
                            cursor: 'pointer',
                            bgColor: 'gray.100'
                        }
                        : {
                            cursor: 'not-allowed'
                        }}
                    title={!hasDocumentsAccess ? 'Operation not permitted' : ''}
                    onClick={() => {
                        hasDocumentsAccess && handleNavigate(`/machinery/${machinery.uid}/documents`)
                    }}
                >
                    <FiFileText size={100} color={hasDocumentsAccess ? '#000000' : '#A0AEC0'}/>
                    <Text fontSize="2xl" pt={3} color={hasDocumentsAccess ? 'black' : 'gray.400'}>Documents</Text>
                </VStack>
            </HStack>
        </VStack>
    )
}
