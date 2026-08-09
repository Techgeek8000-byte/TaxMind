'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { useAppStore, type AppView } from '@/store/app'

// ─── Navigation Configuration ─────────────────────────────────
const PRIMARY_NAV_ITEMS: { label: string; view: AppView; icon: React.ReactNode; tooltip: string }[] = [
  { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, tooltip: 'Overview & KPIs' },
  { label: 'Tax Calculator', view: 'calculator', icon: <Calculator className="h-4 w-4" />, tooltip: 'Income Tax Calculator' },
  { label: 'WHT Calculator', view: 'wht-calculator', icon: <Percent className="h-4 w-4" />, tooltip: 'Withholding Tax Calculator' },
  { label: 'Capital Gains', view: 'capital-gains', icon: <TrendingUp className="h-4 w-4" />, tooltip: 'Capital Gains Tax' },
  { label: 'Savings Score', view: 'savings-score', icon: <Target className="h-4 w-4" />, tooltip: 'Tax Savings Analysis' },
  { label: 'AI Scanner', view: 'scanner', icon: <ScanLine className="h-4 w-4" />, tooltip: 'Document Scanner' },
  { label: 'AI Advisor', view: 'ai-chat', icon: <Bot className="h-4 w-4" />, tooltip: 'AI Tax Chat' },
  { label: 'Reports', view: 'reports', icon: <FileText className="h-4 w-4" />, tooltip: 'Tax Reports & History' },
  { label: 'Tax Guides', view: 'guides', icon: <BookOpen className="h-4 w-4" />, tooltip: 'FBR Rules & Guides' },
]

const MORE_NAV_ITEMS: { label: string; view: AppView; icon: React.ReactNode; group?: string }[] = [
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center px-4 sm:px-6">
        {/* ─── Sidebar Toggle (Desktop) ──────────────── */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 hidden lg:flex h-8 w-8"
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
          className="flex items-center gap-2 mr-4 sm:mr-6 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
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
                    variant={view === item.view ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(item.view)}
                    className="gap-2 text-xs xl:text-sm"
                  >
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
                      variant={isMoreActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className="gap-2 text-xs xl:text-sm"
                    >
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
                        className={view === item.view ? 'bg-secondary' : ''}
                      >
                        <span className="mr-2 text-primary/70">{item.icon}</span>
                        <span>{item.label}</span>
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
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
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
              <DropdownMenuItem onClick={() => navigate('dashboard')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ─── Mobile Sheet ────────────────────────── */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex items-center gap-2 px-4 py-4 border-b">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">TaxMind</span>
              </div>
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <nav className="p-3 space-y-1">
                  {allItems.map((item) => (
                    <Button
                      key={item.view}
                      variant={view === item.view ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-3"
                      onClick={() => navigate(item.view)}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </ScrollArea>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
