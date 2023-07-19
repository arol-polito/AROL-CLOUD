import {Box, Button, Heading, Text, useColorModeValue} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";

export default function PageNotFound(props: any) {

    const navigate = useNavigate()

    return (
        <Box
            minW={"full"}
            minH={"100vh"}
            textAlign="center"
            py={10}
            px={6}
        >
            <Box
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'2xl'}
                rounded={'lg'} 
                p={6}
                mt={15}
                display={"inline-block"}
            >
                <Heading
                    display="inline-block"
                    as="h2"
                    size="2xl"
                    bgGradient="linear(to-r, blue.400, blue.600)"
                    backgroundClip="text">
                    404
                </Heading>
                <Text fontSize="18px" mt={3} mb={2}>
                    Page Not Found
                </Text>
                <Text color={'gray.500'} mb={6}>
                    The page you're looking for does not seem to exist
                </Text>

                <Button
                    colorScheme="blue"
                    bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
                    color="white"
                    variant="solid"
                    onClick={()=>(navigate("/"))}
                >
                    Go to Home
                </Button>
            </Box>
        </Box>
    )
}