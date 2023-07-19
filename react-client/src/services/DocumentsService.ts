import axios from "../utils/AxiosInterceptor"
import {FileData} from "chonky";
import Document from "../machinery/documents/models/Document";

export default {
    getDocument,
    getMachineryDocuments,
    deleteMachineryDocuments,
    createMachineryFolder,
    uploadMachineryDocuments,
    renameMachineryFileOrFolder
}

async function getDocument(machineryUID: string, documentUID: string) : Promise<Buffer> {

    let response = await axios.get(
        "/documents/document/?machineryUID=" + machineryUID+"&documentUID="+documentUID,
        {
            responseType: "arraybuffer",
        }
    )

    if (response.status === 200) {
        return response.data
    }

    throw response.data

}

async function getMachineryDocuments(machineryUID: string) {

    let response = await axios.get(
        "/documents/?machineryUID=" + machineryUID,
    )

    if (response.status === 200) {
        return response.data
    }

    throw response.data

}

async function deleteMachineryDocuments(machineryUID: string, documentsList: FileData[]) {

    let response = await axios.delete(
        "/documents/?machineryUID=" + machineryUID,
        {
            data: {
                documentsList: documentsList
            },
        }
    )

    if (response.status === 200) {
        return response.data
    }

    throw response.data

}

async function createMachineryFolder(machineryUID: string, folderPath: string) {

    let response = await axios.put(
        "/documents/folder/?machineryUID=" + machineryUID,
        {
            folderPath: folderPath
        },
    )

    if (response.status === 200) {
        return response.data
    }

    throw response.data

}

async function uploadMachineryDocuments(machineryUID: string, formData: FormData) : Promise<Document[]> {

    let response = await axios.put(
        "/documents/files/?machineryUID=" + machineryUID,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    )

    if (response.status === 200) {
        return response.data
    }

    throw response.data

}

async function renameMachineryFileOrFolder(machineryUID: string, oldFileID: string, documentUID: string, newFileName: string, type: string) : Promise<Document[]> {

    let response = await axios.post(
        "/documents/rename/?machineryUID=" + machineryUID,
        {
            oldFileID: oldFileID,
            documentUID: documentUID,
            newFileName: newFileName,
            type: type
        },
    )

    if (response.status === 200) {
        return response.data
    }

    throw response.data

}

