import { Box, Heading, HStack } from '@chakra-ui/react'
import MachineryDashboardsPanel from '../components/MachineryDashboardsPanel'
import React from "react";

export default function DashboardsPage () {
  return (

        <Box w="full">
            <Heading mb={6}>Dashboards</Heading>
            <HStack
                w="full"
                // bg={useColorModeValue('white', 'gray.900')}
                // boxShadow={'2xl'}
                // rounded={'lg'}
                // p={6}
            >
                <MachineryDashboardsPanel/>
            </HStack>
        </Box>

  )
}
