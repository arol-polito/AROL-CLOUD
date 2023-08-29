import type Machinery from '../../../../machineries-map/components/Machinery'
import React, {type ChangeEvent, useEffect, useRef, useState} from 'react'
import type {FileMap} from '../../interfaces/FileMap'
import type FileMapEntry from '../../interfaces/FileMapEntry'
import documentsService from '../../../../services/DocumentsService'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Input,
    Text,
    VStack
} from '@chakra-ui/react'

interface NewFolderPromptProps {
    machinery: Machinery
    newFolderPromptOpen: boolean
    setNewFolderPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    fileMap: FileMap
    setFileMap: React.Dispatch<React.SetStateAction<FileMap>>
    currentFolderId: string
}

export default function NewFolderPrompt(props: NewFolderPromptProps) {

    const {machinery, fileMap, newFolderPromptOpen} = props;
    const {currentFolderId, setFileMap, setNewFolderPromptOpen} = props;

    const [newFolderName, setNewFolderName] = useState<string>('New folder')
    const [createFolder, setCreateFolder] = useState<boolean>(false)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [folderExists, setFolderExists] = useState<boolean>(false)
    const [folderNotCreated, setFolderNotCreated] = useState<boolean>(false)

    const cancelRef = useRef<HTMLButtonElement>(null)

    // CREATE NEW FOLDER AND UPDATE FILE MAP
    useEffect(() => {
        if (!createFolder) return

        if (fileMap.hasOwnProperty(`${currentFolderId}\\${newFolderName}`)) {
            setFolderExists(true)

            return
        }

        async function create() {
            setFolderNotCreated(false)

            setIsCreating(true)

            try {
                const folder: FileMapEntry = {
                    childrenCount: 0,
                    childrenIds: [],
                    id: `${currentFolderId}\\${newFolderName}`,
                    documentUID: null,
                    isDir: true,
                    isDocument: false,
                    isModifiable: true,
                    modDate: new Date(),
                    name: newFolderName,
                    parentId: currentFolderId,
                    size: 0
                }

                const result = await documentsService.createMachineryFolder(machinery.uid, folder.id)

                if (!result) {
                    setFolderNotCreated(true)

                    return
                }

                setFileMap((val) => {
                    val[folder.id] = folder

                    if (val.hasOwnProperty(currentFolderId)) {
                        const currentFolder = {...val[currentFolderId]}
                        currentFolder.childrenIds = [...currentFolder.childrenIds, folder.id]
                        currentFolder.childrenCount++

                        val[currentFolderId] = currentFolder
                    }

                    return {...val}
                })

                setNewFolderPromptOpen(false)
            } catch (e) {
                console.error(e)
                setFolderNotCreated(true)
            }

            setCreateFolder(false)
            setIsCreating(false)
        }

        create()
    }, [createFolder, currentFolderId, fileMap, machinery.uid, newFolderName, props, setFileMap, setNewFolderPromptOpen])

    // CLOSE PROMPT
    function handleCancel() {
        setNewFolderPromptOpen(false)
    }

    // CREATE BUTTON CLICKED
    function handleCreateClicked() {
        const folderID = `${currentFolderId}\\${newFolderName}`

        const duplicate = fileMap.hasOwnProperty(folderID)
        if (duplicate) {
            setFolderExists(true)

            return
        }

        setCreateFolder(true)
    }

    // NEW FOLDER NAME typed event
    function updateNewFolderName(e: ChangeEvent<HTMLInputElement>) {
        setNewFolderName(e.target.value)
        setFolderNotCreated(false)
        setFolderExists(false)
    }

    return (
        <AlertDialog
            isOpen={newFolderPromptOpen}
            leastDestructiveRef={cancelRef}
            onClose={handleCancel}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        New Folder
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <VStack w="full" justifyContent="left" alignItems="left">
                            <Text fontSize="sm">Please type a name for the folder</Text>
                            <Input
                                w="full"
                                variant='outline'
                                isInvalid={newFolderName.length === 0 || folderExists}
                                errorBorderColor='crimson'
                                value={newFolderName}
                                onChange={updateNewFolderName}
                            />
                            {
                                newFolderName.length === 0 &&
                                <Text fontSize="sm" color="red">Folder name cannot be empty</Text>
                            }
                            {
                                folderExists &&
                                <Text fontSize="sm" color="red">A folder with this name already exists</Text>
                            }
                            {
                                folderNotCreated &&
                                <Text fontSize="sm" color="red">Oops! Could not create folder. Please try
                                    again.</Text>
                            }
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme='blue'
                            isLoading={isCreating}
                            loadingText="Creating"
                            onClick={handleCreateClicked}
                            ml={3}
                        >
                            Create
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
