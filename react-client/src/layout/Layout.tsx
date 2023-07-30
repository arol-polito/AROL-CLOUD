import {Box, useDisclosure} from '@chakra-ui/react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Router from '../router/Router'
import {useContext, useMemo} from 'react'
import PrincipalContext from '../utils/contexts/PrincipalContext'
import SidebarStatusContext from '../utils/contexts/SidebarStatusContext'
import React from 'react';

export default function Layout() {
    const {principal} = useContext(PrincipalContext)
    const {sidebarStatus} = useContext(SidebarStatusContext)

    const {isOpen, onOpen, onClose} = useDisclosure()

    const marginLeft = useMemo(
        () => {
            if (principal == null)
                return '0px'

            if (sidebarStatus.status === 'open')
                return '279px'

            return '65px'
        },
        [principal, sidebarStatus.status]
    )

    const displaySidebar = useMemo(
        () => (principal != null) && sidebarStatus.type !== 'none',
        [principal, sidebarStatus.type]
    )

    return (
        <Box minH="100vh" bg="gray.200">
            {
                displaySidebar &&
                <Sidebar isOpen={isOpen} onOpen={onOpen} onClose={onClose}/>
            }
            <Navbar onOpen={onOpen}/>
            <Box ml={{base: 0, md: marginLeft}} p="4">
                <Router/>
            </Box>
        </Box>
    )
}
