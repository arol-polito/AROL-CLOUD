import Machinery from "../../machineries-map/components/Machinery";
import FileMapEntry from "../../machinery/documents/interfaces/FileMapEntry";

export default interface MachineryWithDocuments extends Machinery{
    documents: FileMapEntry[],
    active: boolean
}