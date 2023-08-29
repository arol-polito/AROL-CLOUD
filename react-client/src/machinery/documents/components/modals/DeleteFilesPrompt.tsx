import React, {Fragment, useRef} from 'react'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    HStack,
    Text,
    VStack
} from '@chakra-ui/react'
import {FiAlertTriangle} from 'react-icons/fi'
import {type FileData} from 'chonky'

interface DeleteFiles {
    promptOpen: boolean
    filesToDelete: FileData[]
    doDelete: boolean
}

interface DeleteFilesPromptProps {
    deleteFiles: DeleteFiles
    setDeleteFiles: React.Dispatch<React.SetStateAction<DeleteFiles>>
}

export default function DeleteFilesPrompt(props: DeleteFilesPromptProps) {

    const {deleteFiles, setDeleteFiles} = props;

    const cancelRef = useRef<HTMLButtonElement>(null)

    function handleCancel() {
        setDeleteFiles({
            promptOpen: false,
            filesToDelete: [],
            doDelete: false
        })
    }

    function handleDeleteClicked() {
        setDeleteFiles((val) => ({
            promptOpen: false,
            filesToDelete: val.filesToDelete,
            doDelete: true
        }))
    }

    return (
        <AlertDialog
            isOpen={deleteFiles.promptOpen}
            leastDestructiveRef={cancelRef}
            onClose={handleCancel}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete Files
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        The following files and folders will be deleted:
                        <VStack
                            w="full"
                            alignItems="left"
                            mt={2}
                            mb={6}
                        >
                            {
                                deleteFiles.filesToDelete.map((fileToDelete) => (
                                    <Fragment key={fileToDelete.id}>
                                        <Text fontSize="md" fontWeight={600}>• {fileToDelete.name}</Text>
                                        {
                                            fileToDelete.isDir &&
                                            <HStack
                                                w="full"
                                                justifyContent="left"
                                                alignItems="center"
                                                mt="0!important"
                                            >
                                                <FiAlertTriangle color="red"/>
                                                <Text fontSize="sm" color="red" mt="0!important">All files under
                                                    this directory will be deleted too</Text>
                                            </HStack>
                                        }
                                    </Fragment>
                                ))
                            }
                        </VStack>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={handleDeleteClicked} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
