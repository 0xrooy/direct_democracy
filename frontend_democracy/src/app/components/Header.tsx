'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const navItems = [
    { name: 'About', href: '/home' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Login', href: '/login' }
  ];

  return (
    <header className="w-full px-6 py-3 bg-zinc-900 border-b border-zinc-800 text-white font-mono shadow-md z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/home" className="text-2xl font-bold text-green-400 tracking-wide hover:text-cyan-400 transition-colors">
          ⌘ Direct Democracy
        </Link>

        <nav className="flex gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2 py-1 rounded hover:bg-zinc-800 transition ${
                pathname === item.href ? 'text-cyan-300 underline underline-offset-4' : 'text-zinc-300'
              }`}
            >
              {item.name}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="px-2 py-1 rounded text-red-400 hover:text-red-300 hover:bg-zinc-800 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
