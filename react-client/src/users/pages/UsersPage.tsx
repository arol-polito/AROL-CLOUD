import {Box, Heading, HStack} from '@chakra-ui/react'
import UsersPanel from '../components/UsersPanel'
import React from 'react'

export default function UsersPage() {
    return (
        <Box w="full">
            <Heading mb={6}>Users management</Heading>
            <HStack
                w="full"
            >
                <UsersPanel/>
            </HStack>
        </Box>
    )
}
