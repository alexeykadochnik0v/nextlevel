import { cn } from '../lib/utils'

export default function Tabs({ tabs, activeTab, onChange }) {
    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto overflow-y-hidden px-4 sm:px-6 lg:px-8 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            'pb-4 pt-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0',
                            activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    )
}

