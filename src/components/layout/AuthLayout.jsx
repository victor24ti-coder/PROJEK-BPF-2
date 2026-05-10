/**
 * AuthLayout - Layout untuk halaman autentikasi (Sign In, Sign Up)
 * 
 * Layout ini tidak memiliki sidebar atau topbar,
 * hanya menampilkan konten yang dipass sebagai children
 */

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}
