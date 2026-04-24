import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, UserPlus, Heart, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { VerifyCodeForm } from './components/VerifyCodeForm'

type ViewMode = 'welcome' | 'login' | 'register' | 'verify'

interface LoginFormData {
  username: string
  password: string
}

interface RegisterFormData {
  nombre: string
  apellido: string
  username: string
  email: string
  telefono: string
  direccion: string
  password: string
  password_confirm: string
}

export const AuthWelcomePage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Guardar datos de formularios
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })
  const [registerFormData, setRegisterFormData] = useState<Partial<RegisterFormData>>({
    nombre: '',
    apellido: '',
    username: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    password_confirm: '',
  })
  
  // Estado para verificación de código
  const [showVerifyCode, setShowVerifyCode] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')

  // En móvil, usar toggle directo sin hover
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = (side: 'left' | 'right') => {
    // Limpiar timeout anterior si existe
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    // Delay mínimo para transición súper fluida
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSide(side)
    }, 50) // 50ms - casi instantáneo pero evita cambios accidentales
  }

  const handleMouseLeave = () => {
    // Verificar si hay algún input activo (focused) o si el mouse está sobre el formulario
    const activeElement = document.activeElement
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.closest('form') !== null
    )
    
    // Limpiar timeout si el mouse sale antes del delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    // Si hay un input activo, esperar más tiempo antes de ocultar
    const delay = isInputFocused ? 600 : 200 // 600ms si hay input activo, 200ms si no - muy rápido
    
    // Agregar delay antes de quitar el hover
    hoverTimeoutRef.current = setTimeout(() => {
      // Verificar nuevamente antes de ocultar
      const stillActive = document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.closest('form') !== null
      )
      if (!stillActive) {
        setHoveredSide(null)
      }
    }, delay)
  }

  return (
    <div className="auth-welcome-container relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-[var(--radius-card)] bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Modo móvil - Diseño optimizado para usabilidad */}
      {isMobile ? (
        <div className="flex h-full flex-col overflow-hidden bg-white">
          {/* Header con toggle claro y visible - Color dinámico según modo */}
          <motion.div
            className="flex-shrink-0 px-6 pt-8 pb-6"
            animate={{
              background: viewMode === 'login' || viewMode === 'welcome'
                ? 'linear-gradient(135deg, var(--color-primary) 0%, rgba(212, 163, 115, 0.95) 100%)'
                : 'linear-gradient(135deg, var(--color-secondary) 0%, rgba(95, 167, 127, 0.95) 100%)',
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-white/20 p-1 backdrop-blur-sm">
              <button
                onClick={() => {
                  setShowVerifyCode(false)
                  setViewMode('login')
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200',
                  viewMode === 'login'
                    ? 'bg-white text-[var(--color-primary)] shadow-md'
                    : 'text-white/90 hover:text-white',
                )}
              >
                <LogIn size={18} />
                <span>Iniciar sesión</span>
              </button>
              <button
                onClick={() => {
                  if (showVerifyCode) {
                    setViewMode('verify')
                  } else {
                    setViewMode('register')
                  }
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200',
                  (viewMode === 'register' || viewMode === 'verify')
                    ? 'bg-white text-[var(--color-secondary)] shadow-md'
                    : 'text-white/90 hover:text-white',
                )}
              >
                <UserPlus size={18} />
                <span>{showVerifyCode ? 'Verificar' : 'Registrarse'}</span>
              </button>
            </div>

            {/* Título contextual */}
            <AnimatePresence mode="wait">
              {viewMode === 'welcome' && (
                <motion.div
                  key="welcome-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Heart size={40} className="text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white">¡Bienvenido!</h2>
                  <p className="mt-2 text-base text-white/90">Elige una opción para continuar</p>
                </motion.div>
              )}
              {viewMode === 'login' && (
                <motion.div
                  key="login-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold text-white">¡Bienvenido de nuevo!</h2>
                </motion.div>
              )}
              {viewMode === 'register' && (
                <motion.div
                  key="register-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold text-white">¡Te damos la bienvenida!</h2>
                </motion.div>
              )}
              {viewMode === 'verify' && (
                <motion.div
                  key="verify-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold text-white">Verifica tu cuenta</h2>
                  <p className="mt-1 text-sm text-white/90">Ingresa el código de 6 dígitos</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contenido principal - Formulario siempre visible */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {viewMode === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full space-y-5"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">¡Bienvenido!</h3>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Elige una opción arriba para comenzar
                    </p>
                  </div>
                </motion.div>
              )}
              {viewMode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <LoginForm 
                    initialData={loginFormData}
                    onDataChange={setLoginFormData}
                  />
                </motion.div>
              )}
              {viewMode === 'register' && !showVerifyCode && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <RegisterForm 
                    initialData={registerFormData as RegisterFormData}
                    onDataChange={(data) => setRegisterFormData(data)}
                    onRegisterSuccess={(email) => {
                      setVerificationEmail(email)
                      setShowVerifyCode(true)
                      setViewMode('verify')
                    }}
                  />
                </motion.div>
              )}
              {(viewMode === 'verify' || showVerifyCode) && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <VerifyCodeForm
                    email={verificationEmail}
                    onBack={() => {
                      setShowVerifyCode(false)
                      setViewMode('register')
                    }}
                    onSuccess={() => {
                      setShowVerifyCode(false)
                      setViewMode('login')
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Modo desktop con hover reveal - Pantalla completa */
        <div className="relative grid h-full grid-cols-2 gap-0 overflow-hidden">
          {/* Panel izquierdo - Login - Colores morados */}
          <motion.div
            className="group relative flex h-full flex-col items-center justify-center overflow-hidden p-8 text-center"
            onMouseEnter={() => handleMouseEnter('left')}
            onMouseLeave={handleMouseLeave}
            style={{
              background: hoveredSide === 'left' 
                ? 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-lavender-light) 100%)'
                : 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-lavender-light) 100%)',
            }}
          >
            <AnimatePresence mode="wait">
              {hoveredSide === 'left' ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full max-w-md"
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    // Cancelar el timeout de salida si el mouse vuelve al formulario
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current)
                      hoverTimeoutRef.current = null
                    }
                  }}
                  onMouseMove={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <LoginForm 
                    initialData={loginFormData}
                    onDataChange={setLoginFormData}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="login-welcome"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-6"
                >
                  <motion.div 
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/20"
                    animate={{ scale: hoveredSide === null ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <LogIn size={40} className="text-[var(--color-primary)]" />
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">¡Bienvenido de nuevo!</h3>
                    <p className="text-lg text-[var(--color-text-secondary)]">
                      Ya tienes cuenta, inicia sesión
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                      <span>Acceso rápido y seguro</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                      <span>Gestiona tus mascotas</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Divisor central con icono */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-surface transition-all"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <Heart size={24} className="text-[var(--color-secondary)]" />
            </div>
          </div>

          {/* Panel derecho - Registro - Colores naranjas */}
          <motion.div
            className="group relative flex h-full flex-col items-center justify-center overflow-hidden p-8 text-center"
            onMouseEnter={() => handleMouseEnter('right')}
            onMouseLeave={handleMouseLeave}
            style={{
              background: hoveredSide === 'right'
                ? 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-peach) 100%)'
                : 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-200) 100%)',
            }}
          >
            <AnimatePresence mode="wait">
              {hoveredSide === 'right' ? (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full max-w-md"
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    // Cancelar el timeout de salida si el mouse vuelve al formulario
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current)
                      hoverTimeoutRef.current = null
                    }
                  }}
                  onMouseMove={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {showVerifyCode ? (
                    <VerifyCodeForm
                      email={verificationEmail}
                      onBack={() => {
                        setShowVerifyCode(false)
                        setHoveredSide('right')
                      }}
                      onSuccess={() => {
                        setShowVerifyCode(false)
                        setHoveredSide(null)
                        setViewMode('login')
                      }}
                    />
                  ) : (
                    <RegisterForm 
                      initialData={registerFormData as RegisterFormData}
                      onDataChange={(data) => setRegisterFormData(data)}
                      onRegisterSuccess={(email) => {
                        setVerificationEmail(email)
                        setShowVerifyCode(true)
                        setHoveredSide('right')
                      }}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="register-welcome"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-6"
                >
                  <motion.div 
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary)]/20"
                    animate={{ scale: hoveredSide === null ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <UserPlus size={40} className="text-[var(--color-secondary)]" />
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">¡Únete a nosotros!</h3>
                    <p className="text-lg text-[var(--color-text-secondary)]">
                      No tienes cuenta, regístrate
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-[var(--color-secondary)]" />
                      <span>Registro en 2 pasos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-[var(--color-secondary)]" />
                      <span>Verificación por correo</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-[var(--color-secondary)]" />
                      <span>Comienza ahora</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  )
}
