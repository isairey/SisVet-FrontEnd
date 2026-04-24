import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useConfirmConsentMutation } from '@/hooks/consultations'
import {
  ConsentInvalidTokenState,
  ConsentSuccessState,
  ConsentErrorState,
  ConsentFormState,
} from '@/components/consent'

export const ConfirmConsentPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmMutation = useConfirmConsentMutation()

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado en el enlace')
    }
  }, [token])

  const handleConfirm = async () => {
    if (!token) return

    try {
      console.log('Intentando confirmar consentimiento con token:', token?.substring(0, 20) + '...')
      const result = await confirmMutation.mutateAsync(token)
      console.log('Consentimiento confirmado exitosamente:', result)
      setConfirmed(true)
      setError(null)
    } catch (err: any) {
      console.error('Error al confirmar consentimiento:', err)
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Error al confirmar el consentimiento. Por favor, intenta nuevamente.'
      setError(errorMessage)
      setConfirmed(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-3xl">
        {!token ? (
          <ConsentInvalidTokenState />
        ) : confirmed ? (
          <ConsentSuccessState />
        ) : error ? (
          <ConsentErrorState
            error={error}
            onRetry={handleConfirm}
            isRetrying={confirmMutation.isPending}
          />
        ) : (
          <ConsentFormState
            onConfirm={handleConfirm}
            isConfirming={confirmMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
