"use client"

import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes'
import { PageLoader } from '@/components/ui/page-loader'

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => (
    <Route
      key={route.path + index}
      path={route.path}
      element={
        <Suspense fallback={<PageLoader />}>
          {route.element}
        </Suspense>
      }
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ))
}

export function AppRouter() {
  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  )
}
