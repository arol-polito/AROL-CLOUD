import axios from '../utils/AxiosInterceptor'
import Dashboard from '../machinery/dashboard/models/Dashboard'
import type SavedDashboard from '../machinery/dashboard/interfaces/SavedDashboard'

export default {
  saveDashboard,
  saveAsDashboard,
  deleteDashboard,
  loadDashboard,
  loadDefaultDashboard,
  getSavedDashboards,
  getDashboardTemplates
}

async function saveDashboard (dashboard: Dashboard) {
  const response = await axios.post(
    '/dashboard/save',
    { dashboard }
  )

  if (response.status === 200)
    return response.data

  throw response.data
}

async function saveAsDashboard (dashboard: Dashboard) {
  const response = await axios.post(
    '/dashboard/saveas',
    { dashboard }
  )

  if (response.status === 200)
    return response.data

  throw response.data
}

async function deleteDashboard (machineryUID: string, dashboardName: string): Promise<boolean> {
  const response = await axios.delete(
    `/dashboard/delete/?machineryUID=${machineryUID}&dashboardName=${dashboardName}`
  )

  return response.status === 200
}

async function loadDashboard (machineryUID: string, dashboardName: string): Promise<Dashboard> {
  const response = await axios.get(
    `/dashboard/load/?machineryUID=${machineryUID}&dashboardName=${dashboardName}`
  )

  if (response.status === 200)
    return response.data

  return new Dashboard()
}

async function loadDefaultDashboard (machineryUID: string): Promise<Dashboard> {
  const response = await axios.get(
    `/dashboard/load/default/?machineryUID=${machineryUID}`
  )

  if (response.status === 200)
    return response.data

  return new Dashboard()
}

async function getSavedDashboards (machineryUID: string) {
  const response = await axios.get<SavedDashboard[]>(
    `/dashboard/saved/?machineryUID=${machineryUID}`
  )

  if (response.status === 200)
    return response.data

  throw response.data
}

async function getDashboardTemplates (machineryUID: string) {
  const response = await axios.get<SavedDashboard[]>(
    `/dashboard/templates/?machineryUID=${machineryUID}`
  )

  if (response.status === 200)
    return response.data

  throw response.data
}
