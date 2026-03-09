import React, { useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../App';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';

function Landing() {
    const observerRef = useRef(null);
    const containerRef = useRef(null);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);

    // Setup Lenis for smooth scrolling
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    // Hook into the scroll position of the hero container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Map scroll progress (0 to 1) to visual properties

    // Map scroll progress for the images
    const centerScale = useTransform(scrollYProgress, [0, 1], [1, 0.45]);
    const centerRadius = useTransform(scrollYProgress, [0, 1], ["0px", "32px"]);

    // Inner Grid
    const innerImagesY = useTransform(scrollYProgress, [0, 1], ["-15vh", "0vh"]);
    const innerImagesYDown = useTransform(scrollYProgress, [0, 1], ["15vh", "0vh"]);
    const innerImagesXLeft = useTransform(scrollYProgress, [0, 1], ["-10vw", "0vw"]);
    const innerImagesXRight = useTransform(scrollYProgress, [0, 1], ["10vw", "0vw"]);

    // Outer Grid
    const outerImagesY = useTransform(scrollYProgress, [0, 1], ["-35vh", "0vh"]);
    const outerImagesYDown = useTransform(scrollYProgress, [0, 1], ["35vh", "0vh"]);
    const outerImagesXLeft = useTransform(scrollYProgress, [0, 1], ["-25vw", "0vw"]);
    const outerImagesXRight = useTransform(scrollYProgress, [0, 1], ["25vw", "0vw"]);

    const gridOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                }
            });
        }, { threshold: 0.1 });

        const hiddenElements = document.querySelectorAll('.animate-on-scroll');
        hiddenElements.forEach((el) => observerRef.current.observe(el));

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-x-hidden text-slate-900 dark:text-white font-sans">
            {/* Immersive Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-black"></div>

            {/* Animated Glowing Orbs */}
            <div className="fixed top-0 inset-x-0 overflow-hidden pointer-events-none -z-10 h-screen w-screen flex justify-center">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full p-6 z-50 flex justify-between items-center backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        A
                    </div>
                    <span className="text-2xl font-bold tracking-tight">AidConnect</span>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-yellow-400 hover:bg-white dark:hover:bg-slate-700 transition-colors backdrop-blur-md" aria-label="Toggle Dark Mode">
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                    <button onClick={() => window.navigateTo('login')} className="px-6 py-2.5 rounded-full font-medium text-slate-800 dark:text-white bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition backdrop-blur-md border border-slate-200 dark:border-slate-700">
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section - Scroll Animation (Waabi-inspired) */}
            <section ref={containerRef} className="relative w-full h-[300vh]">
                <div className="sticky top-0 w-full h-screen pointer-events-none">

                    {/* STATIC MAIN TEXT - Pinned safely at the top */}
                    <div className="absolute top-[8%] md:top-[12%] w-full z-50 text-center px-4 pointer-events-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 shadow-sm border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md text-slate-800 dark:text-gray-300 font-medium text-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Next generation aid distribution
                        </div>
                        <p className="max-w-4xl mx-auto text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white drop-shadow-sm tracking-tight">
                            Transforming Humanitarian Relief with unprecedented transparency.
                        </p>
                    </div>

                    {/* DENSE ANIMATION GRID - Positioned lower to avoid text entirely */}
                    <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1400px] h-[70vh] flex items-center justify-center">

                        {/* Center Main Image (Nestled at z-30) */}
                        <motion.div
                            style={{
                                scale: centerScale,
                                borderRadius: centerRadius,
                                backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop')"
                            }}
                            className="absolute z-30 w-full md:w-[800px] h-[350px] md:h-[500px] bg-cover bg-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] origin-center pointer-events-auto"
                        >
                            <motion.div style={{ opacity: gridOpacity }} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[inherit] transition-colors">
                                <button onClick={() => window.navigateTo('login')} className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-bold shadow-2xl hover:bg-blue-800 hover:scale-105 transition-all text-lg ring-4 ring-blue-500/30">
                                    Launch Portal
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* --- INNER GRID (4 Images) --- */}
                        <motion.div
                            style={{ y: innerImagesY, x: innerImagesXLeft, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1593113565694-c708fa0d592c?q=80&w=800')" }}
                            className="absolute top-[2%] left-[10%] md:left-[15%] z-20 w-40 h-40 md:w-56 md:h-48 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none"
                        />
                        <motion.div
                            style={{ y: innerImagesY, x: innerImagesXRight, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=800')" }}
                            className="absolute top-[5%] right-[10%] md:right-[15%] z-40 w-48 h-32 md:w-64 md:h-40 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none"
                        />
                        <motion.div
                            style={{ y: innerImagesYDown, x: innerImagesXLeft, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800')" }}
                            className="absolute bottom-[5%] left-[8%] md:left-[20%] z-40 w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none"
                        />
                        <motion.div
                            style={{ y: innerImagesYDown, x: innerImagesXRight, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800')" }}
                            className="absolute bottom-[2%] right-[10%] md:right-[15%] z-20 w-40 h-56 md:w-48 md:h-64 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none"
                        />

                        {/* --- OUTER GRID (4 Images) --- */}
                        <motion.div
                            style={{ y: outerImagesY, x: outerImagesXLeft, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1488522363945-8ceac42db1eb?q=80&w=800')" }}
                            className="absolute top-[20%] left-[-5%] md:left-[-2%] z-10 w-32 h-40 md:w-48 md:h-64 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none hidden md:block"
                        />
                        <motion.div
                            style={{ y: outerImagesYDown, x: outerImagesXRight, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=800')" }}
                            className="absolute bottom-[25%] right-[-5%] md:right-[0%] z-20 w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none hidden md:block"
                        />
                        <motion.div
                            style={{ y: outerImagesY, x: outerImagesXRight, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1510313174249-163e7acb8dd6?q=80&w=800')" }}
                            className="absolute top-[-10%] right-[20%] md:right-[25%] z-10 w-40 h-40 md:w-56 md:h-40 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none hidden lg:block"
                        />
                        <motion.div
                            style={{ y: outerImagesYDown, x: outerImagesXLeft, opacity: gridOpacity, backgroundImage: "url('https://images.unsplash.com/photo-1481819613568-3701cbc70156?q=80&w=800')" }}
                            className="absolute bottom-[-10%] left-[20%] md:left-[30%] z-10 w-40 h-32 md:w-56 md:h-48 rounded-3xl bg-cover bg-center shadow-2xl ring-1 ring-white/10 pointer-events-none hidden lg:block"
                        />
                    </div>

                </div>
            </section>

            {/* Features Showcase */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for impact.</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Every tool you need to coordinate massive relief efforts from a single pane of glass.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            delay="100"
                            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            title="Real-time Tracking"
                            desc="Monitor deliveries instantly. Know when and where aid arrives with zero latency."
                            color="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            delay="300"
                            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                            title="Verified Beneficiaries"
                            desc="Eliminate duplicate distributions. Ensure aid reaches the uniquely identified families."
                            color="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            delay="500"
                            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            title="Data-Driven Analytics"
                            desc="Generate complex reports. Analyze distribution patterns to refine future operations."
                            color="from-amber-500 to-orange-500"
                        />
                    </div>
                </div>
            </section>

            {/* Immersive CTA */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-black rounded-3xl overflow-hidden relative shadow-2xl animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-screen"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
                    <div className="relative p-12 md:p-24 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Ready to orchestrate <br /> your next mission?</h2>
                        <button onClick={() => window.navigateTo('login')} className="px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            Launch Portal
                        </button>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} AidConnect Systems. Driving compassion with technology.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color, delay }) {
    return (
        <div className={`bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform animate-on-scroll opacity-0 translate-y-10 duration-1000 ease-out`} style={{ transitionDelay: `${delay}ms` }}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}

export default Landing;
