import { Box, Heading, HStack } from '@chakra-ui/react'
import MachineryPermissionsPanel from '../components/MachineryPermissionsPanel'
import React from 'react'

export default function MachineryPermissionsPage () {
  return (
        <Box w="full">
            <Heading mb={6}>Machinery permissions management</Heading>
            <HStack
                w="full"
                // bg={useColorModeValue('white', 'gray.900')}
                // boxShadow={'2xl'}
                // rounded={'lg'}
                // p={6}
            >
                <MachineryPermissionsPanel/>
            </HStack>
        </Box>
  )
}
