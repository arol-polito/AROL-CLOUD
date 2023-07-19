import {
    ChonkyActions,
    ChonkyFileActionData,
    ChonkyIconName,
    defineFileAction,
    FileArray,
    FileData,
    FileHelper,
    FullFileBrowser
} from 'chonky';
import {Box, Spinner, VStack} from "@chakra-ui/react";
import React, {useCallback, useEffect, useState} from "react";
import documentsService from "../../../services/DocumentsService";
import Machinery from "../../../machineries-map/components/Machinery";
import {useNavigate} from "react-router-dom";
import FileMap from "../interfaces/FileMap";
import UploadFilesModal from "./modals/UploadFilesModal";
import NewFolderPrompt from "./modals/NewFolderPrompt";
import RenamePrompt from "./modals/RenamePrompt";
import DeleteFilesPrompt from "./modals/DeleteFilesPrompt";

interface DocumentsPanelProps {
    machinery: Machinery
    documentsPermissions: {read: boolean, modify: boolean, write: boolean}
}

interface DeleteFiles {
    promptOpen: boolean
    filesToDelete: FileData[]
    doDelete: boolean
}

export default function DocumentsPanel(props: DocumentsPanelProps) {

    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [fileActions, setFileActions] = useState<any[]>([])

    const [fileMap, setFileMap] = useState<FileMap>({})

    const [files, setFiles] = useState<FileArray>([])
    const [folderChain, setFolderChain] = useState<FileArray>([])
    const [currentFolderId, setCurrentFolderId] = useState("");

    const [deleteFiles, setDeleteFiles] = useState<DeleteFiles>({
        promptOpen: false,
        filesToDelete: [],
        doDelete: false
    })
    const [renamePromptOpen, setRenamePromptOpen] = useState<FileData | null>(null)
    const [newFolderPromptOpen, setNewFolderPromptOpen] = useState<boolean>(false)
    const [uploadFilesModalOpen, setUploadFilesModalOpen] = useState<boolean>(false)

    //POPULATE ACTIONS BASED ON USER PERMISSIONS
    useEffect(()=>{

        setFileActions((val)=>{
            val = []
            if(props.documentsPermissions.modify){
                const RenameAction = defineFileAction({
                    id: 'rename',
                    requiresSelection: true,
                    button: {
                        name: 'Rename',
                        toolbar: false,
                        contextMenu: true,
                        tooltip: "Rename the file/folder",
                        icon: ChonkyIconName.terminal,
                        iconOnly: false,
                    },
                } as const);

                val.push(RenameAction)
            }
            if(props.documentsPermissions.write){
                val.push(...[ChonkyActions.CreateFolder, ChonkyActions.DeleteFiles, ChonkyActions.UploadFiles])
            }

            return [...val]
        })

    }, [])

    //FETCH MACHINERY DOCUMENTS
    useEffect(() => {

        async function getData() {

            setIsLoading(true)

            let result = await documentsService.getMachineryDocuments(props.machinery.uid)

            // Object.values(result.fileMap as FileMap).forEach((doc: FileMapEntry)=>{
            //     console.log(doc.modDate)
            //     result.fileMap[doc.id].modDate = new Date(doc.modDate)
            // })

            setFileMap(result.fileMap)

            setCurrentFolderId(result.rootFolderId)

            setIsLoading(false)

        }

        getData()

    }, [])

    //BROWSE FILES AND FOLDERS
    useEffect(() => {

        if (!currentFolderId) return

        const currentFolder = fileMap[currentFolderId];

        if (!currentFolder) {
            console.error("ERROR in finding folder")
            return
        }


        //FILES
        const files = currentFolder.childrenIds
            ? currentFolder.childrenIds.map((fileId: string) => fileMap[fileId] ?? null)
            : [];
        setFiles(files);

        //FOLDER CHAIN
        const newFolderChain = [currentFolder];

        let parentId = currentFolder.parentId;
        while (parentId) {
            const parentFile = fileMap[parentId];
            if (parentFile) {
                newFolderChain.unshift(parentFile);
                parentId = parentFile.parentId;
            } else {
                parentId = "";
            }
        }

        setFolderChain(newFolderChain)

    }, [currentFolderId, fileMap])

    //DELETE FILE(S) and/or FOLDER(S)
    useEffect(() => {

        if (!deleteFiles.doDelete) return

        async function performDelete() {

            let result = await documentsService.deleteMachineryDocuments(props.machinery.uid, deleteFiles.filesToDelete)

            setFileMap((oldVal) => {

                let newVal = {...oldVal}
                result.forEach((deletedDocument: FileData) => {

                    if (deletedDocument.isDir) {

                        Object.entries(newVal).forEach(([fileID, file]) => {
                            if (file.parentId.includes(deletedDocument.id, 0)) {
                                delete newVal[fileID]
                            }
                        })
                    }

                    //Update parent folder document count
                    let parentID = newVal[deletedDocument.id].parentId
                    if (newVal.hasOwnProperty(parentID)) {

                        let newEntry = {...newVal[parentID]}

                        //With variable otherwise object is immutable
                        let newChildrenIds = newEntry.childrenIds.filter((el) => (el !== deletedDocument.id))
                        newEntry.childrenIds = newChildrenIds
                        newEntry.childrenCount--

                        newVal[parentID] = newEntry
                    }

                    delete newVal[deletedDocument.id]

                })

                //console.log(newVal)

                return newVal
            })

            setDeleteFiles({
                promptOpen: false,
                filesToDelete: [],
                doDelete: false
            })

        }

        performDelete()

    }, [deleteFiles])

    //FILE ACTIONS(open file/delete/create folder...)
    const handleFileAction = useCallback((data: ChonkyFileActionData) => {

            if (data.id === ChonkyActions.OpenFiles.id) {
                let {targetFile, files} = data.payload;
                let fileToOpen = targetFile ?? files[0] as FileData;

                let document = fileToOpen

                if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
                    setCurrentFolderId(fileToOpen.id);
                    return;
                }

                let documentUID = document.documentUID

                let documentObject = fileMap[document.id]

                navigate("/machinery/" + props.machinery.uid + "/documents/" + documentUID, {
                    state: {
                        document: documentObject,
                        machinery: props.machinery
                    }
                })

            } else if(data.id.toString() === "rename"){
                setRenamePromptOpen(data.state.selectedFilesForAction[0])
            } else if (data.id === ChonkyActions.DeleteFiles.id) {
                setDeleteFiles({
                    promptOpen: true,
                    filesToDelete: data.state.selectedFilesForAction,
                    doDelete: false
                })

            } else if (data.id === ChonkyActions.MoveFiles.id) {
                // moveFiles(
                //     data.payload.files,
                //     data.payload.source!,
                //     data.payload.destination
                // );
            } else if (data.id === ChonkyActions.CreateFolder.id) {
                setNewFolderPromptOpen(true)
            } else if (data.id === ChonkyActions.UploadFiles.id) {
                setUploadFilesModalOpen(true)
            }
            //showActionNotification(data);
        }, [setCurrentFolderId, fileMap]
    );

    return (
        <>
            <VStack
                h={"500px"}
                w={"full"}
                bg={'white'}
                boxShadow={'2xl'}
                rounded={'lg'}
                justifyContent={"center"}
                alignItems={"center"}
            >
                {
                    isLoading &&
                    <Spinner size={"xl"}/>
                }
                {
                    !isLoading &&
                    currentFolderId &&
                    <Box w={"full"} minH={"full"}>
                        <FullFileBrowser
                            files={files}
                            folderChain={folderChain}
                            fileActions={fileActions}
                            onFileAction={handleFileAction}
                        />
                    </Box>
                }
            </VStack>
            {
                deleteFiles.promptOpen &&
                <DeleteFilesPrompt
                    deleteFiles={deleteFiles}
                    setDeleteFiles={setDeleteFiles}
                />
            }
            {
                newFolderPromptOpen &&
                <NewFolderPrompt
                    machinery={props.machinery}
                    newFolderPromptOpen={newFolderPromptOpen}
                    setNewFolderPromptOpen={setNewFolderPromptOpen}
                    fileMap={fileMap}
                    setFileMap={setFileMap}
                    currentFolderId={currentFolderId}
                />
            }
            {
                renamePromptOpen &&
                <RenamePrompt
                    machinery={props.machinery}
                    renamePromptOpen={renamePromptOpen}
                    setRenamePromptOpen={setRenamePromptOpen}
                    fileMap={fileMap}
                    setFileMap={setFileMap}
                    currentFolderId={currentFolderId}
                />
            }
            {
                uploadFilesModalOpen &&
                <UploadFilesModal
                    machinery={props.machinery}
                    uploadFilesModalOpen={uploadFilesModalOpen}
                    setUploadFilesModalOpen={setUploadFilesModalOpen}
                    fileMap={fileMap}
                    setFileMap={setFileMap}
                    parentFolderID={currentFolderId}
                />
            }
        </>
    )
}





