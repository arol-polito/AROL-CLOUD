import {Button, HStack, Input, InputGroup, InputLeftAddon, Text, useColorModeValue, VStack} from '@chakra-ui/react'
import type LogsParameters from '../classes/LogsParameters'
import React, {useState} from 'react'
import dayjs from 'dayjs'

interface LogsFilteringBarProps {
    machineryLogsFilter: LogsParameters
    setMachineryLogFilters: Function
}

export default function LogsFilteringBar(props: LogsFilteringBarProps) {

    const {machineryLogsFilter, setMachineryLogFilters} = props;

    const [dateErrors, setDateErrors] = useState({
        fromError: '',
        toError: ''
    })

    function handleDateChanged(from: boolean, to: boolean, event: React.ChangeEvent<HTMLInputElement>) {

        const inputDate = dayjs(event.target.value)

        if (from) {
            if (machineryLogsFilter?.to &&
                inputDate.isAfter(dayjs(machineryLogsFilter.to))
            ) {
                setDateErrors((val) => {
                    val.fromError = 'Start date cannot be later than end date'

                    return {...val}
                })

                return
            }

            setDateErrors({fromError: '', toError: ''})
            setMachineryLogFilters((val: LogsParameters) => {
                val.from = event.target.value

                return {...val}
            })

            return
        }
        if (to) {
            if (machineryLogsFilter?.from &&
                inputDate.isBefore(dayjs(machineryLogsFilter.from))
            ) {
                setDateErrors((val) => {
                    val.toError = 'End date cannot be earlier than start date'

                    return {...val}
                })

                return
            }

            setDateErrors({fromError: '', toError: ''})
            setMachineryLogFilters((val: LogsParameters) => {
                val.to = event.target.value

                return {...val}
            })
        }
    }

    function handleSearchButtonPressed() {
        setMachineryLogFilters((val: LogsParameters) => {
            val.submit = true

            return {...val}
        })
    }

    function handleResetButtonPressed() {
        setMachineryLogFilters((val: LogsParameters) => {
            val.from = null
            val.to = null
            val.submit = true

            return {...val}
        })
    }

    return (

        <HStack
            justifyContent="space-between"
            flexWrap="wrap"
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow="2xl"
            rounded="lg"
            gap={5}
            p={6}
            mt={6}
        >
            <HStack alignItems="start">
                <VStack>
                    <InputGroup>
                        <InputLeftAddon>
                            Start date
                        </InputLeftAddon>
                        <Input
                            width="fit-content"
                            placeholder="Select Date and Time"
                            size="md"
                            type="datetime-local"
                            value={machineryLogsFilter?.from ? machineryLogsFilter.from : ''}
                            onChange={(e) => {
                                handleDateChanged(true, false, e)
                            }}
                        />
                    </InputGroup>
                    {
                        dateErrors.fromError &&
                        <Text size="sm" color="red.500">{dateErrors.fromError}</Text>
                    }
                </VStack>

                <VStack>
                    <InputGroup>
                        <InputLeftAddon>
                            End date
                        </InputLeftAddon>
                        <Input
                            width="fit-content"
                            placeholder="Select Date and Time"
                            size="md"
                            type="datetime-local"
                            value={machineryLogsFilter?.to ? machineryLogsFilter.to : ''}
                            onChange={(e) => {
                                handleDateChanged(false, true, e)
                            }}
                        />
                    </InputGroup>
                    {
                        dateErrors.toError &&
                        <Text size="sm" color="red.500">{dateErrors.toError}</Text>
                    }
                </VStack>
            </HStack>
            <HStack ml="0!important">
                <Button
                    size="md"
                    onClick={handleResetButtonPressed}
                >
                    Reset
                </Button>
                <Button
                    colorScheme="blue"
                    size="md"
                    onClick={handleSearchButtonPressed}
                >
                    Search
                </Button>
            </HStack>
        </HStack>
    )
}
