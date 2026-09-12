import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#020617]">
      <div className="text-center">
        <h1 className="text-7xl font-black text-white/10">404</h1>
        <h2 className="text-2xl font-black text-white -mt-4 mb-2">Page not found</h2>
        <p className="text-white/60 text-sm mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Go home</Link>
      </div>
    </div>
  );
}
