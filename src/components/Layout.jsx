import { Outlet } from 'react-router-dom'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
            <MobileHeader />
            <Outlet />
            <MobileBottomNav />
        </div>
    )
}

