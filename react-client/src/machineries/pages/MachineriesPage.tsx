// import {Heading, HStack, Link, SimpleGrid, Skeleton, Tab, TabList, Tabs} from "@chakra-ui/react";
// import {useEffect, useState} from "react";
// import Machinery from "../classes/Machinery";
// import MachineryCard from "../components/MachineryCard";
// import {getAllMachineries, getMachineryFilters} from "../../utils/api";
// import FilteringBar from "../components/FilteringBar";
// import PaginatedMachineries from "../classes/PaginatedMachineries";
// import FilteringParameters from "../classes/FilteringParameters";
// import MachinerySortingAndFilters from "../classes/MachinerySortingAndFilters";
// import SortingAndPagination from "../classes/SortingAndPagination";
// import SortBy from "../classes/SortBy";
// import SortingAndPaginationBar from "../components/SortingAndPaginationBar";
// import Page from "../classes/Page";


export default function MachineriesPage(props: any){
    //
    // const [paginatedMachineries, setPaginatedMachineries] = useState<PaginatedMachineries | null>(null)
    // const [machineriesLoading, setMachineriesLoading] = useState<boolean>(true)
    // const [page, setPage] = useState<Page>({
    //     currPage: 0,
    //     pageSize: 10,
    //     skeletonArray: [0,1,2,3,4,5,6,7,8,9]
    // })
    // const [sortBy, setSortBy] = useState<SortBy>({
    //     by: "default order",
    //     mode: "ASC"
    // })
    // const [refreshMachineries, setRefreshMachineries] = useState<RefreshMachineries>({
    //     // pageNumber: 0,
    //     // pageSize: 10,
    //     filteringParameters: {
    //         "page": 0,
    //         "pageSize": 10,
    //         "sortBy": "default order",
    //         "sortType": "ASC",
    //         "searchTerm": "",
    //         "filteringMap": new Map()
    //     }
    // })
    //
    // const [machineryFiltersAndSorting, setMachineryFiltersAndSorting] = useState<MachinerySortingAndFilters>({
    //     sortingList: [],
    //     filtersMap: new Map(),
    //     searchTerm: "",
    //     submit: false
    // })
    // const [machineriesSortingAndPagination, setMachineriesSortingAndPagination] = useState<SortingAndPagination>({
    //     currentPage: 0,
    //     pageSize: 10,
    //     totalItems: 0,
    //     sortingEntries: []
    // })
    //
    // //GET filters (only on first time render)
    // useEffect(() => {
    //
    //     async function getFilters(){
    //         let filtersAndSorting = await getMachineryFilters()
    //
    //         setMachineryFiltersAndSorting(filtersAndSorting)
    //         setMachineriesSortingAndPagination((val)=>{
    //             val.sortingEntries = filtersAndSorting.sortingList
    //             return {...val}
    //         })
    //     }
    //
    //     getFilters()
    // },[])
    //
    // //REFRESH machineries
    // useEffect(() => {
    //
    //     async function getMachineries() {
    //         try {
    //
    //             setMachineriesLoading(true)
    //
    //             let filteringParameters = refreshMachineries.filteringParameters
    //
    //             let queriedMachineries = await getAllMachineries(filteringParameters)
    //
    //             setMachineryFiltersAndSorting((val)=>{
    //                 val.submit = false
    //                 return {...val}
    //             })
    //             setPaginatedMachineries(queriedMachineries)
    //             setMachineriesSortingAndPagination((val) =>{
    //                 val.currentPage = queriedMachineries.number
    //                 val.pageSize = queriedMachineries.size
    //                 val.totalItems = queriedMachineries.totalElements
    //                 return {...val}
    //             })
    //
    //             setMachineriesLoading(false)
    //             //TODO: handle exceptions
    //
    //         } catch (e) {
    //
    //         }
    //     }
    //
    //     getMachineries()
    //
    // },[refreshMachineries])
    //
    // //Update filteringParameters on page settings changed
    // useEffect(()=>{
    //     setRefreshMachineries((val)=>{
    //         val.filteringParameters.page = page.currPage
    //         val.filteringParameters.pageSize = page.pageSize
    //         return {...val}
    //     })
    // },[page])
    //
    // //Update filteringParameters on Search button press
    // useEffect(()=>{
    //     if(!machineryFiltersAndSorting.submit) return
    //
    //     let filteringMap = new Map()
    //     Array.from(machineryFiltersAndSorting.filtersMap.keys()).forEach((machineryFilterKey)=>{
    //         if(controlIfFilterCheckboxesAreIndeterminate(machineryFilterKey)){
    //             filteringMap.set(
    //                 machineryFilterKey,
    //                 machineryFiltersAndSorting!!
    //                     .filtersMap
    //                     .get(machineryFilterKey)!!
    //                     .filterEntries
    //                     .filter((val)=>(val.selected))
    //                     .map((val)=>(val.entryInternalName))
    //             )
    //         }
    //     })
    //     //JSON does not stringify map correctly
    //     let filteringMapObject = Object.fromEntries(filteringMap)
    //
    //     setRefreshMachineries((val)=> {
    //         val.filteringParameters.searchTerm = machineryFiltersAndSorting.searchTerm
    //         val.filteringParameters.filteringMap = filteringMapObject
    //         return {...val}
    //     })
    // },[machineryFiltersAndSorting])
    //
    // //Update filteringParameters on sorting changed
    // useEffect(()=>{
    //     setRefreshMachineries((val)=>{
    //         val.filteringParameters.sortBy = sortBy.by
    //         val.filteringParameters.sortType = sortBy.mode
    //         return {...val}
    //     })
    // },[sortBy])
    //
    //
    // function controlIfFilterCheckboxesAreIndeterminate(filterKey: string){
    //     if(!machineryFiltersAndSorting) return false
    //     if(!machineryFiltersAndSorting.filtersMap.get(filterKey)) return false
    //
    //     let numUnchecked = machineryFiltersAndSorting!!
    //         .filtersMap
    //         .get(filterKey)!!
    //         .filterEntries
    //         .filter((filterValue: any) => (filterValue.selected===false))
    //         .length
    //
    //     return numUnchecked!==0 &&
    //         numUnchecked!==machineryFiltersAndSorting!!
    //             .filtersMap
    //             .get(filterKey)!!
    //             .filterEntries.length
    // }
    //
    // function handlePageChanged(pageIndex: number){
    //     setPage((val)=>{
    //         if(val.currPage===pageIndex)
    //             return val
    //         else
    //             return{
    //                 currPage: pageIndex,
    //                 pageSize: val.pageSize,
    //                 skeletonArray: val.skeletonArray
    //             }
    //         }
    //     )
    // }
    //
    // function handlePageNext(){
    //     let totalPages = paginatedMachineries?.totalPages
    //     if(!totalPages) return
    //
    //     setPage((val)=>{
    //         if(val.currPage+1 >= totalPages!!)
    //             return val
    //         else
    //             return {
    //                 currPage: val.currPage+1,
    //                 pageSize: val.pageSize,
    //                 skeletonArray: val.skeletonArray
    //             }
    //     })
    // }
    //
    // function handlePagePrevious(){
    //     setPage((val)=>{
    //         if(val.currPage===0)
    //             return val
    //         else
    //             return {
    //                 currPage: val.currPage-1,
    //                 pageSize: val.pageSize,
    //                 skeletonArray: val.skeletonArray
    //             }
    //     })
    // }
    //
    // function generatePaginationPages(numPages: number){
    //     let componentList = []
    //     for(let i=0;i<numPages;i++){
    //         componentList.push(
    //             <Tab key={i+1}>{i+1}</Tab>
    //         )
    //     }
    //     return componentList
    // }
    //
    // //console.log(page.pageSize)
    //
    // return (
    //     <>
    //         <Heading>My machineries</Heading>
    //         <FilteringBar
    //             machinerySortingAndFilters={machineryFiltersAndSorting}
    //             setMachinerySortingAndFilters={setMachineryFiltersAndSorting}
    //             setNumFiltersSelected={()=>(0)}
    //         />
    //         <SortingAndPaginationBar
    //             sortingAndPagination={machineriesSortingAndPagination}
    //             setSortingAndPagination={setMachineriesSortingAndPagination}
    //             sortBy={sortBy}
    //             setSortBy={setSortBy}
    //             setPage={setPage}
    //         />
    //         <SimpleGrid minChildWidth="300px" spacing="40px">
    //             {
    //                 machineriesLoading &&
    //                 page.skeletonArray.map((val) => {
    //                     //console.log(page.skeletonArray.length)
    //                     return (
    //                         <Skeleton
    //                             key={val}
    //                             width={"324px"}
    //                             height={"216px"}
    //                             //bg={useColorModeValue('white', 'gray.900')}
    //                             boxShadow={'2xl'}
    //                             rounded={'lg'}
    //                         />
    //                     )
    //                     }
    //                 )
    //             }
    //             {
    //                 !machineriesLoading &&
    //                 paginatedMachineries?.content.map((machinery: Machinery) => <MachineryCard key={machinery.id} {...machinery} />)
    //             }
    //         </SimpleGrid>
    //         <HStack my={5} justifyContent={"center"}>
    //             <Link
    //                 fontWeight={500}
    //                 color={'gray.600'}
    //                 onClick={handlePagePrevious}
    //                 _hover={{
    //                     cursor: "pointer"
    //                 }}
    //             >
    //                 Previous
    //             </Link>
    //             <Tabs
    //                 variant='soft-rounded'
    //                 colorScheme='green'
    //                 index={paginatedMachineries?.number}
    //                 onChange={(index: number) => handlePageChanged(index)}
    //             >
    //                 <TabList>
    //                     {paginatedMachineries && generatePaginationPages(paginatedMachineries!!.totalPages)}
    //                 </TabList>
    //             </Tabs>
    //             <Link
    //                 fontWeight={500}
    //                 color={'gray.600'}
    //                 onClick={handlePageNext}
    //                 _hover={{
    //                     cursor: "pointer"
    //                 }}
    //             >
    //                 Next
    //             </Link>
    //         </HStack>
    //     </>
    // )
}

// interface RefreshMachineries{
//     // pageNumber: number
//     // pageSize: number
//     filteringParameters: FilteringParameters
// }
