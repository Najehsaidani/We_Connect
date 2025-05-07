import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Mail, Lock } from 'lucide-react'
import {authService} from '@/services/authService'
import { useToast } from "@/hooks/use-toast"

const VerifyCode = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [activeInput, setActiveInput] = useState(null)
  const inputRefs = useRef([])

  const codeComplete = code.every(digit => digit !== '')

  // Initialize countdown
  useEffect(() => {
    if (!email) {
      navigate('/auth/signup')
      toast({
        title: "Erreur",
        description: "Veuillez d'abord remplir le formulaire d'inscription.",
        variant: "destructive"
      })
    }

    let interval = null
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [email, navigate, toast, countdown])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle input change
  const handleInputChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, '')
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleBackspace = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle arrow keys
  const handleKeyDown = (index, e) => {
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '')
    
    if (paste.length === 6) {
      const newCode = paste.split('').slice(0, 6)
      setCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  // Resend code
  const resendCode = async () => {
    setResending(true)
    setError('')
    
    try {
      const response = await authService.resendOtp(email)
      
      if (response.data?.error) {
        setError(response.data.error)
      } else {
        setCountdown(60)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        toast({
          title: "Code renvoyé!",
          description: "Un nouveau code de vérification a été envoyé."
        })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’envoi du code.')
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer le code de vérification.",
        variant: "destructive"
      })
    } finally {
      setResending(false)
    }
  }

  // Verify code
  const verifyCode = async () => {
    if (!codeComplete) return
    
    setVerifying(true)
    setError('')
    
    try {
      await authService.verifyUser({
        email,
        verificationCode: code.join('')
      })
      
      toast({
        title: "Vérification réussie!",
        description: "Votre compte a été vérifié avec succès."
      })
      
      setTimeout(() => {
        navigate('/auth')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Code incorrect. Veuillez réessayer.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      
      toast({
        title: "Erreur",
        description: "Code de vérification invalide.",
        variant: "destructive"
      })
    } finally {
      setVerifying(false)
    }
  }

  // Go back
  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Vérification requise
          </h1>
          <p className="text-gray-500 mt-2">
            Nous avons envoyé un code à 6 chiffres à<br />
            <strong className="text-blue-600">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-6">
          <div 
            className="code-inputs flex justify-center gap-3"
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e)}
                onKeyDown={(e) => handleBackspace(index, e)}
                onKeyUp={(e) => handleKeyDown(index, e)}
                onFocus={() => setActiveInput(index)}
                onBlur={() => setActiveInput(null)}
                className={`w-14 h-16 text-center text-2xl font-semibold border-2 rounded-lg transition-all
                  ${error ? 'border-red-500' : activeInput === index ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'}
                `}
              />
            ))}
          </div>

          <div className="w-full text-center">
            {countdown > 0 ? (
              <p className="text-gray-500 text-sm">
                Nouveau code disponible dans {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={resendCode}
                disabled={resending}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {resending && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                Renvoyer le code
              </button>
            )}
          </div>

          <div className="flex justify-between w-full mt-6">
            <Button
              variant="outline"
              onClick={goBack}
              className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Retour
            </Button>
            
            <Button
              onClick={verifyCode}
              disabled={!codeComplete || verifying}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              Vérifier
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyCode