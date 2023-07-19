import {useLocation, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {Document, Page} from 'react-pdf/dist/esm/entry.webpack5';
import documentsService from "../../../services/DocumentsService";
import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button, Divider,
    Heading,
    HStack, IconButton,
    Input,
    InputGroup, InputLeftAddon,
    InputRightAddon,
    Spinner,
    Text
} from "@chakra-ui/react";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Machinery from "../../../machineries-map/components/Machinery";
import {FiDownload, FiMinus, FiPlus, FiRotateCcw, FiRotateCw} from "react-icons/fi";

interface DocumentViewerProps {

}

interface FileMapEntry {
    id: string,
    name: string,
    isDir: boolean,
    childrenIds: string[],
    childrenCount: number,
    parentId: string,
    modDate: Date,
    size?: number
}

export default function DocumentViewer(props: DocumentViewerProps) {

    const navigate = useNavigate()

    let params = useParams()
    const machineryUID = params.machineryUID as string
    const documentUID = params.documentUID as string

    const location = useLocation()
    console.log(location.state)
    const document = location.state.document as FileMapEntry
    const machinery = location.state.machinery as Machinery

    const wrapperRef = useRef<HTMLDivElement>(null)

    const [documentData, setDocumentData] = useState<Buffer | null>(null)
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [zoom, setZoom] = useState(100)
    const [rotation, setRotation] = useState(0)

    const [pageWidth, setPageWidth] = useState(0)

    //FETCH DOCUMENT
    useEffect(() => {

        async function getData() {
            try {
                let result = await documentsService.getDocument(machineryUID, documentUID)
                setDocumentData(result)
            } catch (e) {
                console.log(e)
            }
        }

        getData()

    }, [])

    //PAGE WIDTH
    const updateDimensions = () => {
        console.log(wrapperRef!!.current!!.clientWidth);
        if (wrapperRef) {
            let width = wrapperRef!!.current!!.clientWidth * 0.75
            setPageWidth(width);
        }
    };

    //WINDOW SIZE EVENT LISTENER - for automatically resizing page when window is resized
    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        if (wrapperRef) {
            let width = wrapperRef!!.current!!.clientWidth * 0.75
            setPageWidth(width);
        }
        return () => {
            console.log("dismount");
            window.removeEventListener("resize", updateDimensions);
        };
    }, [wrapperRef]);

    //SET NUM PAGES & CURRENT PAGE ON DOCUMENT SUCCESSFULLY LOADED
    function onDocumentLoadSuccess(pdfDocumentProxy: any) {
        console.log(pdfDocumentProxy)
        if (!numPages) {
            setNumPages(pdfDocumentProxy._pdfInfo.numPages);
            setPageNumber(1);
        }
    }

    //CHANGE PAGE - with OFFSET from current page
    function changePage(offset: number) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    }

    //GO TO PREVIOUS PAGE
    function previousPage() {
        changePage(-1);
    }

    //GO TO NEXT PAGE
    function nextPage() {
        changePage(1);
    }

    //SET NEW PAGE NUMBER
    function setPage(newPageNumber: number) {
        if (!numPages) return

        if (newPageNumber < 1) newPageNumber = 1
        if (newPageNumber > numPages) newPageNumber = numPages
        setPageNumber(newPageNumber)
    }

    //ZOOM IN PAGE
    function zoomIn() {
        setZoom((val) => {
            if (val + 5 > 125) val = 125
            else val += 5
            return val
        })
    }

    //ZOOM OUT PAGE
    function zoomOut() {
        setZoom((val) => {
            if (val - 5 < 50) val = 50
            else val -= 5
            return val
        })
    }

    //ZOOM PAGE IN
    function setPageZoom(newZoomValue: number) {
        setZoom((val) => {
            if (newZoomValue > 125) val = 125
            else if (newZoomValue < 50) val = 50
            else val = newZoomValue
            return val
        })
    }

    //DOWNLOAD PDF
    function downloadDocument(){
        if(!documentData) return

        let blob = new Blob([documentData], { type: "application/pdf" });
        let url = URL.createObjectURL(blob);
        window.open(url);

    }

    //BREADCRUMB NAVIGATION
    function breadcrumbNavigate(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, to: string, isCurrent: boolean) {
        e.preventDefault()
        e.stopPropagation()

        if (isCurrent) return

        switch (to) {
            case "machineries": {
                navigate("/machineries")
                break
            }
            case "machinery-landing": {
                navigate("/machinery/" + machinery.uid, {state: machinery})
                break
            }
            case "machinery-documents": {
                navigate("/machinery/" + machinery.uid + "/documents", {state: machinery})
                break
            }
            default: {
                console.error("Unkown breadcrumb destination")
            }
        }
    }

    //TODO: fix spinner on zoom change
    const memoizedPDF = useMemo(
        ()=>(
            <Document
                file={{data: documentData}}
                renderMode={"svg"}
                rotate={rotation}
                onLoadSuccess={(e) => (onDocumentLoadSuccess(e))}
                loading={
                    <HStack
                        w={"full"}
                        h={"250px"}
                        alignItems={"center"}
                        justifyContent={"center"}
                    >
                        <Spinner size={"xl"}/>
                    </HStack>
                }
                // onLoadError={console.error}
                // onLoadProgress={console.log}
            >
                <Page
                    width={pageWidth*(zoom/100.0)}
                    pageNumber={pageNumber}
                    loading={
                        <HStack
                            w={"full"}
                            h={"250px"}
                            alignItems={"center"}
                            justifyContent={"center"}
                        >
                            <Spinner size={"xl"}/>
                        </HStack>
                    }
                />
            </Document>
        ),[documentData, pageNumber, zoom, rotation, pageWidth]
    )

    return (
        <Box w={"full"} textAlign={"left"} ref={wrapperRef}>

            <Breadcrumb mb={2}>
                <BreadcrumbItem>
                    <BreadcrumbLink onClick={(e) => breadcrumbNavigate(e, "machineries", false)}>
                        Machineries
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        onClick={(e) => breadcrumbNavigate(e, "machinery-landing", false)}>
                        {machinery.uid}
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        onClick={(e) => breadcrumbNavigate(e, "machinery-documents", false)}>
                        Documents
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        onClick={(e) => breadcrumbNavigate(e, "", true)}>
                        {document.name}
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Heading mb={6}>{document.name}</Heading>

            {
                documentData &&
                <Box w={"full"} textAlign={"center"}>

                    <HStack
                        w={pageWidth*1.25}
                        mx={"auto"}
                        mb={3}
                        px={3}
                        py={1}
                        bg={'white'}
                        boxShadow={'2xl'}
                        rounded={'lg'}
                        justifyContent={"center"}
                        alignItems={"stretch"}
                    >
                        <HStack>
                            <InputGroup
                                size='md'
                                w={"225px"}
                            >
                                <InputLeftAddon children={"Page"}/>
                                <Input
                                    type={"number"}
                                    value={pageNumber}
                                    onChange={(e) => (setPage(parseInt(e.target.value)))}
                                    min={1}
                                    max={numPages || 1}
                                />
                                <InputRightAddon children={"out of " + numPages}/>
                            </InputGroup>
                        </HStack>
                        <Divider orientation={"vertical"} h={"auto"}/>
                        <InputGroup
                            size='md'
                            w={"200px"}
                        >
                            <InputLeftAddon children={<FiMinus />} _hover={{cursor: "pointer"}} onClick={zoomOut}/>
                            <Input
                                value={zoom + "%"}
                                // onChange={(e) => (setPageZoom(parseInt(e.target.value)))}
                            />
                            <InputRightAddon children={<FiPlus />} _hover={{cursor: "pointer"}} onClick={zoomIn}/>
                        </InputGroup>

                        <Divider orientation={"vertical"} height={"auto"} />

                        <HStack>
                            <IconButton
                                aria-label={"Rotate left"}
                                icon={<FiRotateCcw />}
                                title={"Rotate left"}
                                onClick={()=>(setRotation((val)=>((val+360-90)%360)))}
                            />
                            <IconButton
                                aria-label={"Rotate right"}
                                icon={<FiRotateCw />}
                                title={"Rotate right"}
                                onClick={()=>(setRotation((val)=>((val+90)%360)))}
                            />
                        </HStack>

                        <Divider orientation={"vertical"} h={"auto"}/>
                        <Button
                            variant={"unstyled"}
                            leftIcon={<FiDownload/>}
                            onClick={downloadDocument}
                        >
                            Download document
                        </Button>
                    </HStack>

                    {
                        memoizedPDF
                    }

                    <HStack
                        w={pageWidth*1.25}
                        mx={"auto"}
                        mt={3}
                        px={3}
                        py={1}
                        bg={'white'}
                        boxShadow={'2xl'}
                        rounded={'lg'}
                        justifyContent={"space-between"}
                    >
                        <Button
                            variant={"unstyled"}
                            disabled={pageNumber <= 1}
                            onClick={previousPage}
                        >
                            Previous page
                        </Button>
                        <Text
                            fontSize={"md"}
                            fontWeight={500}
                        >
                            Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
                        </Text>
                        <Button
                            variant={"unstyled"}
                            disabled={pageNumber >= numPages!!}
                            onClick={nextPage}
                        >
                            Next page
                        </Button>
                    </HStack>
                </Box>
            }
        </Box>
    )
}
