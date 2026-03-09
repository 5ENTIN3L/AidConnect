import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../App';
import { useAuth } from '../context/AuthContext';

function NavBar({ activePage }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const { user, logout } = useAuth();

    const staffRoles = ['admin', 'staff'];
    const isStaff = staffRoles.includes(user?.role);

    let navLinks = [];
    if (isStaff) {
        navLinks = [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'beneficiaries', label: 'Beneficiaries' },
            { id: 'requests', label: 'Aid Requests' },
            { id: 'deliveries', label: 'Deliveries' },
            { id: 'reports', label: 'Reports' },
        ];
    } else {
        navLinks = [
            { id: 'dashboard', label: 'My Portal' }
        ];
    }

    const handleLogout = async () => {
        await logout();
        window.navigateTo('landing');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            if (window.scrollY <= 50) setIsMenuOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className="h-[73px] w-full shrink-0"></div>
            <nav
                className={`fixed z-[100] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${scrolled
                    ? isMenuOpen
                        ? 'top-4 left-4 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4'
                        : 'top-4 left-4 w-14 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-xl rounded-full flex items-center justify-center cursor-pointer hover:scale-105 hover:shadow-2xl'
                    : 'top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm py-4 px-6'
                    }`}
                onClick={() => {
                    if (scrolled && !isMenuOpen) setIsMenuOpen(true);
                }}
            >
                {(!scrolled || isMenuOpen) ? (
                    <div className={`flex ${scrolled ? 'flex-col gap-6' : 'items-center justify-between'}`}>
                        <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.navigateTo('landing')}>
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                                    AidConnect
                                </h1>
                            </div>

                            {/* Close button inside pill menu */}
                            {scrolled && isMenuOpen && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className={`flex ${scrolled ? 'flex-col items-start gap-4' : 'items-center gap-6'}`}>
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        window.navigateTo(link.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`relative font-medium transition-all group overflow-hidden ${scrolled ? 'w-full text-left flex px-2 py-1' : ''} ${activePage === link.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                >
                                    <span className="relative z-10">{link.label}</span>
                                    {/* Hover effect highlight */}
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out"></span>
                                    {/* Scrolled hover background */}
                                    {scrolled && (
                                        <span className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md -z-0"></span>
                                    )}
                                </button>
                            ))}

                            <div className={`flex items-center gap-3 ${scrolled ? 'mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 w-full' : ''}`}>
                                {!scrolled && (
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                )}
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                    {user?.fullName?.charAt(0)}
                                </div>
                                {scrolled && (
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                )}

                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors ml-2"
                                    aria-label="Toggle Dark Mode"
                                >
                                    {isDarkMode ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                    )}
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className={`px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition ${scrolled ? 'ml-auto text-xs px-2' : ''}`}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>
                )}
            </nav>
        </>
    );
}

export default NavBar;
