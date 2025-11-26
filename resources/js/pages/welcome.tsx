import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Sparkles, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'Secure',
            description: 'Enterprise-grade security for your event data',
        },
        {
            icon: Zap,
            title: 'Fast',
            description: 'Real-time event processing and analytics',
        },
        {
            icon: BarChart3,
            title: 'Insights',
            description: 'Powerful analytics and reporting tools',
        },
    ];

    return (
        <>
            <Head title="EventVault - Admin Portal" />
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
                {/* Animated gradient background */}
                <div
                    className="absolute inset-0 opacity-30 dark:opacity-20"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, oklch(0.65 0.22 280 / 0.3), transparent 50%)`,
                        transition: 'background 0.3s ease-out',
                    }}
                />
                
                {/* Gradient orbs */}
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Content */}
                <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
                    <div className="w-full max-w-4xl space-y-12">
                        {/* Header */}
                        <div className="space-y-6 text-center">
                            {/* Logo/Brand */}
                            <div className="flex items-center justify-center gap-3">
                                <div className="relative">
                                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                                    <div className="absolute inset-0 h-10 w-10 animate-ping opacity-20">
                                        <Sparkles className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <h1 className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                                    EventVault
                                </h1>
                            </div>

                            {/* Tagline */}
                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                                    Event Management Admin Portal
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                    Manage your events, track devices, and analyze data with our powerful admin dashboard
                                </p>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid gap-6 sm:grid-cols-3">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={feature.title}
                                        className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="relative space-y-3">
                                            <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-card-foreground">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={login()}
                                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <span className="relative z-10">Log in</span>
                                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary transition-opacity duration-300 group-hover:opacity-0" />
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-background px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    <span>Get Started</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
        </>
    );
}
