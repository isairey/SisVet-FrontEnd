import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export const AuthLayout = () => {
  return (
    <div className="layout-auth relative flex min-h-screen items-center justify-center bg-base px-4 py-6 overflow-hidden">
      {/* Video de fondo - Local */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: 'brightness(0.6) saturate(0.8)',
            opacity: 0.7,
          }}
        >
          <source src="/videos/auth-background.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        {/* Overlay con desvanecido sutil para que no tenga mucho protagonismo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-base)]/70 via-[var(--color-base)]/60 to-[var(--color-base)]/80" />
      </div>

      {/* Logo en la esquina superior izquierda - Oculto en móvil para no interferir con el toggle */}
      <div className="absolute top-6 left-6 z-20 hidden md:block">
        <img 
          src="/logo.png" 
          alt="Logo SGV" 
          className="h-16 w-16 rounded-full object-cover drop-shadow-lg border-2 border-white/20"
        />
      </div>

      {/* Contenido del toggle - Encima del video */}
    <motion.div
        className="relative z-10 w-full max-w-7xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Outlet />
    </motion.div>
  </div>
)
}

