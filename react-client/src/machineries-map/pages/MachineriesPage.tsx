import MapPanel from '../components/MapPanel'
import { useEffect, useState } from 'react'
import type Machinery from '../components/Machinery'
import machineriesApi from '../../services/MachineryService'
import { Box, Divider, Heading, HStack, useColorModeValue } from '@chakra-ui/react'
import NavigatorPanel from '../components/NavigatorPanel';
import React from 'react';

interface Navigator {
  stage: number
  clusterLocation: string
  machineryUID: string
}

export default function MachineriesPage () {
  const [machineries, setMachineries] = useState<Map<string, Machinery[]>>(new Map())
  const [machineriesLoading, setMachineriesLoading] = useState(false)
  const [navigator, setNavigator] = useState<Navigator>({
    stage: 0,
    clusterLocation: '',
    machineryUID: ''
  })

  // Fetch machineries map
  useEffect(() => {
    async function retrieveData () {
      setMachineriesLoading(true)

      try {
        const data = await machineriesApi.getMachineryByCompany()
        setMachineries(data)

        if (data.size === 1)
          setNavigator({
            stage: 1,
            clusterLocation: Array.from(data.keys())[0],
            machineryUID: ''
          })
      } catch (e) {
        console.error(e)
      }

      setMachineriesLoading(false)
    }

    retrieveData()
  }, [])

  return (
        <Box w="full">
            <Heading mb={6}>Machineries</Heading>
            <HStack
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow="2xl"
                rounded="lg"
                p={6}
            >
                <NavigatorPanel
                    machineries={machineries}
                    setMachineries={setMachineries}
                    machineriesLoading={machineriesLoading}
                    navigator={navigator}
                    setNavigator={setNavigator}
                />
                <Divider orientation="vertical" height="500px"/>
                <MapPanel
                    machineries={machineries}
                    setMachineries={setMachineries}
                    navigator={navigator}
                    setNavigator={setNavigator}
                />
            </HStack>
        </Box>

  )
}
