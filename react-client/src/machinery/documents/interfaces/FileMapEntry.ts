export default interface FileMapEntry {
    id: string,
    name: string,
    documentUID: string | null,
    isDir: boolean,
    isDocument: boolean,
    isModifiable: boolean,
    childrenIds: string[],
    childrenCount: number,
    parentId: string,
    modDate: Date,
    size: number
}