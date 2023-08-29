import type Machinery from '../../../../machineries-map/components/Machinery'
import {type FileData} from 'chonky'
import React, {type ChangeEvent, useEffect, useRef, useState} from 'react'
import type {FileMap} from '../../interfaces/FileMap'
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
    InputGroup,
    InputRightAddon,
    Text,
    VStack
} from '@chakra-ui/react'

interface RenamePromptProps {
    machinery: Machinery
    renamePromptOpen: FileData | null
    setRenamePromptOpen: React.Dispatch<React.SetStateAction<FileData | null>>
    fileMap: FileMap
    setFileMap: React.Dispatch<React.SetStateAction<FileMap>>
    currentFolderId: string
}

export default function RenamePrompt(props: RenamePromptProps) {

    const {machinery, renamePromptOpen, setRenamePromptOpen} = props;
    const {fileMap, setFileMap, currentFolderId} = props;

    const [newFileName, setNewFileName] = useState<string>(renamePromptOpen?.name.endsWith('.pdf') ? (renamePromptOpen?.name.slice(0, -4) || '') : (renamePromptOpen?.name || ''))
    const [doRename, setDoRename] = useState<boolean>(false)
    const [isRenaming, setIsRenaming] = useState<boolean>(false)
    const [fileExists, setFileExists] = useState<boolean>(false)
    const [fileNotRenamed, setFileNotRenamed] = useState<boolean>(false)

    const cancelRef = useRef<HTMLButtonElement>(null)

    // RENAME FILE and UPDATE FILE MAP
    useEffect(() => {
        if (!doRename) return

        async function create() {
            setFileNotRenamed(false)

            setIsRenaming(true)

            try {
                const documentUID = renamePromptOpen?.id.split('\\').pop()

                if (!documentUID) return;

                const renamedFilename = `${newFileName}.pdf`

                const result = await documentsService.renameMachineryFileOrFolder(
                    machinery.uid,
                    renamePromptOpen?.id || '',
                    documentUID || 'none',
                    renamedFilename,
                    renamePromptOpen?.isDir ? 'folder' : 'file'
                )

                if (renamePromptOpen?.isDir)
                    setFileMap((val) => {
                        if (!renamePromptOpen) return val;
                        const oldID = renamePromptOpen.id
                        const parentID = oldID.split('\\').slice(0, -1).join('\\')
                        const newFileID = `${oldID.split('\\').slice(0, -1).join('\\')}\\${renamedFilename}`

                        const newFileMap: FileMap = {}
                        Object.entries(val).forEach(([key, value]) => {
                            if (key === parentID) {
                                const newValue: any = JSON.parse(JSON.stringify(value))
                                const childIndex = newValue.childrenIds.indexOf(oldID)
                                if (childIndex > -1)
                                    newValue.childrenIds[childIndex] = newFileID

                                newFileMap[key] = newValue
                            } else if (key === oldID) {
                                const newValue: any = JSON.parse(JSON.stringify(value))
                                const newID = newFileID
                                newValue.id = newID
                                newValue.name = renamedFilename
                                newValue.childrenIds.forEach((childID, index) => {
                                    newValue.childrenIds[index] = newFileID + childID.slice(oldID.length)
                                })
                                newFileMap[newID] = newValue
                            } else if (key.startsWith(oldID)) {
                                const newID = newFileID + key.slice(oldID.length)
                                const newValue = JSON.parse(JSON.stringify(value))
                                newValue.id = newID
                                newValue.parentId = newFileID + newValue.parentId.slice(oldID.length)
                                newValue.childrenIds.forEach((childID, index) => {
                                    newValue.childrenIds[index] = newFileID + childID.slice(oldID.length)
                                })
                                newFileMap[newID] = newValue
                            } else
                                newFileMap[key] = value
                        })

                        return newFileMap
                    })
                else
                    setFileMap((val) => {
                        if (renamePromptOpen && val.hasOwnProperty(renamePromptOpen.id)) {
                            const newValue: any = JSON.parse(JSON.stringify(val[renamePromptOpen.id]))
                            newValue.name = renamedFilename
                            val[renamePromptOpen.id] = newValue

                            return {...val}
                        }

                        console.error(`File with id ${renamePromptOpen?.id} not found`)

                        return val
                    })

                if (!result) {
                    setFileNotRenamed(true)
                    setDoRename(false)
                    setIsRenaming(false)

                    return
                }

                setRenamePromptOpen(null)
            } catch (e) {
                console.error(e)
                setFileNotRenamed(true)
            }

            setDoRename(false)
            setIsRenaming(false)
        }

        create()
    }, [doRename, machinery.uid, newFileName, props, renamePromptOpen, setFileMap, setRenamePromptOpen])

    // CLOSE PROMPT
    function handleCancel() {
        setRenamePromptOpen(null)
    }

    // RENAME BUTTON CLICKED - check for duplicate then trigger submit rename request
    function handleRenameClicked() {

        const duplicate = Object.values(fileMap).find((el: any) => (el.parentId === currentFolderId && el.name === (`${newFileName}.pdf`)))
        if (duplicate != null) {
            setFileExists(true)

            return
        }

        setDoRename(true)
    }

    // NEW FILE NAME TYPED event
    function updateNewFileName(e: ChangeEvent<HTMLInputElement>) {
        setNewFileName(e.target.value)
        setFileNotRenamed(false)
        setFileExists(false)
    }

    return (
        <AlertDialog
            isOpen={renamePromptOpen !== null}
            leastDestructiveRef={cancelRef}
            onClose={handleCancel}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Rename {renamePromptOpen?.isDir ? 'folder' : 'file'}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <VStack w="full" justifyContent="left" alignItems="left">
                            <Text fontSize="sm">Please type a new name for the
                                Rename {renamePromptOpen?.isDir ? 'folder' : 'file'}</Text>
                            <InputGroup>
                                <Input
                                    w="full"
                                    variant='outline'
                                    isInvalid={newFileName.length === 0}
                                    errorBorderColor='crimson'
                                    value={newFileName}
                                    onChange={updateNewFileName}
                                />
                                <InputRightAddon>
                                    .pdf
                                </InputRightAddon>
                            </InputGroup>
                            {
                                newFileName.length === 0 &&
                                <Text fontSize="sm"
                                      color="red">{renamePromptOpen?.isDir ? 'Folder' : 'File'} name cannot be
                                    empty</Text>
                            }
                            {
                                fileExists &&
                                <Text fontSize="sm"
                                      color="red">A {renamePromptOpen?.isDir ? 'folder' : 'file'} with this name
                                    already exists</Text>
                            }
                            {
                                fileNotRenamed &&
                                <Text fontSize="sm" color="red">Oops! Could not
                                    rename {renamePromptOpen?.isDir ? 'folder' : 'file'}. Please try
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
                            isLoading={isRenaming}
                            loadingText="Creating"
                            onClick={handleRenameClicked}
                            ml={3}
                        >
                            Rename
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}
