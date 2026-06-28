import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoDisnaker from '../../assets/logodisnaker.png';

/**
 * SignInPage - Halaman Sign In dengan desain premium
 * 
 * Fitur:
 * - Layout dua panel (ilustrasi + form)
 * - Glassmorphism & gradient effects
 * - Animasi micro-interactions
 * - Error handling yang jelas untuk email & password
 * - Show/hide password toggle
 * - Loading state dengan spinner
 */

/* ─── Inline SVG Icons ────────────────────────────────────── */
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ─── Animated Background Shapes ──────────────────────────── */
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Shape 1 */}
    <div
      className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl"
      style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        top: '-10%',
        right: '-5%',
        animation: 'floatShape 8s ease-in-out infinite',
      }}
    />
    {/* Shape 2 */}
    <div
      className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl"
      style={{
        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
        bottom: '-15%',
        left: '-10%',
        animation: 'floatShape 10s ease-in-out infinite reverse',
      }}
    />
    {/* Shape 3 */}
    <div
      className="absolute w-48 h-48 rounded-full opacity-10 blur-2xl"
      style={{
        background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        top: '40%',
        left: '20%',
        animation: 'floatShape 12s ease-in-out infinite',
      }}
    />
  </div>
);

/* ─── Left Panel Illustration ─────────────────────────────── */
const LeftPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-cover bg-center bg-no-repeat"
    style={{
      // GANTI URL DI BAWAH INI DENGAN LINK FOTO ANDA
      backgroundImage: 'url("/Loginpage.png")',
    }}
  >
    {/* Overlay gelap agar teks tetap terbaca dengan jelas */}
    <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
    <FloatingShapes />

    <div className="relative z-10 px-12 text-center max-w-lg">
      {/* Logo / Brand Icon */}
      <div className="mx-auto mb-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl inline-block shadow-xl">
        <img src={logoDisnaker} alt="Logo Disnaker" className="w-48 sm:w-56 h-auto" />
      </div>

      <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
        Sistem Informasi<br />
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Ketenagakerjaan
        </span>
      </h2>

      <p className="text-slate-400 text-base xl:text-lg leading-relaxed mb-10">
        Kelola data pelatihan, pemagangan, sertifikasi, dan tenaga kerja secara terpadu dalam satu platform digital.
      </p>

      {/* Feature highlights */}
      <div className="space-y-4 text-left">
        {[
          'Manajemen data pelatihan & sertifikasi',
          'Monitoring pemagangan real-time',
          'Laporan & analitik terintegrasi',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
            <CheckCircleIcon />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom decorative gradient */}
    <div className="absolute bottom-0 left-0 right-0 h-px"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
      }}
    />
  </div>
);

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle form input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error saat user mengetik
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    // Clear submit error juga
    if (errors.submit) {
      setErrors((prev) => ({
        ...prev,
        submit: '',
      }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    return newErrors;
  };

  /**
   * Trigger shake animation
   */
  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 600);
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }

    try {
      setIsLoading(true);

      const result = await login(formData.email, formData.password);

      if (result.success) {
        switch (result.user.role) {
          case "admin":
            navigate("/");
            break;
          case "staf":
            navigate("/staf/dashboard");
            break;
          case "lpk":
            navigate("/lpk/dashboard");
            break;
          case "pencari_kerja":
            navigate("/jpk/dashboard");
            break;
          default:
            navigate("/");
            break;
        }
      } else {
        setErrors({
          submit: result.error || 'Email atau password yang Anda masukkan salah.'
        });
        triggerShake();
      }

    } catch (error) {
      setErrors({
        submit: "Terjadi kesalahan. Silakan coba lagi."
      });
      triggerShake();
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Global keyframes style */}
      <style>{`
        @keyframes floatShape {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(2deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-6px); }
          30%, 70% { transform: translateX(6px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 100px; }
        }
        .animate-shake { animation: shakeX 0.6s ease-in-out; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
      `}</style>

      <div className="min-h-screen flex bg-slate-50">
        {/* Left Panel - Illustration */}
        <LeftPanel />

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
          {/* Background subtle pattern for right panel */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div
            className={`relative z-10 w-full max-w-md ${mounted ? 'animate-slide-up' : 'opacity-0'}`}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src={logoDisnaker} alt="Logo Disnaker" className="w-48 sm:w-56 h-auto" />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Selamat Datang 👋
              </h1>
              <p className="text-slate-500 text-sm sm:text-base">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            {/* Form Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 ${shakeForm ? 'animate-shake' : ''}`}
              style={{
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 50px -12px rgba(0,0,0,0.08)',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-5" id="signin-form">

                {/* Global Error Message (submit error) */}
                {errors.submit && (
                  <div
                    className="animate-slide-down flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm"
                    role="alert"
                    id="signin-error-alert"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-red-500">
                      <AlertCircleIcon />
                    </div>
                    <div>
                      <p className="font-semibold mb-0.5">Login Gagal</p>
                      <p className="text-red-600 text-xs leading-relaxed">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none
                        ${errors.email
                          ? 'border-2 border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
                        }`}
                      placeholder="nama@email.com"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <div className="animate-slide-down flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium">
                      <AlertCircleIcon />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LockIcon />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-12 py-3 rounded-xl text-sm transition-all duration-200 outline-none
                        ${errors.password
                          ? 'border-2 border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
                        }`}
                      placeholder="Masukkan password"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      id="toggle-password-visibility"
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="animate-slide-down flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium">
                      <AlertCircleIcon />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  id="signin-submit-btn"
                  className="w-full relative overflow-hidden text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: isLoading
                      ? 'linear-gradient(135deg, #818cf8, #a78bfa)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <p className="text-center text-slate-400 text-xs mt-8">
              © 2026 Dinas Ketenagakerjaan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
