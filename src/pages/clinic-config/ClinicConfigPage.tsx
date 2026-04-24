import { useState } from 'react'
import { Settings, Briefcase, Tag, Award, Heart, CreditCard } from 'lucide-react'
import { ServicesConfigTab } from './components/ServicesConfigTab'
import { CategoriesConfigTab } from './components/CategoriesConfigTab'
import { BrandsConfigTab } from './components/BrandsConfigTab'
import { SpeciesBreedsConfigTab } from './components/SpeciesBreedsConfigTab'
import { PaymentMethodsConfigTab } from './components/PaymentMethodsConfigTab'

type ConfigTab = 'servicios' | 'categorias' | 'marcas' | 'especies-razas' | 'metodos-pago'

const tabs: Array<{ id: ConfigTab; label: string; icon: typeof Settings }> = [
  { id: 'servicios', label: 'Servicios', icon: Briefcase },
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'marcas', label: 'Marcas', icon: Award },
  { id: 'especies-razas', label: 'Especies y Razas', icon: Heart },
  { id: 'metodos-pago', label: 'Métodos de Pago', icon: CreditCard },
]

export const ClinicConfigPage = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('servicios')

  return (
    <div className="space-y-6">
      <header>
        <p className="text-label">Configuración</p>
        <h1 className="text-3xl font-semibold text-heading">Configuración de la Clínica</h1>
        <p className="text-description">Gestiona servicios, categorías, marcas y otras configuraciones básicas del sistema.</p>
      </header>

      {/* Tabs */}
      <div className="rounded-xl bg-surface p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
        <style>{`
          .tabs-scroll-container::-webkit-scrollbar {
            height: 4px;
          }
          .tabs-scroll-container::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
            margin: 0 8px;
          }
          .tabs-scroll-container::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          }
          .tabs-scroll-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}</style>
        <div className="tabs-scroll-container flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.15) transparent' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0
                  ${isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-200)] hover:text-[var(--color-text-heading)]'
                  }
                `}
                style={isActive ? {
                  transform: 'translateY(-1px)',
                } : {}}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-[var(--color-muted)]'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        {activeTab === 'servicios' && <ServicesConfigTab />}
        {activeTab === 'categorias' && <CategoriesConfigTab />}
        {activeTab === 'marcas' && <BrandsConfigTab />}
        {activeTab === 'especies-razas' && <SpeciesBreedsConfigTab />}
        {activeTab === 'metodos-pago' && <PaymentMethodsConfigTab />}
      </div>
    </div>
  )
}

