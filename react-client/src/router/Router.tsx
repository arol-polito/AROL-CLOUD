import { Navigate, Route, Routes } from 'react-router-dom'
import MachineriesPage from '../machineries-map/pages/MachineriesPage'
import Home from '../home/Home'
import PageNotFound from '../page-not-found/PageNotFound'
import LoginPage from '../authentication/pages/LoginPage'
import SignupPage from '../authentication/pages/SignupPage'
import { useContext } from 'react'
import PrincipalContext from '../utils/contexts/PrincipalContext'
import MachineryPage from '../machinery/machinery/pages/MachineryPage'
import DocumentViewer from '../machinery/documents/components/DocumentViewer'
import DashboardsPage from '../dashboards/pages/DashboardsPage'
import DocumentsPage from '../documents/pages/DocumentsPage'
import UsersPage from '../users/pages/UsersPage'
import MachineryPermissionsPage from '../machinery-users/pages/MachineryPermissionsPage'
import permissionChecker from '../utils/PermissionChecker'
import React from 'react';

const ROLE_MANAGER = 2

export default function Router () {
  const { principal } = useContext(PrincipalContext)

  function getRoute (path: string) {
    switch (path) {
      case '/': {
        if (principal == null) return <Navigate to="/login"/>

        return <Home/>
      }
      case '/login': {
        if (principal != null) return <Navigate to="/"/>

        return <LoginPage/>
      }
      case '/signup': {
        if (principal != null) return <Navigate to="/"/>

        return <SignupPage/>
      }
      case '/machineries': {
        if (principal == null) return <Navigate to="/login"/>

        return <MachineriesPage/>
      }
      case '/machinery/:machineryUID': {
        if (principal == null) return <Navigate to="/login"/>

        return <MachineryPage type="landing"/>
      }
      case '/machinery/:machineryUID/dashboard': {
        if (principal == null) return <Navigate to="/login"/>
        if (!permissionChecker.hasAnyDashboardAccess(principal)) return <Navigate to="/"/>

        return <MachineryPage type="dashboard"/>
      }
      case '/machinery/:machineryUID/documents': {
        if (principal == null) return <Navigate to="/login"/>
        if (!permissionChecker.hasAnyDocumentsAccess(principal)) return <Navigate to="/"/>

        return <MachineryPage type="documents"/>
      }
      case '/machinery/:machineryUID/documents/:documentUID': {
        if (principal == null) return <Navigate to="/login"/>

        return <DocumentViewer/>
      }
      case '/dashboards': {
        if (principal == null) return <Navigate to="/login"/>
        if (!permissionChecker.hasAnyDashboardAccess(principal)) return <Navigate to="/"/>

        return <DashboardsPage/>
      }
      case '/documents': {
        if (principal == null) return <Navigate to="/login"/>
        if (!permissionChecker.hasAnyDocumentsAccess(principal)) return <Navigate to="/"/>

        return <DocumentsPage/>
      }
      case '/users': {
        if (principal == null) return <Navigate to="/login"/>
        if (permissionChecker.getRoleRank(principal.roles) < ROLE_MANAGER) return <Navigate to="/"/>

        return <UsersPage/>
      }
      case '/permissions': {
        if (principal == null) return <Navigate to="/login"/>
        if (permissionChecker.getRoleRank(principal.roles) < ROLE_MANAGER) return <Navigate to="/"/>

        return <MachineryPermissionsPage/>
      }
      default: {
        console.error(`Unknown router path ${path}`)

        return <PageNotFound/>
      }
    }
  }

  return (
        <Routes>
            <Route
                path="/"
                element={getRoute('/')}/>
            <Route
                path="/login"
                element={getRoute('/login')}/>
            <Route
                path="/signup"
                element={getRoute('/signup')}/>
            <Route
                path="/machineries"
                element={getRoute('/machineries')}
            />
            <Route
                path="/machinery/:machineryUID"
                element={getRoute('/machinery/:machineryUID')}
            />
            <Route
                path="/machinery/:machineryUID/dashboard"
                element={getRoute('/machinery/:machineryUID/dashboard')}
            />
            <Route
                path="/machinery/:machineryUID/documents"
                element={getRoute('/machinery/:machineryUID/documents')}
            />
            <Route
                path="/machinery/:machineryUID/documents/:documentUID"
                element={getRoute('/machinery/:machineryUID/documents/:documentUID')}
            />
            <Route
                path="/dashboards"
                element={getRoute('/dashboards')}
            />
            <Route
                path="/documents"
                element={getRoute('/documents')}
            />
            <Route
                path="/users"
                element={getRoute('/users')}
            />
            <Route
                path="/permissions"
                element={getRoute('/permissions')}
            />
            <Route
                path="/*"
                element={<PageNotFound/>}
            />
        </Routes>
  )
}
