interface SidebarStatus {
  type: string
  status: string
  previousType: string
  previousStatus: string
}

interface Action {
  type: string
}

export default function SidebarStatusReducer (sidebarStatus: SidebarStatus, action: Action): SidebarStatus {
  switch (action.type) {
    case 'sidebar-open': {
      sidebarStatus.previousStatus = sidebarStatus.status
      sidebarStatus.previousType = sidebarStatus.type

      sidebarStatus.type = 'sidebar'
      sidebarStatus.status = 'open'

      return { ...sidebarStatus }
    }
    case 'sidebar-close': {
      sidebarStatus.previousStatus = sidebarStatus.status
      sidebarStatus.previousType = sidebarStatus.type

      sidebarStatus.type = 'sidebar'
      sidebarStatus.status = 'closed'

      return { ...sidebarStatus }
    }
    case 'widget-selector-open': {
      sidebarStatus.type = 'widget-selector'
      sidebarStatus.status = 'open'

      return { ...sidebarStatus }
    }
    case 'widget-selector-close': {
      if (sidebarStatus.previousType && sidebarStatus.previousStatus) {
        sidebarStatus.type = sidebarStatus.previousType
        sidebarStatus.status = sidebarStatus.previousStatus
      } else {
        sidebarStatus.type = 'sidebar'
        sidebarStatus.status = 'open'
      }

      return { ...sidebarStatus }
    }
    case 'logout': {
      sidebarStatus.type = 'none'
      sidebarStatus.status = 'closed'

      return { ...sidebarStatus }
    }
    case 'login': {
      sidebarStatus.previousType = 'sidebar'
      sidebarStatus.previousStatus = 'open'

      sidebarStatus.type = 'sidebar'
      sidebarStatus.status = 'open'

      return { ...sidebarStatus }
    }
    default: {
      throw Error(`Unknown action: ${action.type}`)
    }
  }
}
