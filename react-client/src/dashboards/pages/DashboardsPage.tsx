import {Box, Heading, HStack, useColorModeValue} from "@chakra-ui/react";
import MachineryDashboardsPanel from "../components/MachineryDashboardsPanel";

interface DashboardsPageProps{

}

export default function DashboardsPage(props: DashboardsPageProps){


    return(

        <Box w={"full"}>
            <Heading mb={6}>Dashboards</Heading>
            <HStack
                w={"full"}
                // bg={useColorModeValue('white', 'gray.900')}
                // boxShadow={'2xl'}
                // rounded={'lg'}
                // p={6}
            >
                <MachineryDashboardsPanel />
            </HStack>
        </Box>

    )

}