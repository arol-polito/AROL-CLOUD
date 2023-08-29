import {Divider, Heading, HStack, Text, VStack} from '@chakra-ui/react'
import React from 'react'

interface PieTooltipProps {
    tooltipProps: any
}

export default function PieTooltip(props: PieTooltipProps) {

    const {tooltipProps} = props;

    return (
        <>
            {
                tooltipProps.payload &&
                tooltipProps.payload.length > 0 &&
                tooltipProps.payload[0].payload &&
                <VStack
                    w="fit-content"
                    boxShadow="xl"
                    rounded="xl"
                    bg="white"
                    borderWidth={1}
                    borderColor="gray.400"
                    p={2}
                    alignItems="left"
                >
                    <HStack>
                        <Heading size="sm" whiteSpace="nowrap" w="full" textAlign="center"
                                 color={tooltipProps.payload[0].payload.fill}>{tooltipProps.payload[0].payload.sensorName}</Heading>
                    </HStack>
                    <Divider/>
                    <HStack justifyContent="left">
                        <VStack alignItems="left">
                            <Text fontWeight={400}>Range</Text>
                            <Text fontWeight={400}>Occurrences</Text>
                        </VStack>
                        <VStack alignItems="left">
                            <Text
                                fontWeight={550}>From {tooltipProps.payload[0].payload.bucketStart} to {tooltipProps.payload[0].payload.bucketEnd} {tooltipProps.payload[0].payload.sensorUnit}</Text>
                            <Text fontWeight={550}>{tooltipProps.payload[0].payload.occurrences}</Text>
                        </VStack>
                    </HStack>
                </VStack>
            }
        </>
    )
}
