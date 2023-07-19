import {Box, Heading, HStack} from "@chakra-ui/react";
import MachineryDocumentsPanel from "../../documents/components/MachineryDocumentsPanel";
import UsersPanel from "../components/UsersPanel";

interface UsersPageProps {

}

export default function UsersPage(props: UsersPageProps){


    return(
        <Box w={"full"}>
            <Heading mb={6}>Users management</Heading>
            <HStack
                w={"full"}
                // bg={useColorModeValue('white', 'gray.900')}
                // boxShadow={'2xl'}
                // rounded={'lg'}
                // p={6}
            >
                <UsersPanel />
            </HStack>
        </Box>
    )

}