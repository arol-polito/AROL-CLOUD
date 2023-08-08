import { Box, Heading, HStack } from '@chakra-ui/react'
import MachineryDocumentsPanel from '../components/MachineryDocumentsPanel'
import React from 'react';

export default function DocumentsPage () {
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
                <MachineryDocumentsPanel/>
            </HStack>
        </Box>

  )
}
