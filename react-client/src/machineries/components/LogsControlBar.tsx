import { Box, FormLabel, HStack, Switch, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

interface LogsControlBarProps {
  expandAll: string
  setExpandAll: Function
  numLogs: number | undefined
}

export default function LogsControlBar (props: LogsControlBarProps) {
  function handleExpandAllSwitchClicked (event: React.ChangeEvent<HTMLInputElement>) {
    props.setExpandAll(event.target.checked ? 'true' : 'false')
  }

  return (
        <HStack
            w="full"
            alignItems="stretch"
            justifyContent="space-between"
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow="2xl"
            rounded="lg"
            px={6}
            py={2}
            mt={2}
            mb={6}
        >
            <Box>
                <Text>{props.numLogs ? props.numLogs : ''} results</Text>
            </Box>
            <Box>
                <HStack
                    alignItems="baseline"
                    _hover={{
                      cursor: 'pointer'
                    }}
                >
                    <FormLabel htmlFor='expandAll'>Expand all</FormLabel>
                    <Switch
                        id='expandAll'
                        size="md"
                        isChecked={props.expandAll === 'true'}
                        onChange={(e) => {
                          handleExpandAllSwitchClicked(e)
                        }}
                    />
                </HStack>
            </Box>
        </HStack>
  )
}
