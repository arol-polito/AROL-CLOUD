import {
    Box,
    type BoxProps,
    CloseButton,
    Divider,
    Drawer,
    DrawerContent,
    Flex,
    type FlexProps,
    Heading,
    HStack,
    Icon,
    Image,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react'
import {FiChevronLeft, FiChevronRight, FiCodesandbox, FiFolder, FiGrid, FiHome, FiLock, FiUsers} from 'react-icons/fi'
import ArolLogo from './../assets/arol-logo.png'
import {Link as RouterLink, useLocation, useNavigate} from 'react-router-dom'
import React, {Fragment, memo, useContext, useEffect, useMemo, useState} from 'react'
import SidebarStatusContext from '../utils/contexts/SidebarStatusContext'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    ZAxis
} from 'recharts'
import Thermometer from 'react-thermometer-ecotropy'
import GaugeChart from 'react-gauge-chart'
import permissionChecker from '../utils/PermissionChecker'
import PrincipalContext from '../utils/contexts/PrincipalContext'
import {type IconType} from 'react-icons'

const sidebarItems = [
    {name: 'Home', icon: FiHome, link: '/', selectedMatcher: '/'},
    {name: 'Machineries', icon: FiCodesandbox, link: '/machineries', selectedMatcher: '/machiner'},
    {name: 'Dashboards', icon: FiGrid, link: '/dashboards', selectedMatcher: '/dashboards'},
    {name: 'Documents', icon: FiFolder, link: '/documents', selectedMatcher: '/documents'},
    {name: 'Users management', icon: FiUsers, link: '/users', selectedMatcher: '/users'},
    {name: 'Machinery permissions', icon: FiLock, link: '/permissions', selectedMatcher: '/permissions'}
]

const widgetSelectorItems = [
    {name: 'Current value', category: 'single-value', type: 'current-value', maxSensors: 1, w: 4, h: 2},
    {name: 'Thermostat', category: 'single-value', type: 'thermostat', maxSensors: 1, w: 2, h: 4},
    {name: 'Tachometer', category: 'single-value', type: 'tachometer', maxSensors: 1, w: 4, h: 3},
    {name: 'Area chart', category: 'multi-value', type: 'area-chart', maxSensors: 24, w: 8, h: 4},
    {name: 'Line chart', category: 'multi-value', type: 'line-chart', maxSensors: 24, w: 8, h: 4},
    {name: 'Bar chart', category: 'multi-value', type: 'bar-chart', maxSensors: 24, w: 8, h: 4},
    {name: 'Pie chart', category: 'multi-value', type: 'pie-chart', maxSensors: 5, w: 4, h: 4}
    // {name: "Scatter chart", category: "multi-value", type: "scatter-chart", maxSensors: 1, w: 4, h: 4},

]

interface SidebarProps extends BoxProps {
    onClose: () => void
}

export default function Sidebar(props: any) {

    const {onClose, isOpen} = props;

    const location = useLocation()
    const {sidebarStatus, dispatchSidebar} = useContext(SidebarStatusContext)

    // SIDEBAR STATUS consistency checker
    useEffect(() => {
        if (sidebarStatus.type === 'widget-selector' && !location.pathname.endsWith('/dashboard'))
            dispatchSidebar({type: 'widget-selector-close'})
    }, [dispatchSidebar, location.pathname, sidebarStatus.type])

    const displaySidebar = useMemo(
        () => (sidebarStatus.type === 'sidebar'),
        [sidebarStatus.type]
    )

    const displayWidgetSelector = useMemo(
        () => (sidebarStatus.type === 'widget-selector'),
        [sidebarStatus.type]
    )

    return (
        <>
            {displaySidebar &&
                <SidebarContent
                    onClose={() => onClose}
                    display="block"
                />
            }
            {displayWidgetSelector &&
                <WidgetSelectorContent
                    onClose={() => onClose}
                    display="flex"
                />
            }
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
            >
                <DrawerContent>
                    {displaySidebar && <SidebarContent onClose={onClose}/>}
                    {displayWidgetSelector && <WidgetSelectorContent onClose={onClose}/>}
                </DrawerContent>
            </Drawer>
        </>
    )
}

const SidebarContent = memo(({...rest}: SidebarProps) => {
    const navigate = useNavigate()
    const {sidebarStatus, dispatchSidebar} = useContext(SidebarStatusContext)

    // SIDEBAR EXPAND/COLLAPSE HANDLER
    function handleSidebarExpandCollapse() {
        if (sidebarStatus.status === 'open')
            dispatchSidebar({type: 'sidebar-close'})
        else
            dispatchSidebar({type: 'sidebar-open'})
    }

    return (
        <Box
            // transition="0.5s ease"
            bg="white"
            borderRight="1px"
            borderRightColor="gray.200"
            w={sidebarStatus.status === 'open' ? '279px' : '65px'}
            pos="fixed"
            h="full"
            {...rest}
        >
            <Flex
                h="20"
                alignItems="center"
                mx={sidebarStatus.status === 'open' ? 8 : 0}
                my={8}
                justifyContent="space-between"
                _hover={{
                    cursor: 'pointer'
                }}
                onClick={() => {
                    navigate('/')
                }}
            >
                <Image
                    objectFit='cover'
                    src={ArolLogo}
                    alt='Arol logo'
                    transform={sidebarStatus.status === 'open' ? '' : 'rotate(90deg)'}
                />
            </Flex>
            <Box
                position="absolute"
                top="20px"
                right="-17px"
                bgColor="white"
                borderWidth="1px 1px 1px 0px"
                borderColor="gray.200"
                py={2}
                _hover={{
                    cursor: 'pointer'
                }}
                onClick={handleSidebarExpandCollapse}
            >
                {sidebarStatus.status === 'open' && <FiChevronLeft/>}
                {sidebarStatus.status === 'closed' && <FiChevronRight/>}
            </Box>
            {sidebarItems.map((sidebarItem) => (
                <SidebarItem
                    key={sidebarItem.name}
                    name={sidebarItem.name}
                    icon={sidebarItem.icon}
                    link={sidebarItem.link}
                    selectedMatcher={sidebarItem.selectedMatcher}
                />
            ))}
        </Box>
    )
})

interface NavItemProps extends FlexProps {
    name: string
    icon: IconType
    link: string
    selectedMatcher: string
}

const SidebarItem = (props: NavItemProps) => {

    const {name, icon, link, selectedMatcher} = props;

    const location = useLocation()

    const {principal} = useContext(PrincipalContext)
    const {sidebarStatus} = useContext(SidebarStatusContext)

    const [isSelected, setIsSelected] = useState(false)
    const [showItem, setShowItem] = useState(true)

    // CHECK IF SIDEBAR ITEM IS TO DISPLAYED
    useEffect(() => {
        if (principal == null) {
            setShowItem(false)

            return
        }

        if (permissionChecker.hasSidebarItemAccess(principal, name))
            setShowItem(true)
        else
            setShowItem(false)
    }, [principal, name])

    // CHECK IF SIDEBAR ITEM IS TO BE SELECTED
    useEffect(() => {
        if (principal == null) {
            setIsSelected(false)

            return
        }

        if (selectedMatcher === '/')
            setIsSelected(location.pathname === selectedMatcher)
        else
            setIsSelected(location.pathname.startsWith(selectedMatcher))
    }, [principal, location.pathname, selectedMatcher])

    return (
        <RouterLink to={link} hidden={!showItem}>
            <Box style={{textDecoration: 'none'}} _focus={{boxShadow: 'none'}}>
                <Flex
                    align="center"
                    p="4"
                    mx="2"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{
                        bg: 'cyan.400',
                        color: 'white'
                    }}
                    bg={isSelected ? 'gray.400' : ''}
                    color={isSelected ? 'white' : ''}
                >
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white'
                        }}
                        as={icon}
                    />
                    {sidebarStatus.status === 'open' && name}
                </Flex>
            </Box>
        </RouterLink>
    )
}

const WidgetSelectorContent = memo(({onClose, ...rest}: SidebarProps) => {
    const navigate = useNavigate()

    const {dispatchSidebar} = useContext(SidebarStatusContext)

    function handleWidgetSelectorCloseButtonClicked() {
        dispatchSidebar({
            type: 'widget-selector-close'
        })
    }

    return (
        <VStack
            transition="3s ease"
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{base: 'full', md: '279px'}}
            pos="fixed"
            h="100vh"
            {...rest}
        >
            <Box
                flexGrow={1}
                textAlign="center"
                mx="8"
                my={8}
                justifyContent="space-between"
                _hover={{
                    cursor: 'pointer'
                }}
                onClick={() => {
                    navigate('/')
                }}
            >
                <Image
                    objectFit='cover'
                    src={ArolLogo}
                    alt='Arol logo'
                />
                <CloseButton display={{base: 'flex', md: 'none'}} onClick={onClose}/>
            </Box>
            <Divider
                orientation="horizontal"
                my="0!important"
            />
            {/* <Divider orientation={"horizontal"} /> */}
            <Box position="relative" w="full" pt={4} mt="0!important" flexGrow={4} overflowY="auto"
                 style={{direction: 'rtl'}}>
                <Box style={{direction: 'ltr'}}>
                    <CloseButton
                        position="absolute"
                        size="lg"
                        right={0}
                        top={0}
                        onClick={handleWidgetSelectorCloseButtonClicked}
                    />
                    <Heading size="md" textAlign="center" mb={2}>Available widgets</Heading>
                    <Text
                        fontSize="sm"
                        fontWeight={400}
                        color="gray.500"
                        textAlign="center"
                        mb={3}
                    >
                        Drag & drop any of the following widgets on the dashboard on the right.
                    </Text>
                    {/* <Divider orientation={"horizontal"} borderColor={"gray.300"} /> */}
                    {widgetSelectorItems.map((widgetSelectorItem) => (
                        <Fragment key={widgetSelectorItem.name}>
                            <WidgetSelectorItem widget={widgetSelectorItem}/>
                            {/* <Divider orientation={"horizontal"} borderColor={"gray.300"}/> */}
                        </Fragment>
                    ))}
                </Box>
            </Box>
        </VStack>
    )
})

interface WidgetSelectorItemProps {
    widget: {
        name: string
        category: string
        type: string
        w: number
        h: number
    }
}

const WidgetSelectorItem = memo((props: WidgetSelectorItemProps) => {

    const {widget} = props;

    function handleDragStart(event: React.DragEvent<HTMLDivElement>, widget: WidgetSelectorItemProps['widget']) {
        // Set format like this to be able to retrieve w&h in the onDragOver event (via .types)
        event.dataTransfer.setData(`${widget.w},${widget.h}`, JSON.stringify(widget))
    }

    const WidgetPreviewComponent = useMemo(
        () => (WidgetPreview(widget.type)),
        [widget.type]
    )

    return (
        <VStack
            // bg={useColorModeValue('white', 'gray.900')}
            boxShadow="xl"
            rounded="xl"
            borderWidth={1}
            borderColor="gray.400"
            m={2}
            p={3}
            justifyContent="stretch"
            onDragStart={(e) => {
                handleDragStart(e, widget)
            }}
            draggable
        >
            <Text fontSize="md" fontWeight="600">{widget.name} widget</Text>
            {WidgetPreviewComponent}
        </VStack>
    )
})

function WidgetPreview(type: string) {
    const data = [
        {
            name: 'Page A',
            uv: 2000,
            pv: 2400,
            amt: 2400
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500
        },
        {
            name: 'Page G',
            uv: 1490,
            pv: 4300,
            amt: 2100
        }
    ]

    switch (type) {
        case 'current-value': {
            return (
                <HStack w="full" alignItems="baseline" justifyContent="center">
                    <Text fontSize={40}>24.5</Text>
                    <Text fontSize="md">Units</Text>
                </HStack>
            )
        }
        case 'thermostat': {
            return (
                <HStack w="full" alignItems="baseline" justifyContent="center" pb={3}>
                    <Thermometer
                        theme="light"
                        value="18"
                        max="100"
                        format="°C"
                        size="large"
                        height="200"
                        tooltipValue={false}
                    />
                </HStack>
            )
        }
        case 'tachometer': {
            return (
                <HStack w="full" alignItems="baseline" justifyContent="center" pb={3}>
                    <GaugeChart
                        id="gauge-chart3"
                        nrOfLevels={1}
                        colors={['#8884d8']}
                        percent={0.37}
                        arcWidth={0.3}
                        hideText
                    />
                </HStack>
            )
        }
        case 'area-chart': {
            return (
                <Box display="block" minW="full" h={100} textAlign="center">
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart
                            data={data}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8"/>
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            )
        }
        case 'line-chart': {
            return (
                <Box display="block" minW="full" h={100} textAlign="center">
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart
                            data={data}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Line type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8"/>
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            )
        }
        case 'bar-chart': {
            return (
                <Box display="block" minW="full" h={100} textAlign="center">
                    <ResponsiveContainer width="99%" height="100%">
                        <BarChart
                            data={data}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Bar type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8"/>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )
        }
        case 'pie-chart': {
            return (
                <Box display="block" minW="full" h={100} textAlign="center">
                    <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="uv" nameKey="name" cx="50%" cy="50%" outerRadius={50}
                                 fill="#8884d8"/>
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            )
        }
        case 'scatter-chart': {
            return (
                <Box display="block" minW="full" h={100} textAlign="center">
                    <ResponsiveContainer width="99%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="uv" hide/>
                            <YAxis dataKey="pv" hide/>
                            <ZAxis dataKey="amt"/>
                            <Scatter data={data} fill="#8884d8"/>
                        </ScatterChart>
                    </ResponsiveContainer>
                </Box>
            )
        }
    }
}
