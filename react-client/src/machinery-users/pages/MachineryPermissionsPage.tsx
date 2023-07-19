import {Box, Heading, HStack} from "@chakra-ui/react";
import UsersPanel from "../../users/components/UsersPanel";
import MachineryPermissionsPanel from "../components/MachineryPermissionsPanel";

interface MachineryPermissionsPageProps {

}

export default function MachineryPermissionsPage(props: MachineryPermissionsPageProps){


    return(
        <Box w={"full"}>
            <Heading mb={6}>Machinery permissions management</Heading>
            <HStack
                w={"full"}
                // bg={useColorModeValue('white', 'gray.900')}
                // boxShadow={'2xl'}
                // rounded={'lg'}
                // p={6}
            >
                <MachineryPermissionsPanel />
            </HStack>
        </Box>
    )

}