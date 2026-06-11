'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getErrorMessage } from '@/lib/utils/errorUtils'
import { validateInstallerPassword } from '@/lib/installer/passwordPolicy'
import { Loader2, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [validating, setValidating] = useState(true)
    const [tokenError, setTokenError] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                if (!supabase) {
                    throw new Error('Supabase não configurado.')
                }

                const { searchParams: urlParams } = new URL(window.location.href)
                const code = urlParams.get('code')

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                }

                setValidating(false)
            } catch {
                setTokenError(true)
                setValidating(false)
            }
        }

        handleAuthCallback()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!supabase) {
                throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
            }

            if (password !== confirmPassword) {
                throw new Error('As senhas não coincidem.')
            }

            const validation = validateInstallerPassword(password)
            if (!validation.ok) {
                throw new Error(validation.error)
            }

            const { error } = await supabase.auth.updateUser({
                password,
            })

            if (error) throw error
            setSuccess(true)

            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    <p className="text-slate-500 dark:text-slate-400">Validando link...</p>
                </div>
            </div>
        )
    }

    if (tokenError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/20 rounded-full blur-[120px]" />
                    <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-md w-full relative z-10 px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight mb-2">
                            Link inválido
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            O link de redefinição de senha é inválido ou expirou.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-8 backdrop-blur-sm text-center">
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Solicite um novo link de redefinição de senha.
                        </p>
                        <Link
                            href="/forgot-password"
                            className="inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all"
                        >
                            Solicitar novo link
                        </Link>
                        <div className="mt-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar ao login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight mb-2">
                        Redefinir senha
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Digite sua nova senha abaixo.
                    </p>
                </div>

                <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Senha redefinida!
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Sua senha foi atualizada com sucesso. Redirecionando para o login...
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nova senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        aria-required="true"
                                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    Mínimo 8 caracteres, com pelo menos 1 letra e 1 número.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Confirmar nova senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        aria-required="true"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all sm:text-sm"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    'Redefinir senha'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar ao login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} CRM IA. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
