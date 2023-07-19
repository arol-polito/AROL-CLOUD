import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import {FiEye, FiEyeOff} from "react-icons/fi";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function SignupPage() {

    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState<boolean>(false)

    return (
        <Stack
            minH={'full'}
            direction={{ base: 'column', md: 'row' }}
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow={'2xl'}
            rounded={'lg'}
            p={6}
        >
            <Flex
                minH={'full'}
                align={'center'}
                justify={'center'}
                bg={useColorModeValue('white', 'gray.800')}>
                <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                    <Stack align={'center'}>
                        <Heading fontSize={'4xl'} textAlign={'center'}>
                            Sign up
                        </Heading>
                        {/*<Text fontSize={'lg'} color={'gray.600'}>*/}
                        {/*    to enjoy all of our cool features ✌️*/}
                        {/*</Text>*/}
                    </Stack>
                    <Box
                        // rounded={'lg'}
                        // bg={useColorModeValue('white', 'gray.700')}
                        // boxShadow={'lg'}
                        p={8}>
                        <Stack spacing={4}>
                            <HStack>
                                <Box>
                                    <FormControl id="firstName" isRequired>
                                        <FormLabel>First Name</FormLabel>
                                        <Input type="text" />
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl id="lastName">
                                        <FormLabel>Last Name</FormLabel>
                                        <Input type="text" />
                                    </FormControl>
                                </Box>
                            </HStack>
                            <FormControl id="email" isRequired>
                                <FormLabel>Email address</FormLabel>
                                <Input type="email" />
                            </FormControl>
                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <Input type={showPassword ? 'text' : 'password'} />
                                    <InputRightElement h={'full'}>
                                        <Button
                                            variant={'ghost'}
                                            onClick={() =>
                                                setShowPassword((showPassword) => !showPassword)
                                            }>
                                            {showPassword ? <FiEye /> : <FiEyeOff />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Stack spacing={10} pt={2}>
                                <Button
                                    loadingText="Submitting"
                                    size="lg"
                                    bg={'blue.400'}
                                    color={'white'}
                                    _hover={{
                                        bg: 'blue.500',
                                    }}>
                                    Sign up
                                </Button>
                            </Stack>
                            <Stack pt={6}>
                                <Text align={'center'}>
                                    Already a user?
                                    <Link
                                        color={'blue.400'}
                                        onClick={()=>(navigate("/login"))}
                                    >
                                        Login
                                    </Link>
                                </Text>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Flex>
            <Flex flex={1}>
                <Image
                    alt={'Login Image'}
                    objectFit={'contain'}
                    src={require("./../../assets/arol-logo.png")}
                />
            </Flex>
        </Stack>
    );
}