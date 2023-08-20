import {Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, Spinner, VStack} from '@chakra-ui/react'
import HeadingPanel from './components/HeadingPanel'
import React from 'react'
import DashboardPanel from '../dashboard/components/DashboardPanel'
import DocumentsPanel from '../documents/components/DocumentsPanel'
import LandingPanel from './components/LandingPanel'
import {useMachineryPageLogic} from "./useMachineryPageLogic";

interface DashboardProps {
    type: string
}

export default function MachineryPage(props: DashboardProps) {

    const {type} = props;

    const machineryLogic = useMachineryPageLogic();

    const {
        machineryUID,
        machinery,
        machinerySensors,
        machineryLoading,
        dashboardPermissions,
        documentsPermissions,
        dashboard,
        setDashboard,
        chartTooltip,
        setChartTooltip,
        loadDashboard,
        breadcrumbNavigate,
        layout,
        setLayout
    } = machineryLogic

    return (
        <Box w="full">
            <Breadcrumb mb={2}>
                <BreadcrumbItem>
                    <BreadcrumbLink onClick={(e) => {
                        breadcrumbNavigate(e, '/machineries', false)
                    }}>
                        Machineries
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem isCurrentPage={type === 'landing'}>
                    <BreadcrumbLink
                        onClick={(e) => {
                            breadcrumbNavigate(e, `/machinery/${machineryUID}`, type === 'landing')
                        }}>
                        {machineryUID}
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {
                    type === 'dashboard' &&
                    < BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink
                            onClick={(e) => {
                                breadcrumbNavigate(e, `/machinery/${machineryUID}/dashboard`, true)
                            }}>
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                }
                {
                    type === 'documents' &&
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink
                            onClick={(e) => {
                                breadcrumbNavigate(e, `/machinery/${machineryUID}/documents`, true)
                            }}>
                            Documents
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                }
            </Breadcrumb>

            {
                !machineryLoading &&
                (machinery != null) &&
                machineryUID &&
                <>
                    <Heading mb={6}>Machinery {machineryUID}</Heading>
                    <HeadingPanel
                        type={type}
                        machinery={machinery}
                        dashboard={dashboard}
                        setDashboard={setDashboard}
                        loadDashboard={loadDashboard}
                        dashboardPermissions={dashboardPermissions}
                        documentsPermissions={documentsPermissions}
                        setChartTooltip={setChartTooltip}
                    />
                    {
                        type === 'landing' &&
                        <LandingPanel
                            machinery={machinery}
                        />
                    }
                    {
                        type === 'dashboard' &&
                        <DashboardPanel
                            machinery={machinery}
                            dashboard={dashboard}
                            setDashboard={setDashboard}
                            availableSensors={machinerySensors}
                            loadDashboard={loadDashboard}
                            dashboardPermissions={dashboardPermissions}
                            chartTooltip={chartTooltip}
                            setChartTooltip={setChartTooltip}
                            layout={layout}
                            setLayout={setLayout}
                        />
                    }
                    {
                        type === 'documents' &&
                        <DocumentsPanel
                            machinery={machinery}
                            documentsPermissions={documentsPermissions}
                        />
                    }
                </>
            }
            {
                machineryLoading &&
                <VStack
                    w="full"
                    h="700px"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Spinner size="xl"/>
                </VStack>
            }
        </Box>
    )
}
