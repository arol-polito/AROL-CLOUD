import MachineryWithDashboards from "../interfaces/MachineryWithDashboards";
import {useNavigate} from "react-router-dom";
import {Button, Divider, Heading, HStack, Image, Text, VStack} from "@chakra-ui/react";
import {FiFolder, FiSearch} from "react-icons/fi";
import React, {Fragment} from "react";
import dayjs from "dayjs";
import helperFunctions from "../../utils/HelperFunctions";

interface MachineryWithDashboardsCardProps {
    machineryWithDashboards: MachineryWithDashboards
    highlightTerm: string
}

export default function MachineryWithDashboardsCard(props: MachineryWithDashboardsCardProps) {

    const navigate = useNavigate()

    return (

        <VStack
            p={6}
            w={"full"}
            borderWidth={1}
            borderColor={"gray.200"}
            bgColor={"white"}
            rounded={'md'}
        >
            <HStack
                w={"full"}
                h={"200px"}
            >
                <HStack
                    minW={"200px"}
                    maxW={"200px"}
                    justifyContent={"center"}
                >
                    <Image
                        boxSize={"200px"}
                        objectFit="contain"
                        // src={require("/src/assets/machineries/"+ props.machinery.modelID + ".png")}
                        src={require("./../../assets/machineries/" + props.machineryWithDashboards.modelID + ".png")}
                    />
                </HStack>
                <Divider orientation={"vertical"} h={"full"}/>

                <VStack
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    flexWrap={"nowrap"}
                    w={"full"}
                    h={"full"}
                    p={1}
                >
                    <Heading fontSize={"md"} fontFamily={"body"} fontWeight={450} color={"gray.400"}
                             whiteSpace={"nowrap"}>
                        {helperFunctions.highlightText(props.machineryWithDashboards.uid, 450, props.highlightTerm)}
                    </Heading>
                    <Heading
                        fontSize={"2xl"}
                        fontFamily={"body"}
                        fontWeight={550}
                        whiteSpace={"nowrap"}
                        mb={"4!important"}
                    >
                        {helperFunctions.highlightText(props.machineryWithDashboards.modelName, 550, props.highlightTerm)}
                    </Heading>
                    <Text
                        fontWeight={300}
                        color={"gray.400"}
                        whiteSpace={"nowrap"}
                        fontSize={"sm"}
                    >
                        Machinery type
                    </Text>
                    <Text
                        // fontWeight={600}
                        color={"black"}
                        fontSize="md"
                        fontWeight={400}
                        whiteSpace={"nowrap"}
                        mt={"0!important"}
                        mb={4}
                    >
                        {helperFunctions.highlightText(props.machineryWithDashboards.modelType, 400, props.highlightTerm)}
                    </Text>
                    <Text
                        fontWeight={300}
                        color={"gray.400"}
                        whiteSpace={"nowrap"}
                        fontSize={"sm"}
                    >
                        Machinery location
                    </Text>
                    <Text
                        color={"black"}
                        fontWeight={400}
                        whiteSpace={"nowrap"}
                        mt={"0!important"}
                        mb={4}
                    >
                        {helperFunctions.highlightText(props.machineryWithDashboards.locationCluster, 400, props.highlightTerm)}
                    </Text>
                </VStack>
                <VStack
                    w="full"
                    h="full"
                    justifyContent={"flex-start"}
                    alignItems={"end"}
                >
                    <Button
                        leftIcon={<FiFolder/>}
                        colorScheme={"blue"}
                        onClick={() => (navigate("/machinery/" + props.machineryWithDashboards.uid + "/dashboard", {
                                state: {
                                    machinery: {...props.machineryWithDashboards},
                                    dashboardName: null
                                }
                            })
                        )}
                    >
                        Open dashboard
                    </Button>
                </VStack>
            </HStack>
            <Divider/>
            {
                props.machineryWithDashboards.dashboards.length > 0 &&
                props.machineryWithDashboards.dashboards.map((savedDashboard, index) => (
                    <Fragment key={savedDashboard.name}>
                        <HStack
                            w={"full"}
                        >
                            <VStack
                                w={"full"}
                                alignItems={"left"}
                            >
                                {
                                    savedDashboard.isDefault &&
                                    <Text fontSize={"xs"} fontWeight={600} color={"green"}>
                                        Default dashboard
                                    </Text>
                                }
                                <HStack
                                    alignItems={"baseline"}
                                    mt={"0!important"}
                                >
                                    <Text fontSize={"md"} fontWeight={500}
                                          mt={savedDashboard.isDefault ? "0!important" : ""}>
                                        {helperFunctions.highlightText(savedDashboard.name, 500, props.highlightTerm)}
                                    </Text>
                                    <Text fontSize={"xs"} color={"gray.500"} fontWeight={500}>
                                        Saved on {dayjs(savedDashboard.timestamp).format("ddd, MMM D, YYYY H:mm")}
                                    </Text>
                                </HStack>
                                <HStack
                                    mt={"0!important"}
                                >
                                    <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                                        {savedDashboard.numSensorsMonitored} sensors monitored
                                    </Text>
                                    <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                                        | {savedDashboard.numWidgets} widgets
                                    </Text>
                                </HStack>
                            </VStack>
                            <VStack>
                                <Button
                                    leftIcon={<FiSearch />}
                                    w={"full"}
                                    colorScheme='teal'
                                    variant='solid'
                                    onClick={() => (navigate("/machinery/" + props.machineryWithDashboards.uid + "/dashboard", {
                                            state: {
                                                machinery: {...props.machineryWithDashboards},
                                                dashboardName: savedDashboard.name
                                            }
                                        })
                                    )}
                                >
                                    Load dashboard
                                </Button>
                            </VStack>
                        </HStack>
                        {
                            index<props.machineryWithDashboards.dashboards.length-1 &&
                            <Divider/>
                        }
                    </Fragment>
                ))
            }
            {
                props.machineryWithDashboards.dashboards.length === 0 &&
                <HStack
                    w={"full"}
                    justifyContent={"center"}
                >
                    <Text pt={3} fontSize={"sm"} fontWeight={500}>This machinery has no saved dashboards</Text>
                </HStack>
            }
        </VStack>
    )

}