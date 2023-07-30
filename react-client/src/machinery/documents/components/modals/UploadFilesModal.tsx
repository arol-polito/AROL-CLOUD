import type Machinery from '../../../../machineries-map/components/Machinery'
import React, {useContext, useEffect, useState} from 'react'
import type FileMap from '../../interfaces/FileMap'
import documentsService from '../../../../services/DocumentsService'
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormErrorMessage,
    HStack,
    Input,
    InputGroup,
    InputRightAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack
} from '@chakra-ui/react'
import {FiFile, FiTrash} from 'react-icons/fi'
import toastHelper from '../../../../utils/ToastHelper'
import ToastContext from '../../../../utils/contexts/ToastContext'
import axiosExceptionHandler from '../../../../utils/AxiosExceptionHandler'

interface UploadFilesModalProps {
    machinery: Machinery
    uploadFilesModalOpen: boolean
    setUploadFilesModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    fileMap: FileMap
    setFileMap: React.Dispatch<React.SetStateAction<FileMap>>
    parentFolderID: string
}

export default function UploadFilesModal(props: UploadFilesModalProps) {
    const toast = useContext(ToastContext)

    const [isDragging, setIsDragging] = useState(false)

    const [numErrors, setNumErrors] = useState(0)

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [doUpload, setDoUpload] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)

    // UPLOAD FILES
    useEffect(() => {
        if (!doUpload) return

        async function upload() {
            setIsUploading(true)

            try {
                const formData = new FormData()
                for (const file of selectedFiles)
                    if (!file.name.endsWith('.pdf')) {
                        const newFile = JSON.parse(JSON.stringify(file))
                        newFile.name += '.pdf'
                        formData.append('files', newFile)
                    } else
                        formData.append('files', file)

                formData.append('parentFolderPath', props.parentFolderID)

                const uploadedFiles = await documentsService.uploadMachineryDocuments(
                    props.machinery.uid,
                    formData
                )

                props.setFileMap((val) => {
                    const newChildrenIds: string[] = []

                    selectedFiles.forEach((selectedFile) => {
                        if (uploadedFiles.find((el) => (el.name === selectedFile.name)) == null)
                            return

                        const uploadedFile = uploadedFiles.find((el) => (el.name === selectedFile.name))
                        if (uploadedFile != null) {
                            const id = `${props.parentFolderID}\\${uploadedFile.documentUID}`
                            val[id] = {
                                childrenCount: 0,
                                childrenIds: [],
                                id,
                                documentUID: uploadedFile.documentUID,
                                isDir: false,
                                isDocument: true,
                                isModifiable: true,
                                modDate: new Date(uploadedFile.modificationTimestamp),
                                name: uploadedFile.name,
                                parentId: props.parentFolderID,
                                size: selectedFile.size
                            }

                            newChildrenIds.push(id)
                        }
                    })

                    const currentFolder = {...val[props.parentFolderID]}
                    currentFolder.childrenIds = [...currentFolder.childrenIds, ...newChildrenIds]
                    currentFolder.childrenCount += newChildrenIds.length

                    val[props.parentFolderID] = currentFolder

                    return {...val}
                })

                if (uploadedFiles.length !== selectedFiles.length)
                    toastHelper.makeToast(
                        toast,
                        `${uploadedFiles.length} out of ${selectedFiles.length} files uploaded`,
                        'warning'
                    )
                else
                    toastHelper.makeToast(
                        toast,
                        'All files successfully uploaded',
                        'success'
                    )

                props.setUploadFilesModalOpen(false)
            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Files could not be uploaded'
                )
            }

            setDoUpload(false)
            setIsUploading(false)
        }

        upload()
    }, [doUpload, props, selectedFiles, toast])

    // UPLOAD BUTTON CLICKED
    function handleUploadClicked() {
        setDoUpload(true)
    }

    // CLOSE MODAL
    function handleClose() {
        props.setUploadFilesModalOpen(false)
    }

    // FILES ADDED FOR UPLOAD
    function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
        setSelectedFiles((val) => {
            if (e.target.files == null)
                return val

            const files = e.target.files

            const filesArray: File[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files.item(i)

                if (file && file.type === 'application/pdf')
                    filesArray.push(file)
            }

            return [...val, ...filesArray]
        })
    }

    // FILES DROPPED FOR UPLOAD
    function handleFilesDropped(e: React.DragEvent<HTMLInputElement>) {
        setSelectedFiles((val) => {
            if (!e.dataTransfer.files)
                return val

            const files = e.dataTransfer.files

            const filesArray: File[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files.item(i);

                if (file && file.type === 'application/pdf')
                    filesArray.push(file)
            }

            return [...val, ...filesArray]
        })
    }

    // HANDLE DRAG ENTER
    function handleOnDragEnter() {
        setIsDragging(true)
    }

    // HANDLE DRAG LEAVE
    function handleOnDragLeave() {
        setIsDragging(false)
    }

    return (
        <Modal
            isOpen={props.uploadFilesModalOpen}
            size="3xl"
            onClose={handleClose}
        >
            <ModalOverlay
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            />
            <ModalContent
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            >
                <ModalHeader>Upload documents</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack
                        w="full"
                        alignItems="left"
                    >
                        <VStack
                            w="full"
                            h="200px"
                            bgColor="gray.100"
                            rounded="xl"
                            justifyContent="center"
                            alignItems="center"
                            position="relative"
                        >
                            <FiFile size={50}/>
                            {
                                !isDragging &&
                                <>
                                    <Text fontSize="md" fontWeight={650} pt={4}>Drag & Drop PDF documents here</Text>
                                    <Text fontSize="md" fontWeight={300} mt="0!important">or click to select</Text>
                                </>
                            }
                            {
                                isDragging &&
                                <Text fontSize="md" fontWeight={300} mt="0!important">Drop here</Text>
                            }
                            <Input
                                type="file"
                                height="full"
                                width="full"
                                position="absolute"
                                top="0"
                                left="0"
                                opacity="0"
                                aria-hidden="true"
                                accept=".pdf"
                                _hover={{
                                    cursor: 'pointer'
                                }}
                                onChange={(e) => {
                                    handleFilesSelected(e)
                                }}
                                onDrop={handleFilesDropped}
                                onDragEnter={handleOnDragEnter}
                                onDragLeave={handleOnDragLeave}
                                multiple
                            />
                        </VStack>
                        <VStack
                            w="full"
                            alignItems="left"
                        >
                            {
                                selectedFiles.map((file, index) => (
                                    <FileEntry
                                        key={index}
                                        file={file}
                                        index={index}
                                        selectedFiles={selectedFiles}
                                        setSelectedFiles={setSelectedFiles}
                                        setNumErrors={setNumErrors}
                                        fileMap={props.fileMap}
                                        parentFolderID={props.parentFolderID}
                                    />
                                ))
                            }
                            {
                                selectedFiles.length === 0 &&
                                <Box w="full" textAlign="center" mt={2}>
                                    <Text>
                                        No files selected
                                    </Text>
                                </Box>
                            }
                        </VStack>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='gray' mr={3} onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        colorScheme='blue'
                        disabled={selectedFiles.length === 0 || numErrors > 0}
                        isLoading={isUploading}
                        loadingText="Uploading"
                        onClick={handleUploadClicked}
                    >
                        Upload
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

interface FileEntryProps {
    file: File
    index: number
    selectedFiles: File[]
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
    setNumErrors: React.Dispatch<React.SetStateAction<number>>
    fileMap: FileMap
    parentFolderID: string
}

function FileEntry(props: FileEntryProps) {
    const [fileName, setFileName] = useState(props.file.name.endsWith('.pdf') ? props.file.name.slice(0, -4) : props.file.name)
    const [fileNameError, setFileNameError] = useState('')

    // CHECK FOR ERRORS IN FILE NAME
    useEffect(() => {
        if (fileName.trim().length === 0) {
            setFileNameError((val) => {
                if (val.length === 0)
                    props.setNumErrors((el) => (el + 1))

                return 'File name cannot be empty'
            })

            return
        }

        const completeFilename = `${fileName}.pdf`
        if (
            (props.selectedFiles.find((el, index) => (index !== props.index && el.name === completeFilename)) != null) ||
            (Object.values(props.fileMap).find((el: any) => (el.parentId === props.parentFolderID && el.name === completeFilename)) != null)
        ) {
            setFileNameError((val) => {
                if (val.length === 0)
                    props.setNumErrors((el) => (el + 1))

                return 'A file with the same name already exists'
            })

            return
        }

        setFileNameError((val) => {
            if (val.length > 0)
                props.setNumErrors((el) => (el - 1))

            return ''
        })
    }, [fileName, props])

    // HANDLE FILE NAME CHANGED
    function handleFileNameChanged(newFileName: string) {
        setFileName(newFileName)

        props.setSelectedFiles((val) => {
            const newFile = new File([val[props.index]], `${newFileName}.pdf`, {type: val[props.index].type})
            val[props.index] = newFile

            return val
        })
    }

    // REMOVE FILE FROM UPLOAD LIST
    function handleRemoveSelectedFile() {
        props.setSelectedFiles((val) => val.filter((file, index) => (index !== props.index)))
    }

    return (
        <>
            <HStack
                w="full"
                h="fit-content"
            >
                <HStack
                    w="full"
                    justifyContent="space-between"
                    alignItems="baseline"
                    pr={3}
                >
                    <FormControl isInvalid={fileNameError.length > 0}>
                        <InputGroup
                            maxW="500px"
                            size='sm'
                        >
                            <Input value={fileName} onChange={(e) => {
                                handleFileNameChanged(e.target.value)
                            }}/>
                            <InputRightAddon>
                                .pdf
                            </InputRightAddon>
                        </InputGroup>
                        {
                            fileNameError &&
                            <FormErrorMessage>{fileNameError}</FormErrorMessage>
                        }
                    </FormControl>
                    <Text
                        fontSize="sm"
                        color="gray.500"
                        whiteSpace="nowrap"
                    >
                        {Math.max(props.file.size / 1024, 1).toFixed(1)} KB
                    </Text>
                </HStack>
                <HStack
                    h="full"
                    alignItems="center"
                >
                    <Divider orientation="vertical" h="32px"/>
                    <Box
                        _hover={{
                            cursor: 'pointer'
                        }}
                        onClick={handleRemoveSelectedFile}
                    >
                        <FiTrash/>
                    </Box>
                </HStack>
            </HStack>
            <Divider orientation="horizontal"/>
        </>
    )
}
