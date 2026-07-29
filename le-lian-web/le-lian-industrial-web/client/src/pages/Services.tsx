import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Package, Wrench, Zap } from "lucide-react";

/**
 * Services Page - Business Scope
 * Design: Industrial Minimalist - Showcase products and services
 */

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回首頁
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-primary">業務範疇</h1>
          <p className="text-lg text-foreground/70 mt-4">瞭解樂聯工業的產品與服務</p>
        </div>
      </div>

      {/* Main Services */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">主要業務</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Manufacturing */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">產品製造</h3>
              <p className="text-foreground/80 mb-4">
                專業的辦公家具製造，包括椅子、桌子、儲存系統等，採用先進的製造工藝和品質控制。
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• 精密機械加工</li>
                <li>• 標準化製程管理</li>
                <li>• 彈性產線調整</li>
                <li>• 出口經驗成熟</li>
              </ul>
            </div>

            {/* Processing */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">產品加工</h3>
              <p className="text-foreground/80 mb-4">
                提供客製化的加工服務，根據客戶需求進行精密加工和組裝，確保產品品質。
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• 客製化加工</li>
                <li>• 精密組裝</li>
                <li>• 表面處理</li>
                <li>• 品質檢驗</li>
              </ul>
            </div>

            {/* Integration */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">整合服務</h3>
              <p className="text-foreground/80 mb-4">
                提供完整的供應鏈整合服務，從設計、製造到配送，一站式解決方案。
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• 供應鏈管理</li>
                <li>• 物流配送</li>
                <li>• 技術支援</li>
                <li>• 售後服務</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">產品應用領域</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/office-furniture-showcase-f4oA56xL822HiFYJrVTYyz.webp"
                alt="辦公家具"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-primary mb-6">辦公家具</h3>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                樂聯工業專業製造高品質辦公家具，包括符合人體工學的辦公椅、現代化的辦公桌、模組化的儲存系統等。我們的產品設計兼具美觀與功能性，為現代辦公環境提供完整解決方案。
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">人體工學設計</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">環保材料選擇</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">客製化設計</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">大量生產能力</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Advantages */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">核心優勢</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                <span className="text-2xl text-accent">✓</span>
                多元產品線
              </h3>
              <p className="text-foreground/80">
                產品多元、出口經驗成熟，能夠滿足不同客戶的需求，並具備國際競爭力。
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                <span className="text-2xl text-accent">✓</span>
                彈性產線
              </h3>
              <p className="text-foreground/80">
                可彈性調整產線，適應市場變化和客戶需求，提供快速的生產回應。
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                <span className="text-2xl text-accent">✓</span>
                品質保證
              </h3>
              <p className="text-foreground/80">
                標準化製程管理與持續改善機制，確保產品品質穩定可靠。
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                <span className="text-2xl text-accent">✓</span>
                技術支援
              </h3>
              <p className="text-foreground/80">
                專業的技術團隊提供完整的技術支援和售後服務，確保客戶滿意度。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunities */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">市場機會</h2>
          
          <div className="bg-background rounded-lg p-8 border-l-4 border-accent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">供應鏈轉移</h3>
                <p className="text-foreground/80 text-sm">
                  關稅政策造成供應鏈轉移，台灣成為替代供應來源，提供更多商機。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">小量多樣</h3>
                <p className="text-foreground/80 text-sm">
                  小量多樣的市場需求有利於樂聯工業的彈性產線，提升競爭優勢。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">技術進步</h3>
                <p className="text-foreground/80 text-sm">
                  AI 與自動化技術日益增進，樂聯工業持續投入技術升級與創新。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">對我們的產品與服務感興趣？</h2>
          <p className="text-lg text-white/90 mb-8">聯絡我們的業務團隊，瞭解如何為您的業務提供支援</p>
          <Link href="/contact">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
              立即聯絡
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
