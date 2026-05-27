import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Users, TrendingUp } from "lucide-react";

/**
 * Home Page - Industrial Minimalist Design
 * Design Philosophy: Clean, professional, modern industrial aesthetic
 * Color Scheme: Deep Gray (#2C3E50) + Steel Blue (#34495E) + Industrial Orange (#E67E22)
 * Typography: Poppins Bold for headings, Open Sans Regular for body
 */

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">樂</span>
            </div>
            <span className="font-bold text-primary text-lg hidden sm:inline">樂聯工業</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-foreground hover:text-accent transition-colors">公司簡介</Link>
            <Link href="/services" className="text-foreground hover:text-accent transition-colors">業務範疇</Link>
            <Link href="/quality" className="text-foreground hover:text-accent transition-colors">品質管理</Link>
            <Link href="/training" className="text-foreground hover:text-accent transition-colors">人才培育</Link>
            <Link href="/contact" className="text-foreground hover:text-accent transition-colors">聯絡我們</Link>
          </div>
          <Button variant="default" className="bg-accent hover:bg-accent/90">
            聯絡我們
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/hero-industrial-factory-Ey6xuufHknJbsYhV8T7C9J.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-0" />
        
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              樂聯工業
              <span className="text-accent block">專業製造 品質保證</span>
            </h1>
            <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
              成立於民國75年，專注於工業製造與相關技術服務。我們致力於提升產品品質、製程效率與客戶滿意度，為您提供穩定、可靠且具競爭力的產品與服務。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                瞭解更多 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                聯絡業務
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-4 text-center">核心價值</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
            樂聯工業秉持穩健經營、持續改善與人才培育並重之管理理念，推動組織專業化與制度化發展。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Shield, title: "品質至上", desc: "確保產品與服務符合客戶期待" },
              { icon: TrendingUp, title: "專業精進", desc: "鼓勵持續學習與技術提升" },
              { icon: Users, title: "誠信負責", desc: "以誠信為企業經營基礎" },
              { icon: Zap, title: "團隊合作", desc: "重視跨部門協作與共同成長" },
              { icon: TrendingUp, title: "永續經營", desc: "兼顧企業發展與社會責任" }
            ].map((value, idx) => (
              <div key={idx} className="bg-background rounded-lg p-6 hover:shadow-lg transition-shadow">
                <value.icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="font-bold text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-foreground/70">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">公司亮點</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6">專業製造能力</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-1 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="font-semibold text-primary">多元產品線</p>
                    <p className="text-sm text-foreground/70">辦公家具、工業製造、技術服務</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="font-semibold text-primary">品質管理</p>
                    <p className="text-sm text-foreground/70">標準化製程、持續改善機制</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="font-semibold text-primary">人才培育</p>
                    <p className="text-sm text-foreground/70">年度訓練計畫、在職訓練制度</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right: Image */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/hero-industrial-factory-Ey6xuufHknJbsYhV8T7C9J.webp"
                alt="工業製造"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">38+</div>
              <p className="text-white/80">年營運經驗</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10-15%</div>
              <p className="text-white/80">年度客戶成長目標</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10%+</div>
              <p className="text-white/80">製程不良率降低</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">15%+</div>
              <p className="text-white/80">客訴案件減少</p>
            </div>
          </div>
        </div>
      </section>

      {/* Management Philosophy Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-4 text-center">經營方針</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
            樂聯工業以願景、使命、核心價值為指引，致力於提供優質的產品與服務。
          </p>
          
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/樂聯-經營方針_2848fbbe.webp"
              alt="樂聯工業經營方針 - 願景、使命、核心價值"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Training Program Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-4 text-center">人才培育計畫</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
            樂聯工業重視內部人才發展，透過系統化教育訓練制度培養員工專業能力與管理能力。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg p-8 border-l-4 border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">製程與品質提升</h3>
              <ul className="space-y-2 text-foreground/80">
                <li>• 5S 與 PDCA 流程優化</li>
                <li>• 成本控管與效率分析</li>
                <li>• ISO 品質管理基礎</li>
                <li>• 客訴處理與風險預防</li>
              </ul>
            </div>

            <div className="bg-background rounded-lg p-8 border-l-4 border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">管理與組織發展</h3>
              <ul className="space-y-2 text-foreground/80">
                <li>• 基層與中階主管管理技能</li>
                <li>• 績效管理與目標設定</li>
                <li>• 跨部門協作與專案管理</li>
                <li>• 勞動法規與內控制度</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/training">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                瞭解完整訓練計畫 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">準備好與我們合作了嗎？</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            無論您是尋求優質產品、技術服務或人才培育解決方案，樂聯工業都準備好為您服務。
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
            立即聯絡我們
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">樂聯工業</h4>
              <p className="text-white/70 text-sm">專業工業製造與辦公家具服務提供商</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">快速連結</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-white/70 hover:text-white">公司簡介</Link></li>
                <li><Link href="/services" className="text-white/70 hover:text-white">業務範疇</Link></li>
                <li><Link href="/quality" className="text-white/70 hover:text-white">品質管理</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">更多資訊</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/training" className="text-white/70 hover:text-white">人才培育</Link></li>
                <li><Link href="/contact" className="text-white/70 hover:text-white">聯絡我們</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">联絡資訊</h4>
              <p className="text-white/70 text-sm">電話：(08) 866-9966</p>
              <p className="text-white/70 text-sm">地址：屏東縣枋寮鄉精進路37號</p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/70 text-sm">
            <p>&copy; 2026 樂聯工業股份有限公司。版權所有。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
