import { Box, Heading, HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import React, { useEffect, useState } from 'react'
import type LogItemProps from '../classes/LogItemProps'
import LoremIpsum from 'react-lorem-ipsum'

export default function LogItem (props: LogItemProps) {
  const [expanded, setExpanded] = useState<boolean>(false)

  useEffect(() => {
    if (props.expandAll === 'indeterminate') return

    setExpanded(props.expandAll === 'true')
  }, [props.expandAll])

  function handleExpandCollapse () {
    setExpanded((val) => (!val))
    props.setExpandAll('indeterminate')
  }

  function handleLogItemCardClicked () {
    if (expanded) return

    setExpanded(true)
  }

  return (

        <VStack
            w="full"
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow="2xl"
            rounded="lg"
            px={6}
            py={3}
            _hover={{
              cursor: expanded ? 'default' : 'pointer'
            }}
            onClick={handleLogItemCardClicked}
        >
            <HStack w="full" justifyContent="space-between">
                <Box>
                    <Text size="sm" color="gray.500">{props.log.timestamp}</Text>
                    <Heading size="md" textTransform="capitalize">{props.log.title}</Heading>
                </Box>
                <Box
                    _hover={{
                      cursor: 'pointer'
                    }}
                    onClick={handleExpandCollapse}
                >
                    {expanded && <FiChevronUp/>}
                    {!expanded && <FiChevronDown/>}
                </Box>
            </HStack>
            {
                expanded &&
                <HStack w="full" justifyContent="left">
                    <Text size="md">
                        {/* {props.log.text} */}
                        <LoremIpsum p={1}/>
                    </Text>
                </HStack>
            }
            {/* <Divider orientation={"horizontal"} w={"full"} color={"gray.500"} /> */}
        </VStack>

  )
}
