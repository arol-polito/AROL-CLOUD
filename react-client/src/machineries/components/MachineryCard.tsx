import { Avatar, Box, Button, Heading, HStack, Text, Tooltip, useColorModeValue, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import type Machinery from '../classes/Machinery'
import React from 'react';

export default function MachineryCard (props: Machinery) {
  return (
        <VStack
            maxW="300px"
            minW="300px"
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow="2xl"
            rounded="lg"
            p={6}
        >
            <HStack alignItems="flex-start" justifyContent="left" flexDirection="row" minWidth="100%">
                <Box>
                    <Avatar
                        size="lg"
                        src={
                            require(`/src/assets/machineries/${props.type}.png`)
                        }
                        mb={4}
                        pos="relative"
                    >
                        <Tooltip label={props.status === 'active' ? 'Active' : 'Inactive'}>
                            <Box
                                w="5"
                                h="5"
                                bg={props.status === 'active' ? 'green.500' : 'red.500'}
                                border='2px solid white'
                                rounded='full'
                                pos='absolute'
                                bottom="0"
                                right="0"
                            />
                        </Tooltip>
                    </Avatar>
                </Box>
                <Box>
                    <Heading fontSize="lg" fontFamily="body">
                        {props.name}
                    </Heading>
                    <Text fontSize="md" fontWeight={600} color="gray.500" mb={4}>
                        ID: {props.id}
                    </Text>
                </Box>
            </HStack>
            <HStack minWidth="100%" justifyContent="space-between">
                <VStack alignItems="flex-start">
                    <Box mb="4px!important">
                        <Text fontSize="xs" fontWeight="bold">Type: </Text>
                        <Text mt="0px!important">{props.type}</Text>
                    </Box>
                    <Box mb="4px!important">
                        <Text fontSize="xs" fontWeight="bold">Location: </Text>
                        <Text mt="0px!important">{props.location}</Text>
                    </Box>
                </VStack>
                <VStack minHeight="100%" justifyContent="flex-end" alignItems="flex-end">
                    <RouterLink to={`/machineries/${props.id}`}>
                        <Button
                            flex={1}
                            fontSize="sm"
                            rounded="full"
                            bg="blue.400"
                            color="white"
                            boxShadow="0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                            _hover={{
                              bg: 'blue.500'
                            }}
                            _focus={{
                              bg: 'blue.500'
                            }}>
                            Logs
                        </Button>
                    </RouterLink>
                </VStack>
            </HStack>
        </VStack>
  )
}
