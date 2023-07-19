// import {Link as RouterLink, useParams} from "react-router-dom";
// import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, VStack} from "@chakra-ui/react";
// import {useEffect, useState} from "react";
// import MachineryWithLogs from "../classes/MachineryWithLogs";
// import {getAllMachineryLogs} from "../../utils/api";
// import LogItem from "../components/LogItem";
// import LogsFilteringBar from "../components/LogsFilteringBar";
// import LogsParameters from "../classes/LogsParameters";
// import LogsControlBar from "../components/LogsControlBar";

export default function MachineryPage(props: any){
    //
    // const [machinery, setMachinery] = useState<MachineryWithLogs | null>(null)
    // const [expandAll, setExpandAll] = useState<string>("false")
    // const [machineryLogsFilter, setMachineryLogFilters] = useState<LogsParameters>({
    //     from: null,
    //     to: null,
    //     submit: true
    // })
    //
    // let params = useParams()
    //
    // useEffect(()=>{
    //
    //     if(!machineryLogsFilter.submit) return
    //
    //     async function getData(){
    //
    //         if(!params.machineryID) return
    //
    //         setMachinery(await getAllMachineryLogs(Number(params.machineryID), machineryLogsFilter))
    //
    //         setMachineryLogFilters((val)=>{
    //             val.submit=false
    //             return {...val}
    //         })
    //
    //     }
    //
    //     getData()
    //
    // },[machineryLogsFilter, params.machineryID])
    //
    // return(
    //     <>
    //         <Breadcrumb>
    //             <BreadcrumbItem>
    //                 <RouterLink to={"/machineries"}>
    //                     My machineries
    //                 </RouterLink>
    //             </BreadcrumbItem>
    //             {machinery &&
    //                 <BreadcrumbItem>
    //                     <BreadcrumbLink>
    //                         {machinery.machinery.name} (ID: {machinery.machinery.id})
    //                     </BreadcrumbLink>
    //                 </BreadcrumbItem>
    //             }
    //         </Breadcrumb>
    //         <Heading>{machinery && machinery.machinery.name}</Heading>
    //
    //         <LogsFilteringBar
    //             machineryLogsFilter={machineryLogsFilter}
    //             setMachineryLogFilters={setMachineryLogFilters}
    //         />
    //
    //         <LogsControlBar
    //             expandAll={expandAll}
    //             setExpandAll={setExpandAll}
    //             numLogs={machinery?.logs.length}
    //         />
    //
    //         <VStack>
    //
    //             {
    //                 machinery &&
    //                 machinery.logs.map((log)=>
    //                     <LogItem
    //                         key={log.id}
    //                         log={log}
    //                         expandAll= {expandAll}
    //                         setExpandAll={setExpandAll}
    //                     />
    //                 )
    //             }
    //
    //         </VStack>
    //
    //     </>
    // )

}