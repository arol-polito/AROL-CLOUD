import type Machinery from '../../machineries-map/components/Machinery'
import type SavedDashboard from '../../machinery/dashboard/interfaces/SavedDashboard'

export default interface MachineryWithDashboards extends Machinery {
  dashboards: SavedDashboard[]
  active: boolean
}
