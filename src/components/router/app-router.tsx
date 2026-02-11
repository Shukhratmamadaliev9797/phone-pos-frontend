"use client"

import { Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes'
import { PageLoader } from '@/components/ui/page-loader'
import { useI18n } from '@/lib/i18n/provider'

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

function TitleManager() {
  const location = useLocation()
  const { language } = useI18n()

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, '') || '/'
    const byLang = {
      app: language === 'uz' ? 'Phone POS' : 'Phone POS',
      signIn: language === 'uz' ? 'Kirish' : 'Sign In',
      dashboard: language === 'uz' ? 'Dashboard' : 'Dashboard',
      inventory: language === 'uz' ? 'Inventar' : 'Inventory',
      purchases: language === 'uz' ? 'Xaridlar' : 'Purchases',
      sales: language === 'uz' ? 'Sotuvlar' : 'Sales',
      customers: language === 'uz' ? 'Mijozlar' : 'Customers',
      repairs: language === 'uz' ? 'Taʼmirlash' : 'Repairs',
      workers: language === 'uz' ? 'Xodimlar' : 'Workers',
      reports: language === 'uz' ? 'Hisobotlar' : 'Reports',
      settings: language === 'uz' ? 'Sozlamalar' : 'Settings',
      help: language === 'uz' ? 'Yordam' : 'Help',
      messages: language === 'uz' ? 'Xabarlar' : 'Messages',
      profile: language === 'uz' ? 'Profil' : 'Profile',
      forbidden: language === 'uz' ? 'Taqiqlangan' : 'Forbidden',
      unauthorized: language === 'uz' ? 'Ruxsat yo‘q' : 'Unauthorized',
      notFound: language === 'uz' ? 'Sahifa topilmadi' : 'Page Not Found',
    }

    const titleMap: Array<[string, string]> = [
      ['/auth/sign-in', `🔐 ${byLang.signIn}`],
      ['/dashboard', `📊 ${byLang.dashboard}`],
      ['/inventory', `📦 ${byLang.inventory}`],
      ['/purchases', `🛒 ${byLang.purchases}`],
      ['/sales', `💸 ${byLang.sales}`],
      ['/customers', `👥 ${byLang.customers}`],
      ['/repairs', `🛠️ ${byLang.repairs}`],
      ['/workers', `👷 ${byLang.workers}`],
      ['/reports', `📈 ${byLang.reports}`],
      ['/settings', `⚙️ ${byLang.settings}`],
      ['/help', `❓ ${byLang.help}`],
      ['/messages', `💬 ${byLang.messages}`],
      ['/user', `🙍 ${byLang.profile}`],
      ['/errors/forbidden', `⛔ ${byLang.forbidden}`],
      ['/errors/unauthorized', `🚫 ${byLang.unauthorized}`],
    ]

    const matched = titleMap.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))
    if (matched) {
      document.title = `${matched[1]} | ${byLang.app}`
      return
    }

    if (path === '/' || path === '') {
      document.title = `📊 ${byLang.dashboard} | ${byLang.app}`
      return
    }

    document.title = `404 • ${byLang.notFound} | ${byLang.app}`
  }, [language, location.pathname])

  return null
}

export function AppRouter() {
  return (
    <>
      <TitleManager />
      <Routes>
        {renderRoutes(routes)}
      </Routes>
    </>
  )
}
