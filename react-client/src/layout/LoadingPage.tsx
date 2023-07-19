import {Box, Spinner} from "@chakra-ui/react";


export default function LoadingPage(){

    return (
        <Box
            minW={"full"}
            minH={"100vh"}
            bg='blackAlpha.300'
        >
            <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='transparent'
                color='blue.500'
                size='xl'
                position={"absolute"}
                top={"50%"}
                left={"50%"}
            />
        </Box>
    )
}