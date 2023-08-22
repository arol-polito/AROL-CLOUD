import {useNavigate} from 'react-router-dom'
import {Button, Divider, Heading, HStack, Image, Text, VStack} from '@chakra-ui/react'
import {FiFolder, FiSearch} from 'react-icons/fi'
import React, {Fragment} from 'react'
import type MachineryWithDocuments from '../interfaces/MachineryWithDocuments'
import helperFunctions from '../../utils/HelperFunctions'

interface MachineryWithDashboardsCardProps {
    machineryWithDocuments: MachineryWithDocuments
    highlightTerm: string
}

export default function MachineryWithDocumentsCard(props: MachineryWithDashboardsCardProps) {

    const {machineryWithDocuments, highlightTerm} = props;

    const navigate = useNavigate()

    // FORMAT FILE PATH
    function getFilePath(inputFilePath: string) {
        const startIndex = inputFilePath.indexOf(machineryWithDocuments.uid)

        return inputFilePath.slice(startIndex + machineryWithDocuments.uid.length).toString()
    }

    return (

        <VStack
            p={6}
            w="full"
            borderWidth={1}
            borderColor="gray.200"
            bgColor="white"
            rounded="md"
        >
            <HStack
                w="full"
                h="200px"
            >
                <HStack
                    minW="200px"
                    maxW="200px"
                    justifyContent="center"
                >
                    <Image
                        boxSize="200px"
                        objectFit="contain"
                        // src={require("/src/assets/machineries/"+ machinery.modelID + ".png")}
                        src={require(`./../../assets/machineries/${machineryWithDocuments.modelID}.png`)}
                    />
                </HStack>
                <Divider orientation="vertical" h="full"/>

                <VStack
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    flexWrap="nowrap"
                    w="full"
                    h="full"
                    p={1}
                >
                    <Heading fontSize="md" fontFamily="body" fontWeight={450} color="gray.400"
                             whiteSpace="nowrap">
                        {helperFunctions.highlightText(machineryWithDocuments.uid, 450, highlightTerm)}
                    </Heading>
                    <Heading
                        fontSize="2xl"
                        fontFamily="body"
                        fontWeight={550}
                        whiteSpace="nowrap"
                        mb="4!important"
                    >
                        {helperFunctions.highlightText(machineryWithDocuments.modelName, 550, highlightTerm)}
                    </Heading>
                    <Text
                        fontWeight={300}
                        color="gray.400"
                        whiteSpace="nowrap"
                        fontSize="sm"
                    >
                        Machinery type
                    </Text>
                    <Text
                        // fontWeight={600}
                        color="black"
                        fontSize="md"
                        fontWeight={400}
                        whiteSpace="nowrap"
                        mt="0!important"
                        mb={4}
                    >
                        {helperFunctions.highlightText(machineryWithDocuments.modelType, 400, highlightTerm)}
                    </Text>
                    <Text
                        fontWeight={300}
                        color="gray.400"
                        whiteSpace="nowrap"
                        fontSize="sm"
                    >
                        Machinery location
                    </Text>
                    <Text
                        color="black"
                        fontWeight={400}
                        whiteSpace="nowrap"
                        mt="0!important"
                        mb={4}
                    >
                        {helperFunctions.highlightText(machineryWithDocuments.locationCluster, 400, highlightTerm)}
                    </Text>
                </VStack>
                <VStack
                    w="full"
                    h="full"
                    justifyContent="flex-start"
                    alignItems="end"
                >
                    <Button
                        leftIcon={<FiFolder/>}
                        colorScheme="blue"
                        onClick={() => {
                            navigate(`/machinery/${machineryWithDocuments.uid}/documents`, {
                                state: {
                                    machinery: {...machineryWithDocuments}
                                }
                            })
                        }}
                    >
                        Open document browser
                    </Button>
                </VStack>
            </HStack>
            <Divider/>
            <VStack
                w="full"
                maxH="350px"
                overflowY="auto"
            >
                {
                    machineryWithDocuments.documents.length > 0 &&
                    machineryWithDocuments.documents.map((document, index) => (
                        <Fragment key={document.id}>
                            <HStack
                                w="full"
                            >
                                <VStack
                                    w="full"
                                    alignItems="left"
                                >

                                    <HStack
                                        alignItems="baseline"
                                        mt="0!important"
                                    >
                                        <Text fontSize="md" fontWeight={500}>
                                            {helperFunctions.highlightText(document.name, 500, highlightTerm)}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500" fontWeight={500}>
                                            {document.size} KB
                                        </Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500" fontWeight={500} mt="0!important">
                                        {getFilePath(document.parentId)}
                                    </Text>
                                </VStack>
                                <VStack>
                                    <Button
                                        leftIcon={<FiSearch/>}
                                        w="full"
                                        colorScheme='teal'
                                        variant='solid'
                                        onClick={() => {
                                            document.documentUID && navigate(`/machinery/${machineryWithDocuments.uid}/documents/${document.documentUID.split('\\').pop()}` /* Document UID */, {
                                                state: {
                                                    document,
                                                    machinery: machineryWithDocuments
                                                }
                                            })
                                        }}
                                    >
                                        View document
                                    </Button>
                                </VStack>
                            </HStack>
                            {
                                index < machineryWithDocuments.documents.length - 1 &&
                                <Divider/>
                            }
                        </Fragment>
                    ))
                }
            </VStack>
            {
                machineryWithDocuments.documents.length === 0 &&
                <HStack
                    w="full"
                    justifyContent="center"
                >
                    <Text pt={3} fontSize="sm" fontWeight={500}>This machinery has no stored documents</Text>
                </HStack>
            }
        </VStack>
    )
}
