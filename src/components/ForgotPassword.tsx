
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                setSent(true);
            } else {
                setError(data.message || 'Ocurrió un error. Intenta más tarde.');
            }
        } catch {
            setError('No se pudo conectar con el servidor. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="absolute top-0 left-0 w-full h-64 bg-burgundy/5 -z-10" />

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gold/20">

                    {!sent ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="font-amandine text-4xl md:text-5xl text-burgundy mb-3 tracking-tight">
                                    ¿Olvidaste tu contraseña?
                                </h2>
                                <p className="text-plum/70 text-sm font-inter leading-relaxed">
                                    Ingresa tu correo y te enviaremos un enlace para restablecerla.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm flex items-start gap-3 font-inter">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
                                        placeholder="tu@correo.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-burgundy to-burgundy-light text-white text-base font-medium rounded-xl hover:from-burgundy-dark hover:to-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-inter"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        'Enviar enlace'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        // ── Estado: email enviado ──
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-amandine text-3xl text-burgundy mb-3">
                                Revisa tu correo
                            </h3>
                            <p className="text-plum/70 text-sm font-inter leading-relaxed mb-6">
                                Si <strong className="text-plum">{email}</strong> está registrado, recibirás un enlace en los próximos minutos. No olvides revisar la carpeta de spam.
                            </p>
                            <button
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="text-sm text-burgundy hover:text-gold transition-colors font-medium font-inter underline underline-offset-2"
                            >
                                Usar otro correo
                            </button>
                        </div>
                    )}

                    <div className="text-center pt-6">
                        <Link
                            to="/login"
                            className="text-sm text-plum/60 hover:text-burgundy transition-colors font-inter flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// components/ResetPassword.tsx
// Ruta sugerida: /reset-password?token=<rawToken>
// ─────────────────────────────────────────────────────────────────────────────

export const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

   
    const API_URL = import.meta.env.VITE_API_URL || 'https://mused-backend.onrender.com/api';

    // Leer token de la URL
    const token = new URLSearchParams(window.location.search).get('token') || '';

    // Validar token al montar el componente
    React.useEffect(() => {
        if (!token) {
            setError('El enlace no es válido. Solicita uno nuevo.');
            setValidating(false);
            return;
        }

        fetch(`${API_URL}/auth/validate-reset-token/${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setTokenValid(true);
                } else {
                    setError(data.message || 'El enlace es inválido o ha expirado.');
                }
            })
            .catch(() => setError('No se pudo verificar el enlace. Intenta más tarde.'))
            .finally(() => setValidating(false));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (data.success) {
                // Guardar token en localStorage para loguear automáticamente
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                setSuccess(true);
                // Redirigir al perfil tras 2.5 segundos
                setTimeout(() => navigate('/profile', { replace: true }), 2500);
            } else {
                setError(data.message || 'Ocurrió un error. Solicita un nuevo enlace.');
            }
        } catch {
            setError('No se pudo conectar con el servidor. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // ── Pantalla de carga mientras se valida el token ──
    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-burgundy" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-plum/60 font-inter text-sm">Verificando enlace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream to-rose/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="absolute top-0 left-0 w-full h-64 bg-burgundy/5 -z-10" />

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gold/20">

                    {/* ── Token inválido ── */}
                    {!tokenValid && !success && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            </div>
                            <h3 className="font-amandine text-3xl text-burgundy mb-3">Enlace inválido</h3>
                            <p className="text-plum/70 text-sm font-inter leading-relaxed mb-6">{error}</p>
                            <Link
                                to="/forgot-password"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy-light text-white text-sm font-medium rounded-xl hover:from-burgundy-dark hover:to-burgundy transition-all duration-200 shadow-lg font-inter"
                            >
                                Solicitar nuevo enlace
                            </Link>
                        </div>
                    )}

                    {/* ── Éxito ── */}
                    {success && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="font-amandine text-3xl text-burgundy mb-3">¡Contraseña actualizada!</h3>
                            <p className="text-plum/70 text-sm font-inter">Redirigiendo a tu perfil...</p>
                        </div>
                    )}

                    {/* ── Formulario ── */}
                    {tokenValid && !success && (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="font-amandine text-4xl md:text-5xl text-burgundy mb-3 tracking-tight">
                                    Nueva contraseña
                                </h2>
                                <p className="text-plum/70 text-sm font-inter">
                                    Elige una contraseña segura para tu cuenta.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm flex items-start gap-3 font-inter">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                            Nueva contraseña
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200 font-inter"
                                            placeholder="Mínimo 6 caracteres"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-plum/80 mb-1.5 font-inter">
                                            Confirmar contraseña
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            className={`w-full px-5 py-3.5 bg-gray-50 border rounded-xl text-plum placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition-all duration-200 font-inter ${
                                                confirm && confirm !== password
                                                    ? 'border-red-300 focus:border-red-400'
                                                    : 'border-gray-200 focus:border-burgundy'
                                            }`}
                                            placeholder="Repite tu contraseña"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            disabled={loading}
                                        />
                                        {confirm && confirm !== password && (
                                            <p className="text-red-500 text-xs mt-1 font-inter">Las contraseñas no coinciden</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (!!confirm && confirm !== password)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-burgundy to-burgundy-light text-white text-base font-medium rounded-xl hover:from-burgundy-dark hover:to-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-inter"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        'Guardar nueva contraseña'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
};