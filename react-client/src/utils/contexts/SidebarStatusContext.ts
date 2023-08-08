import React from 'react'

interface SidebarStatus {
  type: string
  status: string
}

interface Action {
  type: string
}

interface SidebarStatusContextInterface {
  sidebarStatus: SidebarStatus
  dispatchSidebar: React.Dispatch<Action>
}

const SidebarStatusContext = React.createContext<SidebarStatusContextInterface>({
  sidebarStatus: {
    type: '',
    status: ''
  },
  dispatchSidebar: () => void 0
})

export default SidebarStatusContext
