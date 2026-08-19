'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Calculator,
  ScanLine,
  FileText,
  BookOpen,
  Shield,
  Menu,
  LogOut,
  User,
  Leaf,
  Target,
  GitCompareArrows,
  Landmark,
  CalendarDays,
  Bot,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Percent,
  TrendingUp,
  MoreHorizontal,
  Sparkles,
  FileCheck,
  ArrowLeftRight,
} from 'lucide-react'
import { useAppStore, type AppView } from '@/store/app'

// ─── Navigation Configuration ─────────────────────────────────
type NavItem = { label: string; view: AppView; icon: React.ReactNode; tooltip?: string; group?: string }

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, tooltip: 'Overview & KPIs' },
  { label: 'Tax Calculator', view: 'calculator', icon: <Calculator className="h-4 w-4" />, tooltip: 'Income Tax Calculator' },
  { label: 'Savings Score', view: 'savings-score', icon: <Target className="h-4 w-4" />, tooltip: 'Tax Savings Analysis' },
  { label: 'AI Scanner', view: 'scanner', icon: <ScanLine className="h-4 w-4" />, tooltip: 'Document Scanner' },
  { label: 'AI Advisor', view: 'ai-chat', icon: <Bot className="h-4 w-4" />, tooltip: 'AI Tax Chat' },
  { label: 'Reports', view: 'reports', icon: <FileText className="h-4 w-4" />, tooltip: 'Tax Reports & History' },
  { label: 'Tax Guides', view: 'guides', icon: <BookOpen className="h-4 w-4" />, tooltip: 'FBR Rules & Guides' },
]

const MORE_NAV_ITEMS: NavItem[] = [
  { label: 'AI Insights', view: 'ai-insights', icon: <Sparkles className="h-4 w-4" />, group: 'AI Features' },
  { label: 'AI Filing Guide', view: 'ai-filing', icon: <FileCheck className="h-4 w-4" />, group: 'AI Features' },
  { label: 'Tax Year Compare', view: 'ai-compare', icon: <ArrowLeftRight className="h-4 w-4" />, group: 'AI Features' },
  { label: 'WHT Calculator', view: 'wht-calculator', icon: <Percent className="h-4 w-4" />, group: 'Calculators' },
  { label: 'Capital Gains', view: 'capital-gains', icon: <TrendingUp className="h-4 w-4" />, group: 'Calculators' },
  { label: 'Presumptive Tax', view: 'presumptive-tax', icon: <GitCompareArrows className="h-4 w-4" />, group: 'Calculators' },
  { label: 'IRIS Export', view: 'iris-export', icon: <FileDown className="h-4 w-4" />, group: 'Export' },
  { label: 'Wealth Statement', view: 'wealth-statement', icon: <Landmark className="h-4 w-4" />, group: 'Statements' },
  { label: 'Tax Calendar', view: 'tax-calendar', icon: <CalendarDays className="h-4 w-4" />, group: 'Statements' },
  { label: 'Audit Log', view: 'audit-log', icon: <Shield className="h-4 w-4" />, group: 'System' },
]

// Group the More items for organized dropdown
const GROUPED_MORE = MORE_NAV_ITEMS.reduce<Record<string, typeof MORE_NAV_ITEMS>>((acc, item) => {
  const group = item.group || 'Other'
  if (!acc[group]) acc[group] = []
  acc[group].push(item)
  return acc
}, {})

export default function AppNavbar() {
  const { user, view, setView, logout, sidebarOpen, toggleSidebar } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  function navigate(v: AppView) {
    setView(v)
    setMobileOpen(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  const allItems = [...PRIMARY_NAV_ITEMS, ...MORE_NAV_ITEMS]

  const isMoreActive = MORE_NAV_ITEMS.some(i => i.view === view)

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto flex h-14 items-center px-4 sm:px-6">
        {/* ─── Sidebar Toggle (Desktop) ──────────────── */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 hidden lg:flex h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/[0.06] transition-base"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* ─── Logo ──────────────────────────────────── */}
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2 mr-4 sm:mr-6 transition-base group"
        >
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-emerald transition-base group-hover:shadow-emerald-lg group-hover:scale-105">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">
            {sidebarOpen ? 'TaxMind' : 'TM'}
          </span>
        </button>

        {/* ─── Desktop: Primary nav (collapsible) ──── */}
        <TooltipProvider delayDuration={200}>
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {(sidebarOpen ? PRIMARY_NAV_ITEMS : PRIMARY_NAV_ITEMS.slice(0, 4)).map((item) => (
              <Tooltip key={item.view}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.view)}
                    className={cn(
                      "relative gap-2 text-xs xl:text-sm transition-base",
                      view === item.view
                        ? "text-primary bg-primary/[0.08]"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/[0.05]",
                      !sidebarOpen && "hover:scale-105"
                    )}
                  >
                    {/* Active bottom accent bar with emerald gradient */}
                    {view === item.view && (
                      <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-gradient-to-r from-primary via-emerald-400 to-primary" />
                    )}
                    {item.icon}
                    {sidebarOpen && <span className="hidden xl:inline">{item.label}</span>}
                  </Button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="bottom" className="text-xs">
                    {item.tooltip}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}

            {/* ─── More Dropdown ─────────────────────── */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "relative gap-2 text-xs xl:text-sm transition-base",
                        isMoreActive
                          ? "text-primary bg-primary/[0.08]"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/[0.05]",
                        !sidebarOpen && "hover:scale-105"
                      )}
                    >
                      {/* Active bottom accent bar */}
                      {isMoreActive && (
                        <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-gradient-to-r from-primary via-emerald-400 to-primary" />
                      )}
                      <MoreHorizontal className="h-4 w-4" />
                      {sidebarOpen && <span className="hidden xl:inline">More</span>}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="bottom" className="text-xs">
                    More tools & features
                  </TooltipContent>
                )}
              </Tooltip>
              <DropdownMenuContent align="start" className="w-64">
                {Object.entries(GROUPED_MORE).map(([group, items], groupIdx) => (
                  <DropdownMenuGroup key={group}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                      {group}
                    </DropdownMenuLabel>
                    {items.map((item) => (
                      <DropdownMenuItem
                        key={item.view}
                        onClick={() => navigate(item.view)}
                        className={cn(
                          "gap-2 cursor-pointer transition-base",
                          view === item.view
                            ? "text-primary bg-primary/[0.08]"
                            : "text-muted-foreground/80 hover:text-primary"
                        )}
                      >
                        <span className={cn(
                          "transition-base",
                          view === item.view ? "text-primary" : "text-primary/50"
                        )}>{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {view === item.view && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    {groupIdx < Object.keys(GROUPED_MORE).length - 1 && (
                      <DropdownMenuSeparator />
                    )}
                  </DropdownMenuGroup>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </TooltipProvider>

        {/* ─── Right side: User + Mobile ────────────── */}
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-base">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold ring-1 ring-primary/20">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('dashboard')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ─── Mobile Sheet (Sidebar) ─────────────── */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-base">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-0 bg-background/95 backdrop-blur-xl border-r border-border/50"
            >
              {/* ── Sheet Header ── */}
              <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
                <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-emerald">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight">TaxMind</span>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Pakistan</p>
                </div>
              </div>

              {/* ── Sheet Navigation ── */}
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <nav className="p-3 space-y-0.5">
                  {allItems.map((item, idx) => {
                    const prevGroup = idx > 0 ? allItems[idx - 1].group : null
                    const currGroup = item.group || null
                    const showSep = idx > 0 && currGroup !== prevGroup
                    const isActive = view === item.view

                    return (
                      <div key={item.view}>
                        {/* Group separator with centered label */}
                        {showSep && (
                          <div className="flex items-center gap-2 px-3 py-2">
                            <div className="h-px flex-1 bg-border/30" />
                            {currGroup && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 whitespace-nowrap">
                                {currGroup}
                              </span>
                            )}
                            <div className="h-px flex-1 bg-border/30" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 relative pl-4 transition-base rounded-lg h-9",
                            isActive
                              ? "text-primary bg-primary/[0.08] hover:bg-primary/[0.1]"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/[0.05] hover:scale-[1.01] active:scale-[0.99]"
                          )}
                          onClick={() => navigate(item.view)}
                        >
                          {/* Active left accent bar with emerald gradient */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary via-emerald-400 to-primary" />
                          )}
                          <span className={cn(
                            "transition-base",
                            isActive ? "text-primary" : "text-muted-foreground/70"
                          )}>{item.icon}</span>
                          <span className="text-sm">{item.label}</span>
                        </Button>
                      </div>
                    )
                  })}
                </nav>
              </ScrollArea>

              {/* ── Sheet User Info (Glass Card) ── */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="rounded-xl p-3 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] shadow-sm">
                  <div className="flex items-center gap-3 mb-2.5">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/15">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/[0.06] transition-base rounded-lg h-8 text-xs"
                    onClick={logout}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
