/**
 * LoadingFallback - Komponen yang ditampilkan saat lazy loading
 * 
 * Digunakan oleh React.Suspense saat komponen sedang dimuat
 */

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading page...</p>
      </div>
    </div>
  );
}

export default LoadingFallback;
