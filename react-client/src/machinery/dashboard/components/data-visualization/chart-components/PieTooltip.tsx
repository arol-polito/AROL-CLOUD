import exp from "constants";
import {TooltipProps} from "recharts";
import {Divider, Heading, HStack, VStack, Text} from "@chakra-ui/react";
import React from "react";

interface PieTooltipProps {
    tooltipProps: any
}

export default function PieTooltip(props: PieTooltipProps){

    // console.log(props.tooltipProps.payload[0])

    return(
        <>
            {
                props.tooltipProps.payload &&
                props.tooltipProps.payload.length>0 &&
                props.tooltipProps.payload[0].payload &&
                <VStack
                    w={"fit-content"}
                    boxShadow={'xl'}
                    rounded={'xl'}
                    bg={"white"}
                    borderWidth={1}
                    borderColor={"gray.400"}
                    p={2}
                    alignItems={"left"}
                >
                    <HStack>
                        <Heading size={"sm"} whiteSpace={"nowrap"} w={"full"} textAlign={"center"} color={props.tooltipProps.payload[0].payload.fill}>{props.tooltipProps.payload[0].payload.sensorName}</Heading>
                    </HStack>
                    <Divider />
                    <HStack justifyContent={"left"}>
                        <VStack alignItems={"left"}>
                            <Text fontWeight={400}>Range</Text>
                            <Text fontWeight={400}>Occurrences</Text>
                        </VStack>
                        <VStack alignItems={"left"}>
                            <Text fontWeight={550}>From {props.tooltipProps.payload[0].payload.bucketStart} to {props.tooltipProps.payload[0].payload.bucketEnd} {props.tooltipProps.payload[0].payload.sensorUnit}</Text>
                            <Text fontWeight={550}>{props.tooltipProps.payload[0].payload.occurrences}</Text>
                        </VStack>
                    </HStack>
                </VStack>
            }
        </>
    )

}