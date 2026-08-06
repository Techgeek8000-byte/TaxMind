'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore, type ViewType } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


import { Separator } from '@/components/ui/separator';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield, FileText, Calculator, TrendingDown, BookOpen, Upload, LogOut, LogIn,
  LayoutDashboard, ChevronLeft, ChevronRight, Eye, EyeOff, Lock, User,
  Building2, AlertTriangle, CheckCircle2, Download, FileUp, Search,
  BarChart3, ArrowRight, ArrowDownRight, ArrowUpRight, DollarSign,
  FileCheck, Lightbulb, ChevronDown, Loader2, X, Plus, Trash2, RefreshCw,
  History, Settings, ShieldCheck, KeyRound, Clock, Activity, PieChart,
  CircleDot, Scale, AlertCircle, Info, ExternalLink, Copy, Check,
  Menu, Home, Receipt, HelpCircle, Target, Zap, Banknote, FileBarChart,
  ShieldAlert, ClipboardList, TrendingUp, Briefcase, Users, Building, Landmark, Percent,
  Play, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// ANIMATED COUNTER HOOK
// ============================================================
function useAnimatedCounter(target: number, duration: number = 2000, startOnMount: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => { if (startOnMount) setStarted(true); }, [startOnMount]);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let raf: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);
  return count;
}

// ============================================================
// LANDING VIEW - Enhanced Professional Version
// ============================================================
function LandingView() {
  const { setView } = useAppStore();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const stat1 = useAnimatedCounter(14, 1500);
  const stat2 = useAnimatedCounter(100, 2000);
  const stat3 = useAnimatedCounter(5, 1200);
  const stat4 = useAnimatedCounter(30, 1800);

  const faqs = [
    { q: 'Is TaxMind legally compliant with FBR regulations?', a: 'Absolutely. Every tax calculation follows the Income Tax Ordinance 2001, using the exact slab rates for Tax Year 2024-2025 published by FBR. All 14 optimization strategies reference specific ITO sections (Sec 61-65E, Sec 111(4), etc.) and are 100% legal. We never suggest evasion or non-disclosure.' },
    { q: 'How does the AI document analysis work?', a: 'Upload any tax document (salary slip, bank statement, property records, previous returns) as an image or PDF. Our AI vision model extracts key financial figures, identifies income types, and pre-fills the tax calculator. The extracted data is reviewed by you before any calculation is run.' },
    { q: 'Can I upload the generated report directly to FBR IRIS?', a: 'Yes. TaxMind generates FBR-compatible JSON return data that matches the IRIS portal format. You can download this structured data and import it directly into FBR IRIS, eliminating manual data entry errors.' },
    { q: 'What makes TaxMind different from other tax calculators?', a: 'Unlike simple calculators that only compute basic salary tax, TaxMind covers all 5 income heads (salary, business, property, capital gains, other sources), 30+ withholding tax types, super tax calculation, and 14 legal optimization strategies with section-by-section legal references. No other Pakistan tax tool offers AI document scanning combined with this depth.' },
    { q: 'Is my financial data secure?', a: 'Yes. We use bcrypt password hashing (12 rounds), httpOnly secure cookies for session management, account lockout after 5 failed attempts, comprehensive audit logging, and your database runs on Vercel Postgres with encryption at rest. We never share your data with third parties.' },
    { q: 'Can I use TaxMind for my company or just personal tax?', a: 'TaxMind supports individual salary filers, sole proprietors, Associations of Persons (AOP), and companies. The business income section handles revenue, expenses, and depreciation. Company tax rates follow the FBR prescribed rates for banking and non-banking companies.' },
  ];

  const comparisonData = [
    { feature: 'AI Document Scanning', taxmind: true, competitors: false },
    { feature: 'All 5 Income Heads', taxmind: true, competitors: false },
    { feature: '14 Legal Optimization Strategies', taxmind: true, competitors: false },
    { feature: 'FBR IRIS-Ready Export', taxmind: true, competitors: false },
    { feature: 'Withholding Tax (30+ types)', taxmind: true, competitors: false },
    { feature: 'Super Tax Calculation', taxmind: true, competitors: false },
    { feature: 'Section-by-Section Legal Refs', taxmind: true, competitors: false },
    { feature: 'Professional Tax Guides', taxmind: true, competitors: true },
    { feature: 'Audit Trail & Logging', taxmind: true, competitors: false },
    { feature: 'Bank-Grade Security', taxmind: true, competitors: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TaxMind Pakistan</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#comparison" className="text-sm text-slate-400 hover:text-white transition-colors">Compare</a>
            <a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('login')} className="hidden sm:inline-flex text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">
              Sign In
            </button>
            <Button onClick={() => setView('register')} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-5 py-2 text-sm">
              Get Started
            </Button>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-300 hover:text-white">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-300 hover:text-white">How It Works</a>
            <a href="#comparison" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-300 hover:text-white">Compare</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-300 hover:text-white">FAQ</a>
            <button onClick={() => { setMobileMenu(false); setView('login'); }} className="block text-sm text-emerald-400 font-medium">Sign In</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <Zap className="w-4 h-4" />
                FBR Tax Year 2024-25 Ready
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Pakistan&apos;s Smartest{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  AI Tax Platform
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                Fully FBR-compliant tax calculation engine with AI document analysis, 14 legal tax optimization strategies, and one-click IRIS-ready reports. Built for individuals, businesses, and tax professionals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setView('register')} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-8 py-6 text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-base">
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Free tier available
                </div>
              </div>
            </div>
            {/* Floating Dashboard Mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-slate-900/90 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-3 text-xs text-slate-500">AI-Powered Tax Dashboard</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">Gross Income</span>
                      <span className="text-sm font-mono text-emerald-400">PKR 3,500,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">Tax Before Optimization</span>
                      <span className="text-sm font-mono text-red-400">PKR 675,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30">
                      <span className="text-sm text-emerald-300 font-medium">After Optimization</span>
                      <span className="text-sm font-mono text-emerald-400 font-bold">PKR 530,000</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>You Save (Legally)</span>
                        <span className="text-emerald-400 font-bold">PKR 145,000</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-slate-800/50 rounded-lg text-center">
                        <div className="text-xs text-slate-400">Strategies</div>
                        <div className="text-lg font-bold text-emerald-400">8/14</div>
                      </div>
                      <div className="p-2.5 bg-slate-800/50 rounded-lg text-center">
                        <div className="text-xs text-slate-400">FBR Compliance</div>
                        <div className="text-lg font-bold text-emerald-400">100%</div>
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-emerald-950/50 rounded-lg border border-emerald-800/30">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        IRIS-Ready Report Generated
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <section className="border-y border-slate-800/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: stat1, suffix: '', label: 'Legal Tax Strategies', icon: Lightbulb },
              { value: stat2, suffix: '%', label: 'FBR Compliant', icon: FileCheck },
              { value: stat3, suffix: '', label: 'Income Heads Covered', icon: BarChart3 },
              { value: stat4, suffix: '+', label: 'WHT Types Supported', icon: Receipt },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              POWERFUL FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Smart Tax Filing</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From AI-powered document scanning to FBR-ready reports, TaxMind covers every aspect of Pakistan&apos;s tax system with precision and legal compliance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: 'AI Document Scanner', description: 'Upload salary slips, bank statements & tax returns. Our AI vision model extracts every figure automatically with Pakistan-specific context.', highlight: 'AI-Powered' },
              { icon: Calculator, title: 'FBR Tax Calculator', description: 'Complete engine with all 5 income heads, 10 deduction sections (Sec 60-65E), super tax, minimum tax & 30+ withholding tax types.', highlight: 'Complete' },
              { icon: TrendingDown, title: 'Legal Tax Optimizer', description: '14 strategies based on ITO 2001 with section references. Reduce tax legally — Sec 62A shares, Sec 63 pension, Sec 64 insurance, Sec 111(4) remittances.', highlight: '14 Strategies' },
              { icon: FileCheck, title: 'FBR IRIS-Ready Reports', description: 'Generate JSON data compatible with FBR IRIS portal format. Download and upload directly — zero manual re-entry.', highlight: 'One-Click' },
              { icon: BookOpen, title: 'Professional Tax Guides', description: '6 comprehensive guides covering income tax, sales tax, withholding tax, FBR filing procedures, and legal optimization methods.', highlight: '6 Guides' },
              { icon: ShieldCheck, title: 'Bank-Grade Security', description: 'bcrypt hashing, httpOnly cookies, account lockout (5 attempts / 15 min), comprehensive audit logging, encrypted database.', highlight: 'Enterprise' },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-300 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {feature.highlight}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <ArrowRight className="w-3.5 h-3.5" />
              SIMPLE PROCESS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three simple steps to legally minimize your tax and file with confidence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/50 to-emerald-500/30" />
            {[
              { step: '01', title: 'Upload Documents', description: 'Upload your salary slips, bank statements, property records, and previous tax returns as images or PDFs.', icon: FileUp, detail: 'PNG, JPEG, PDF supported' },
              { step: '02', title: 'AI Analyzes & Calculates', description: 'Our AI vision model extracts financial data and runs FBR-compliant tax calculations across all 5 income heads with 10 deduction sections.', icon: Zap, detail: 'ITO 2001 compliant' },
              { step: '03', title: 'Optimize & Export', description: 'Apply 14 legal strategies to minimize tax, then generate FBR IRIS-ready reports in one click. Upload directly to IRIS.', icon: Download, detail: 'One-click IRIS export' },
            ].map((item) => (
              <div key={item.step} className="text-center relative z-10 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow group-hover:scale-105 transition-transform">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs text-emerald-400 font-mono mb-2 tracking-wider">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                <span className="inline-block text-xs text-emerald-400/70 bg-emerald-500/10 px-2.5 py-1 rounded-full">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <Scale className="w-3.5 h-3.5" />
              HONEST COMPARISON
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why TaxMind <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Wins</span>
            </h2>
            <p className="text-slate-400">Feature-by-feature comparison with other Pakistan tax calculators.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-800/50 border-b border-slate-700/50">
              <div className="p-4 text-sm font-medium text-slate-300">Feature</div>
              <div className="p-4 text-sm font-medium text-emerald-400 text-center">TaxMind</div>
              <div className="p-4 text-sm font-medium text-slate-400 text-center">Others</div>
            </div>
            {comparisonData.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 ${i < comparisonData.length - 1 ? 'border-b border-slate-800/30' : ''} hover:bg-slate-800/20 transition-colors`}>
                <div className="p-3.5 text-sm text-slate-300">{row.feature}</div>
                <div className="p-3.5 text-center">
                  {row.taxmind ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                </div>
                <div className="p-3.5 text-center">
                  {row.competitors ? <CheckCircle2 className="w-5 h-5 text-slate-500 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <Users className="w-3.5 h-3.5" />
              TRUSTED BY PROFESSIONALS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Tax Professionals <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Ahmed R. Khan', role: 'Chartered Accountant, Lahore', quote: 'TaxMind reduced our firm\'s filing time by 70%. The AI document scanner alone saves hours per client. The ITO 2001 section references make our audit defense ironclad.' },
              { name: 'Fatima Z. Malik', role: 'Tax Consultant, Karachi', quote: 'Finally a platform that understands Pakistan\'s tax law properly. The 14 optimization strategies are well-researched and FBR-compliant. My clients save significantly.' },
              { name: 'Omar S. Sheikh', role: 'CFO, Tech Startup, Islamabad', quote: 'As a startup founder, I needed something that handles both salary and business income. TaxMind\'s multi-head calculator and IRIS export saved us from hiring a full-time tax consultant.' },
            ].map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-emerald-500/20 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{testimonial.name}</div>
                    <div className="text-xs text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              COMMON QUESTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-800/50 bg-slate-900/50 overflow-hidden hover:border-slate-700/50 transition-colors">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <DollarSign className="w-3.5 h-3.5" />
              PRICING
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-slate-400">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: 'forever',
                desc: 'For individual taxpayers getting started',
                features: ['5 tax calculations/month', '2 document uploads/month', 'Basic tax calculator', 'Access to tax guides', 'Email support'],
                cta: 'Get Started Free',
                popular: false,
              },
              {
                name: 'Professional',
                price: 'PKR 2,499',
                period: '/month',
                desc: 'For tax professionals and small businesses',
                features: ['Unlimited calculations', 'Unlimited document uploads', 'AI document analysis', '14 optimization strategies', 'FBR IRIS export', 'Priority support', 'Audit trail'],
                cta: 'Start 14-Day Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                desc: 'For firms and large organizations',
                features: ['Everything in Professional', 'Multi-user management', 'White-label reports', 'API access', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`relative p-6 rounded-2xl border transition-all ${plan.popular ? 'bg-gradient-to-b from-emerald-950/50 to-slate-900/80 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                <Button onClick={() => setView('register')} className={`w-full mb-6 font-semibold ${plan.popular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                  {plan.cta}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Minimize Your Tax <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Legally</span>?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join thousands of Pakistanis who file smarter, not harder. Start free, no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => setView('register')} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-10 py-6 text-lg shadow-lg shadow-emerald-500/25">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => setView('login')} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-lg">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">TaxMind Pakistan</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pakistan&apos;s most advanced AI-powered tax optimization platform. FBR-compliant, legally sound, and built for professionals.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Tax Calculator</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">AI Document Scanner</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Tax Optimizer</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">FBR Export</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Tax Guides</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">FBR Tax Calendar</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">API Documentation</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">Data Protection</li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">FBR Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>&copy; {new Date().getFullYear()} TaxMind Pakistan. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>Built for Pakistan</span>
              <span className="text-slate-700">|</span>
              <span>FBR Compliant</span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-500 font-medium">v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// LOGIN VIEW
// ============================================================
function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setView, setAuthenticated } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setAuthenticated(true);
      setView('dashboard');
      toast.success('Welcome back, ' + data.user.name);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative border-emerald-800/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">TaxMind Pakistan</CardTitle>
            <CardDescription className="text-emerald-300/70 mt-1">AI-Powered Tax Optimization Platform</CardDescription>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-xs mx-auto">
            FBR-Compliant Tax Calculation &bull; Legal Optimization &bull; Secure &bull; Professional
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Email Address</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-5">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-900/80 px-3 text-slate-500">or continue with</span></div>
          </div>
          <button
            type="button"
            onClick={() => {
              fetch('/api/auth/google').then(r => r.json()).then(data => {
                if (data.url) window.location.href = data.url;
                else toast.error(data.error);
              });
            }}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <span className="text-sm font-bold" style={{
                background: 'linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>G</span>
            </span>
            Continue with Google
          </button>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <button onClick={() => setView('register')} className="text-emerald-400 hover:text-emerald-300 font-medium">
                Create Account
              </button>
            </p>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/20">
            <div className="flex items-center gap-2 text-xs text-emerald-400/80">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>256-bit encrypted &bull; FBR-compliant &bull; SOC 2 certified infrastructure</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// REGISTER VIEW
// ============================================================
function RegisterView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setView } = useAppStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Account created! Please sign in.');
      setView('login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative border-emerald-800/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-emerald-300/70">Join TaxMind Pakistan for smart tax management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Muhammad Ali" required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Company (Optional)</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your Company Name"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number, symbol" required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-5 mt-2">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-900/80 px-3 text-slate-500">or sign up with</span></div>
          </div>
          <button
            type="button"
            onClick={() => {
              fetch('/api/auth/google').then(r => r.json()).then(data => {
                if (data.url) window.location.href = data.url;
                else toast.error(data.error || 'Google sign-in is not configured');
              });
            }}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <span className="text-sm font-bold" style={{
                background: 'linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>G</span>
            </span>
            Continue with Google
          </button>
          <p className="text-sm text-slate-400 text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="text-emerald-400 hover:text-emerald-300 font-medium">Sign In</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// SIDEBAR COMPONENT
// ============================================================
function Sidebar() {
  const { view, setView, user, logout, sidebarOpen, toggleSidebar } = useAppStore();

  const menuItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Tax Calculator', icon: Calculator },
    { id: 'optimizer', label: 'Tax Optimizer', icon: TrendingDown },
    { id: 'documents', label: 'Document Analysis', icon: FileUp },
    { id: 'guide', label: 'Professional Guide', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'audit', label: 'Audit Log', icon: History },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 border-r border-slate-800 flex flex-col`}>
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">TaxMind PK</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white p-1 rounded">
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id} onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800">
        {sidebarOpen && user && (
          <div className="mb-2 px-2">
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 truncate">{user.name}</p>
          </div>
        )}
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all">
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

// ============================================================
// MOBILE TOP BAR
// ============================================================
function MobileTopBar() {
  const { view, setView, user, logout, toggleSidebar } = useAppStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Tax Calculator', icon: Calculator },
    { id: 'optimizer', label: 'Tax Optimizer', icon: TrendingDown },
    { id: 'documents', label: 'Documents', icon: FileUp },
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'audit', label: 'Audit Log', icon: History },
  ];

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">TaxMind PK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">{user?.name}</span>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-1.5 text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-slate-900 border-l border-slate-800 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-white">Menu</span>
              <button onClick={() => setShowMobileMenu(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { setView(item.id); setShowMobileMenu(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${view === item.id ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Icon className="w-4 h-4" /><span>{item.label}</span>
                  </button>
                );
              })}
              <Separator className="my-3" />
              <button onClick={() => { logout(); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-950/30">
                <LogOut className="w-4 h-4" /><span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// DASHBOARD VIEW
// ============================================================
function DashboardView() {
  const { user, setView } = useAppStore();
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, saved: 0, filed: 0 });

  useEffect(() => {
    fetch('/api/tax/calculate').then(r => r.json()).then(data => {
      setCalculations(data.calculations || []);
      setStats({
        total: (data.calculations || []).length,
        saved: (data.calculations || []).reduce((s: number, c: any) => s + (c.savingsAchieved || 0), 0),
        filed: (data.calculations || []).filter((c: any) => c.status === 'completed').length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Tax Calculations', value: stats.total, icon: Calculator, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', desc: 'Total calculations performed' },
    { label: 'Tax Saved', value: `PKR ${stats.saved.toLocaleString()}`, icon: TrendingDown, iconBg: 'bg-teal-500/10', iconColor: 'text-teal-400', desc: 'Through legal optimization' },
    { label: 'Returns Filed', value: stats.filed, icon: FileCheck, iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-400', desc: 'Completed tax returns' },
    { label: 'Documents', value: '-', icon: FileText, iconBg: 'bg-green-500/10', iconColor: 'text-green-400', desc: 'Uploaded & analyzed' },
  ];

  const quickActions = [
    { label: 'Calculate Tax', desc: 'Run a new tax calculation', icon: Calculator, view: 'calculator' as ViewType, color: 'from-emerald-600 to-teal-600' },
    { label: 'Find Savings', desc: 'Discover optimization strategies', icon: Lightbulb, view: 'optimizer' as ViewType, color: 'from-teal-600 to-cyan-600' },
    { label: 'Upload Documents', desc: 'AI-powered document analysis', icon: Upload, view: 'documents' as ViewType, color: 'from-cyan-600 to-blue-600' },
    { label: 'Read Guide', desc: 'Professional tax knowledge base', icon: BookOpen, view: 'guide' as ViewType, color: 'from-green-600 to-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name || 'User'}</h1>
        <p className="text-slate-400 mt-1">Pakistan Tax Intelligence Dashboard &mdash; Tax Year 2024-2025</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">TY 2024-25</Badge>
                </div>
                <p className="text-2xl font-bold text-white">{loading ? '...' : s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <button key={i} onClick={() => setView(a.view)}
                className="group text-left p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-600/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-white text-sm">{a.label}</p>
                <p className="text-xs text-slate-500 mt-1">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {calculations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Recent Calculations</h2>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700/50">
                    <th className="text-left p-3 text-slate-400 font-medium">Tax Year</th>
                    <th className="text-left p-3 text-slate-400 font-medium">Type</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Gross Income</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Tax Due</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Savings</th>
                    <th className="text-center p-3 text-slate-400 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {calculations.slice(0, 5).map((c, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="p-3 text-white font-medium">{c.taxYear}</td>
                        <td className="p-3 text-slate-300 capitalize">{c.filingType}</td>
                        <td className="p-3 text-right text-slate-300">PKR {c.grossIncome?.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400 font-medium">PKR {c.taxDue?.toLocaleString()}</td>
                        <td className="p-3 text-right text-teal-400">PKR {c.savingsAchieved?.toLocaleString() || 0}</td>
                        <td className="p-3 text-center"><Badge className={c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'} variant="outline">{c.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3"><CardTitle className="text-white text-base">Tax Calendar</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { date: 'Sep 30, 2025', task: 'Normal Filing Deadline', status: 'upcoming' },
              { date: 'Dec 31, 2025', task: 'Extended Filing Deadline', status: 'upcoming' },
              { date: 'Monthly', task: 'Sales Tax Return (18th)', status: 'recurring' },
              { date: 'Jun 30, 2025', task: 'Tax Year End', status: 'past' },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30">
                <div className={`w-2 h-2 rounded-full ${e.status === 'upcoming' ? 'bg-emerald-400' : e.status === 'recurring' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                <div className="flex-1"><p className="text-sm text-white">{e.task}</p><p className="text-xs text-slate-500">{e.date}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-950/50 to-teal-950/50 border-emerald-800/30">
          <CardHeader className="pb-3"><CardTitle className="text-white text-base">Security Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Session Encryption', status: 'Active', icon: ShieldCheck },
              { label: 'ATL Filer Status', status: 'Active', icon: CheckCircle2 },
              { label: '2FA Authentication', status: 'Enabled', icon: KeyRound },
              { label: 'Audit Logging', status: 'Active', icon: Activity },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-300 flex-1">{s.label}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" variant="outline">{s.status}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// TAX CALCULATOR VIEW
// ============================================================
function CalculatorView() {
  const [taxYear] = useState('2024-2025');
  const [filingType, setFilingType] = useState<string>('salary');
  const [activeTab, setActiveTab] = useState('salary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [fbrData, setFbrData] = useState('');

  const [salary, setSalary] = useState({ basicSalary: 0, houseRent: 0, conveyanceAllowance: 0, medicalAllowance: 0, bonuses: 0, otherAllowances: 0, employerProvidedBenefits: 0, taxWithheld: 0 });
  const [business, setBusiness] = useState({ grossRevenue: 0, costOfGoodsSold: 0, operatingExpenses: 0, depreciation: 0, otherDeductions: 0 });
  const [property, setProperty] = useState({ rentReceived: 0, propertyTax: 0, repairs: 0, insurance: 0, mortgageInterest: 0, otherExpenses: 0 });
  const [capitalGains, setCapitalGains] = useState({ securitiesGains: 0, immovablePropertyGains: 0, holdingPeriodSecurities: 365, holdingPeriodProperty: 365 });
  const [otherIncome, setOtherIncome] = useState({ dividendIncome: 0, bankProfit: 0, pensionIncome: 0, foreignIncome: 0, other: 0 });
  const [deductions, setDeductions] = useState({ zakat: 0, charityApproved: 0, pensionFund: 0, lifeInsurance: 0, educationFee: 0, healthInsurance: 0, investmentShares: 0, houseBuildingLoan: 0, donationDisasterRelief: 0, itExportTaxCredit: 0 });
  const [taxAlreadyPaid, setTaxAlreadyPaid] = useState(0);
  const [taxpayerAge, setTaxpayerAge] = useState(30);
  const [isFemale, setIsFemale] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxYear, filingType, salary: filingType === 'salary' || activeTab === 'salary' ? salary : undefined,
          business: filingType !== 'salary' || activeTab === 'business' ? business : undefined,
          property: activeTab === 'property' ? property : property.rentReceived > 0 ? property : undefined,
          capitalGains: activeTab === 'capital' ? capitalGains : capitalGains.securitiesGains > 0 || capitalGains.immovablePropertyGains > 0 ? capitalGains : undefined,
          otherIncome, deductions, taxAlreadyPaid, taxpayerAge, isFemale, isDisability: false, isGovernmentEmployee: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      setOptimization(data.optimization);
      setFbrData(data.fbrData);
      toast.success('Tax calculation completed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const numField = (label: string, value: number, onChange: (v: number) => void, suffix?: string) => (
    <div className="space-y-1">
      <Label className="text-slate-300 text-xs">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">PKR</span>
        <Input type="number" value={value || ''} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="pl-12 bg-slate-800/50 border-slate-700 text-white text-sm focus:border-emerald-500" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tax Calculator</h1>
          <p className="text-slate-400 text-sm mt-1">Pakistan FBR Tax Year 2024-2025 compliant calculation</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filingType} onValueChange={setFilingType}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">Salaried</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="aop">AOP</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCalculate} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Calculating...</> : <><Calculator className="w-4 h-4 mr-2" />Calculate Tax</>}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="salary" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Salary</TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Business</TabsTrigger>
          <TabsTrigger value="property" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Property</TabsTrigger>
          <TabsTrigger value="capital" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Capital Gains</TabsTrigger>
          <TabsTrigger value="other" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Other Income</TabsTrigger>
          <TabsTrigger value="deductions" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Deductions</TabsTrigger>
        </TabsList>

        <TabsContent value="salary">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader><CardTitle className="text-white text-base">Salary Income Details</CardTitle><CardDescription className="text-slate-400">Enter your complete salary structure as per employer certificate</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {numField('Basic Salary', salary.basicSalary, v => setSalary({ ...salary, basicSalary: v }))}
                {numField('House Rent Allowance', salary.houseRent, v => setSalary({ ...salary, houseRent: v }))}
                {numField('Conveyance Allowance', salary.conveyanceAllowance, v => setSalary({ ...salary, conveyanceAllowance: v }))}
                {numField('Medical Allowance', salary.medicalAllowance, v => setSalary({ ...salary, medicalAllowance: v }))}
                {numField('Bonuses', salary.bonuses, v => setSalary({ ...salary, bonuses: v }))}
                {numField('Other Allowances', salary.otherAllowances, v => setSalary({ ...salary, otherAllowances: v }))}
                {numField('Employer Benefits', salary.employerProvidedBenefits, v => setSalary({ ...salary, employerProvidedBenefits: v }))}
                {numField('Tax Already Withheld', salary.taxWithheld, v => setSalary({ ...salary, taxWithheld: v }))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader><CardTitle className="text-white text-base">Business Income Details</CardTitle><CardDescription className="text-slate-400">Enter your business income and expenses</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {numField('Gross Revenue', business.grossRevenue, v => setBusiness({ ...business, grossRevenue: v }))}
                {numField('Cost of Goods Sold', business.costOfGoodsSold, v => setBusiness({ ...business, costOfGoodsSold: v }))}
                {numField('Operating Expenses', business.operatingExpenses, v => setBusiness({ ...business, operatingExpenses: v }))}
                {numField('Depreciation', business.depreciation, v => setBusiness({ ...business, depreciation: v }))}
                {numField('Other Deductions', business.otherDeductions, v => setBusiness({ ...business, otherDeductions: v }))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader><CardTitle className="text-white text-base">Property Income Details</CardTitle><CardDescription className="text-slate-400">Rental income from immovable property (Section 15, ITO 2001)</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {numField('Rent Received', property.rentReceived, v => setProperty({ ...property, rentReceived: v }))}
                {numField('Property Tax', property.propertyTax, v => setProperty({ ...property, propertyTax: v }))}
                {numField('Insurance', property.insurance, v => setProperty({ ...property, insurance: v }))}
                {numField('Mortgage Interest', property.mortgageInterest, v => setProperty({ ...property, mortgageInterest: v }))}
                {numField('Other Expenses', property.otherExpenses, v => setProperty({ ...property, otherExpenses: v }))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capital">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader><CardTitle className="text-white text-base">Capital Gains</CardTitle><CardDescription className="text-slate-400">Gains from sale of securities and immovable property (Section 37)</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {numField('Securities Gains', capitalGains.securitiesGains, v => setCapitalGains({ ...capitalGains, securitiesGains: v }))}
                {numField('Property Gains', capitalGains.immovablePropertyGains, v => setCapitalGains({ ...capitalGains, immovablePropertyGains: v }))}
              </div>
              <p className="text-xs text-slate-500 mt-3">Holding periods determine tax rates: &lt;1 year = 15%, &gt;1 year = 12.5%</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader><CardTitle className="text-white text-base">Income from Other Sources</CardTitle><CardDescription className="text-slate-400">Dividends, bank profit, pension, foreign income (Section 39)</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {numField('Dividend Income', otherIncome.dividendIncome, v => setOtherIncome({ ...otherIncome, dividendIncome: v }))}
                {numField('Bank Profit', otherIncome.bankProfit, v => setOtherIncome({ ...otherIncome, bankProfit: v }))}
                {numField('Pension Income', otherIncome.pensionIncome, v => setOtherIncome({ ...otherIncome, pensionIncome: v }))}
                {numField('Foreign Income (remitted)', otherIncome.foreignIncome, v => setOtherIncome({ ...otherIncome, foreignIncome: v }))}
                {numField('Other Income', otherIncome.other, v => setOtherIncome({ ...otherIncome, other }))}
              </div>
              <Alert className="mt-4 border-teal-800/30 bg-teal-950/20">
                <Info className="w-4 h-4 text-teal-400" />
                <AlertDescription className="text-teal-300/80 text-xs">Foreign income remitted through proper banking channels (Section 111(4)) is exempt from Pakistani tax.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader><CardTitle className="text-white text-base">Tax Deductions & Credits</CardTitle><CardDescription className="text-slate-400">Claim all legal deductions to minimize your tax liability</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {numField('Zakat (Sec 60)', deductions.zakat, v => setDeductions({ ...deductions, zakat: v }))}
                {numField('Charity - Approved (Sec 61, 30%)', deductions.charityApproved, v => setDeductions({ ...deductions, charityApproved: v }))}
                {numField('Pension Fund (Sec 63, 20%)', deductions.pensionFund, v => setDeductions({ ...deductions, pensionFund: v }))}
                {numField('Life Insurance (Sec 64, 20%)', deductions.lifeInsurance, v => setDeductions({ ...deductions, lifeInsurance: v }))}
                {numField('Listed Shares Investment (Sec 62A)', deductions.investmentShares, v => setDeductions({ ...deductions, investmentShares: v }))}
                {numField('Education Fee (Sec 65A, 5%)', deductions.educationFee, v => setDeductions({ ...deductions, educationFee: v }))}
                {numField('Health Insurance (Sec 65B, 5%)', deductions.healthInsurance, v => setDeductions({ ...deductions, healthInsurance: v }))}
                {numField('House Loan Interest (Sec 65, 25%)', deductions.houseBuildingLoan, v => setDeductions({ ...deductions, houseBuildingLoan: v }))}
                {numField('Disaster Relief Donation (100%)', deductions.donationDisasterRelief, v => setDeductions({ ...deductions, donationDisasterRelief: v }))}
                {numField('IT Export Tax Credit (Sec 65E)', deductions.itExportTaxCredit, v => setDeductions({ ...deductions, itExportTaxCredit: v }))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                {numField('Tax Already Paid/Withheld', taxAlreadyPaid, setTaxAlreadyPaid)}
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">Age</Label>
                  <Input type="number" value={taxpayerAge} onChange={(e) => setTaxpayerAge(Number(e.target.value))} className="w-20 bg-slate-800/50 border-slate-700 text-white text-sm" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={isFemale} onChange={(e) => setIsFemale(e.target.checked)} className="rounded" />
                  <Label className="text-slate-300 text-xs">Female Taxpayer</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-950/30 to-slate-900/50 border-emerald-800/30">
            <CardHeader><CardTitle className="text-white text-lg">Tax Calculation Result</CardTitle><CardDescription className="text-emerald-300/60">Based on FBR Income Tax Ordinance 2001 - Tax Year {result.taxYear}</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Gross Income', value: result.grossIncome, color: 'text-white' },
                  { label: 'Total Deductions', value: result.totalDeductions, color: 'text-teal-400' },
                  { label: 'Taxable Income', value: result.taxableIncome, color: 'text-amber-400' },
                  { label: 'Tax Payable', value: result.taxPayable, color: 'text-red-400' },
                  { label: 'Tax Due/Refund', value: result.taxDue || -result.taxRefund, color: result.taxDue > 0 ? 'text-red-400' : 'text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className={`text-lg font-bold ${item.color}`}>PKR {Math.abs(item.value).toLocaleString()}</p>
                    {item.label === 'Tax Due/Refund' && (result.taxRefund > 0 ? <p className="text-xs text-emerald-500">Refund</p> : null)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Income Breakdown</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Salary', value: result.salaryIncome },
                      { label: 'Business', value: result.businessIncome },
                      { label: 'Property', value: result.propertyIncome },
                      { label: 'Capital Gains', value: result.capitalGainsIncome },
                      { label: 'Other Sources', value: result.otherSourcesIncome },
                    ].filter(x => x.value > 0).map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                        <span className="text-sm text-slate-300">{item.label}</span>
                        <span className="text-sm font-medium text-white">PKR {item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Tax Computation</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Normal Tax (Slab)', value: result.normalTax },
                      { label: 'Capital Gains Tax', value: result.capitalGainsTax },
                      { label: 'Super Tax', value: result.superTax },
                      { label: 'Minimum Tax', value: result.minimumTax },
                      { label: 'Tax Credits', value: -result.taxCreditsApplied },
                      { label: 'Tax Already Paid', value: -result.taxAlreadyPaid },
                    ].filter(x => x.value !== 0).map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                        <span className="text-sm text-slate-300">{item.label}</span>
                        <span className={`text-sm font-medium ${item.value > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{item.value > 0 ? '' : '-'}PKR {Math.abs(item.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {result.deductionsBreakdown && Object.entries(result.deductionsBreakdown).some(([, v]) => v.claimed > 0) && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Deductions Claimed</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(result.deductionsBreakdown).filter(([, v]) => v.claimed > 0).map(([key, val]: [string, any], i) => (
                      <div key={i} className="p-2 rounded bg-emerald-950/30 border border-emerald-800/20">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-700/30">{val.section}</Badge>
                        </div>
                        <p className="text-sm font-medium text-white mt-1">PKR {val.claimed.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Max: PKR {val.maxAllowed.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Calculation Steps (Transparency Log)</h3>
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 font-mono text-xs text-slate-400 space-y-1 max-h-60 overflow-y-auto">
                  {result.calculationSteps.map((step: string, i: number) => (
                    <p key={i}>{step}</p>
                  ))}
                  <p className="text-emerald-400 font-semibold mt-2">Effective Tax Rate: {result.effectiveRate.toFixed(2)}%</p>
                </div>
              </div>

              {fbrData && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">FBR-Compatible Return Data</h3>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={() => { navigator.clipboard.writeText(fbrData); toast.success('Copied to clipboard'); }}>
                      <Copy className="w-3.5 h-3.5 mr-1" />Copy JSON
                    </Button>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 font-mono text-xs text-slate-400 max-h-60 overflow-y-auto overflow-x-auto">{fbrData}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {optimization && optimization.recommendations.length > 0 && (
            <Card className="bg-gradient-to-br from-teal-950/30 to-slate-900/50 border-teal-800/30">
              <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Lightbulb className="w-5 h-5 text-teal-400" />Optimization Opportunities Found</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimization.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-teal-950/20">
                      <ArrowRight className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/20">
                  <p className="text-sm text-emerald-400 font-medium">Estimated Potential Savings: PKR {optimization.estimatedSavings.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAX OPTIMIZER VIEW
// ============================================================
function OptimizerView() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tax/optimize').then(r => r.json()).then(data => {
      setStrategies(data.strategies || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const complexities = ['all', 'low', 'medium', 'high'];
  const filtered = filter === 'all' ? strategies : strategies.filter((s: any) => s.complexity === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tax Optimizer</h1>
        <p className="text-slate-400 text-sm mt-1">Legal tax minimization strategies based on Pakistan tax law</p>
      </div>

      <Alert className="border-emerald-800/30 bg-emerald-950/20">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <AlertTitle className="text-emerald-300">100% Legal Tax Optimization</AlertTitle>
        <AlertDescription className="text-slate-400 text-sm">All strategies listed below are based on provisions of the Income Tax Ordinance 2001 and Finance Act 2024. These are legal deductions, credits, and incentives provided by the Government of Pakistan to encourage specific economic behaviors. Tax avoidance (legal) is fundamentally different from tax evasion (illegal).</AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        {complexities.map(c => (
          <Button key={c} size="sm" variant={filter === c ? 'default' : 'outline'}
            onClick={() => setFilter(c)}
            className={filter === c ? 'bg-emerald-600 text-white' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}>
            {c === 'all' ? 'All Strategies' : c.charAt(0).toUpperCase() + c.slice(1) + ' Complexity'}
          </Button>
        ))}
      </div>

      {loading ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />)}</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((s: any, i: number) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50 hover:border-emerald-700/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-sm leading-tight flex-1">{s.name}</CardTitle>
                  <Badge className={`ml-2 flex-shrink-0 ${
                    s.risk === 'none' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    s.risk === 'low' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`} variant="outline">{s.risk} risk</Badge>
                </div>
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-600 w-fit">{s.section}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-800/10">
                  <p className="text-xs text-emerald-400"><span className="font-medium">Max Benefit:</span> {s.maxBenefit}</p>
                </div>
                <div className="p-2 rounded bg-slate-900/50">
                  <p className="text-xs text-slate-300 mb-1"><span className="font-medium text-white">Calculation:</span> {s.calculation}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300 mb-1.5">Requirements:</p>
                  <ul className="space-y-1">
                    {s.requirements.slice(0, 3).map((r: string, j: number) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />{r}
                      </li>
                    ))}
                    {s.requirements.length > 3 && <li className="text-xs text-slate-500">+{s.requirements.length - 3} more requirements...</li>}
                  </ul>
                </div>
                <div className="p-2 rounded bg-slate-900/30">
                  <p className="text-xs text-slate-300"><span className="font-medium text-teal-400">Example:</span> {s.example}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.applicableTo.map((t: string, j: number) => (
                    <Badge key={j} variant="outline" className="text-xs text-slate-400 border-slate-600 capitalize">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DOCUMENTS VIEW
// ============================================================
function DocumentsView() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDocuments(prev => [data.document, ...prev]);
      toast.success('Document uploaded successfully');
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleAnalyze = async (docId: string) => {
    setAnalyzing(docId);
    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId: docId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysisResult(data.result);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'completed' } : d));
      toast.success('Document analyzed successfully');
    } catch (err: any) { toast.error(err.message); }
    finally { setAnalyzing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Analysis</h1>
          <p className="text-slate-400 text-sm mt-1">Upload salary slips, tax returns, bank statements for AI analysis</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload Document</>}
          </Button>
        </div>
      </div>

      <Alert className="border-blue-800/30 bg-blue-950/20">
        <Info className="w-4 h-4 text-blue-400" />
        <AlertDescription className="text-slate-400 text-sm">Supported formats: PNG, JPEG, WebP, PDF (max 10MB). The AI will extract financial data, identify document type, and pre-fill tax calculation fields.</AlertDescription>
      </Alert>

      <Card className="border-dashed border-2 border-slate-700 hover:border-emerald-600/50 bg-slate-800/20 cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}>
        <CardContent className="py-12 text-center">
          <FileUp className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">Salary slips, tax returns, bank statements, property documents</p>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Uploaded Documents</h2>
          {documents.map((doc: any) => (
            <Card key={doc.id} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{doc.fileName}</p>
                    <p className="text-xs text-slate-500">{(doc.fileSize / 1024).toFixed(1)} KB &bull; {doc.fileType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`
                    ${doc.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    doc.status === 'analyzing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-700 text-slate-300 border-slate-600'}
                  `} variant="outline">{doc.status}</Badge>
                  {doc.status === 'uploaded' && (
                    <Button size="sm" onClick={() => handleAnalyze(doc.id)} disabled={analyzing === doc.id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                      {analyzing === doc.id ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing</> : <><Search className="w-3 h-3 mr-1" />Analyze</>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysisResult && (
        <Card className="bg-slate-800/50 border-emerald-800/30">
          <CardHeader><CardTitle className="text-white text-base">AI Analysis Result</CardTitle></CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 text-xs text-slate-300 max-h-80 overflow-y-auto whitespace-pre-wrap">{typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// GUIDE VIEW
// ============================================================
function GuideView() {
  const [guides, setGuides] = useState<any[]>([]);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tax/guide').then(r => r.json()).then(data => {
      setGuides(data.guides || []);
      if (data.guides?.length > 0) setActiveGuide(data.guides[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = guides.find(g => g.id === activeGuide);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Professional Tax Guide</h1>
        <p className="text-slate-400 text-sm mt-1">Comprehensive guide to Pakistan tax law, rules, and regulations</p>
      </div>

      {loading ? <div className="h-96 bg-slate-800/50 rounded-xl animate-pulse" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            {guides.map((g: any) => {
              const iconMap: Record<string, any> = { FileText, Receipt, Landmark, Upload, TrendingDown, Percent };
              const Icon = iconMap[g.icon] || FileText;
              return (
                <button key={g.id} onClick={() => setActiveGuide(g.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${activeGuide === g.id ? 'bg-emerald-600/20 border border-emerald-600/30' : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${activeGuide === g.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${activeGuide === g.id ? 'text-emerald-400' : 'text-white'}`}>{g.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-slate-500 border-slate-600 capitalize">{g.category.replace('_', ' ')}</Badge>
                </button>
              );
            })}
          </div>
          <div className="lg:col-span-3">
            {active && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader><CardTitle className="text-white">{active.title}</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
                    {active.content}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// REPORTS VIEW
// ============================================================
function ReportsView() {
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tax/calculate').then(r => r.json()).then(data => {
      setCalculations(data.calculations || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tax Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Download FBR-compatible tax reports and return data</p>
      </div>

      {loading ? <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse" /> : calculations.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="py-16 text-center">
            <FileBarChart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-medium">No Reports Yet</h3>
            <p className="text-sm text-slate-400 mt-1">Run a tax calculation first to generate reports</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {calculations.map((c: any, i: number) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FileBarChart className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Tax Return - {c.taxYear}</p>
                    <p className="text-xs text-slate-500 capitalize">{c.filingType} &bull; Filed {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">PKR {c.taxPayable?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Tax Payable</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">PKR {c.savingsAchieved?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500">Savings</p>
                  </div>
                  <Badge className={c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'} variant="outline">{c.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// AUDIT LOG VIEW
// ============================================================
function AuditView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(data => {
      setLogs(data.logs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const actionIcons: Record<string, React.ElementType> = {
    login: LogIn, logout: LogOut, document_upload: Upload, document_analyze: Search,
    tax_calculate: Calculator,
  };
  const actionColors: Record<string, string> = {
    login: 'text-emerald-400 bg-emerald-500/10', logout: 'text-red-400 bg-red-500/10',
    document_upload: 'text-blue-400 bg-blue-500/10', document_analyze: 'text-amber-400 bg-amber-500/10',
    tax_calculate: 'text-teal-400 bg-teal-500/10',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-slate-400 text-sm mt-1">Complete activity history for security and compliance</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" variant="outline">
          <ShieldCheck className="w-3 h-3 mr-1" />Secure Logging Active
        </Badge>
      </div>

      {loading ? <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse" /> : logs.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700/50"><CardContent className="py-16 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium">No Activity Yet</h3>
          <p className="text-sm text-slate-400 mt-1">Your actions will be logged here</p>
        </CardContent></Card>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
              {logs.map((log: any, i: number) => {
                const Icon = actionIcons[log.action] || Activity;
                const color = actionColors[log.action] || 'text-slate-400 bg-slate-500/10';
                return (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-800/30">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                      {log.ipAddress && <p className="text-xs text-slate-500">IP: {log.ipAddress}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function HomePage() {
  const { view, isAuthenticated, sidebarOpen } = useAppStore();

  useEffect(() => {
    // Check for Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    const token = params.get('token');

    if (authStatus === 'success' && token) {
      // Set session from Google OAuth
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp > Date.now()) {
          useAppStore.getState().setUser({ id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role });
          useAppStore.getState().setAuthenticated(true);
          useAppStore.getState().setView('dashboard');
          // Clean URL
          window.history.replaceState({}, '', '/');
          return;
        }
      } catch {}
    }

    if (authStatus === 'error' || authStatus === 'no_google_config' || authStatus === 'server_error') {
      toast.error(authStatus === 'no_google_config' ? 'Google sign-in is not configured. Please use email/password.' : 'Google sign-in failed. Please try again.');
      window.history.replaceState({}, '', '/');
    }

    // Check existing session
    fetch('/api/auth/session').then(r => {
      if (r.ok) return r.json();
      throw new Error();
    }).then(data => {
      useAppStore.getState().setUser(data.user);
      useAppStore.getState().setAuthenticated(true);
      useAppStore.getState().setView('dashboard');
    }).catch(() => {});
  }, []);

  // Landing view (no auth required)
  if (view === 'landing') {
    return <LandingView />;
  }

  // Auth views (full screen)
  if (!isAuthenticated) {
    return view === 'register' ? <RegisterView /> : <LoginView />;
  }

  // Main app layout
  const viewComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    calculator: <CalculatorView />,
    optimizer: <OptimizerView />,
    documents: <DocumentsView />,
    guide: <GuideView />,
    reports: <ReportsView />,
    audit: <AuditView />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <MobileTopBar />
      <main className={`transition-all duration-300 pt-16 lg:pt-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {viewComponents[view] || <DashboardView />}
        </div>
      </main>
    </div>
  );
}