import {Box, Heading, HStack, useColorModeValue} from "@chakra-ui/react";
import MachineryDocumentsPanel from "../components/MachineryDocumentsPanel";

interface DashboardsPageProps{

}

export default function DocumentsPage(props: DashboardsPageProps){


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
                <MachineryDocumentsPanel />
            </HStack>
        </Box>

    )

}