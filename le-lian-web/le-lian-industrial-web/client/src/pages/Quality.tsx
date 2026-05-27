import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, TrendingDown, AlertCircle } from "lucide-react";

/**
 * Quality Page - Quality Management System
 * Design: Industrial Minimalist - Emphasize precision and standards
 */

export default function Quality() {
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
          <h1 className="text-5xl font-bold text-primary">品質管理</h1>
          <p className="text-lg text-foreground/70 mt-4">樂聯工業的品質承諾與管理體系</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/quality-control-HoniYqL2eMGKzvJmebG7Ag.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1
          }}
        />
        <div className="container max-w-5xl relative z-10">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
            <h2 className="text-3xl font-bold text-primary mb-4">品質至上的承諾</h2>
            <p className="text-lg text-foreground/80 leading-relaxed">
              樂聯工業將品質至上作為核心價值，透過標準化製程管理、持續改善機制與專業的品質管理團隊，確保每一個產品都符合客戶期待，提供穩定、可靠且具競爭力的產品與服務。
            </p>
          </div>
        </div>
      </section>

      {/* Quality Management System */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">品質管理體系</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ISO Standards */}
            <div className="bg-background rounded-lg p-8 border-t-4 border-accent">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">ISO 認證</h3>
              <p className="text-foreground/80 mb-4">
                樂聯工業遵循國際品質管理標準，建立完整的品質管理體系。
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• ISO 9001 品質管理</li>
                <li>• ISO 14001 環境管理</li>
                <li>• 持續改善與認證</li>
              </ul>
            </div>

            {/* Process Control */}
            <div className="bg-background rounded-lg p-8 border-t-4 border-secondary">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">製程控制</h3>
              <p className="text-foreground/80 mb-4">
                標準化製程管理，確保每一步驟都符合品質要求。
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• 標準作業程序 (SOP)</li>
                <li>• 製程參數監控</li>
                <li>• 即時品質檢驗</li>
              </ul>
            </div>

            {/* Continuous Improvement */}
            <div className="bg-background rounded-lg p-8 border-t-4 border-primary">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">持續改善</h3>
              <p className="text-foreground/80 mb-4">
                透過 PDCA 循環與員工建議，不斷提升品質水準。
              </p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• PDCA 改善循環</li>
                <li>• 5S 管理制度</li>
                <li>• 員工參與機制</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Tools */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">品質管理工具</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4">5S 管理</h3>
              <p className="text-foreground/80 mb-6">
                整理、整頓、清掃、清潔、修養，建立整潔有序的工作環境。
              </p>
              <ul className="space-y-3 text-foreground/80">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">整理</span>
                  <span>移除不必要的物品</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">整頓</span>
                  <span>合理安排工作物品</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">清掃</span>
                  <span>保持工作環境清潔</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">清潔</span>
                  <span>維持整潔狀態</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">修養</span>
                  <span>培養良好習慣</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4">PDCA 循環</h3>
              <p className="text-foreground/80 mb-6">
                計畫、執行、檢查、改善，持續提升品質水準。
              </p>
              <ul className="space-y-3 text-foreground/80">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">Plan</span>
                  <span>制定改善計畫</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">Do</span>
                  <span>實施改善措施</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">Check</span>
                  <span>檢查改善效果</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">Act</span>
                  <span>標準化與改進</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Targets */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">品質績效目標</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-8 text-center border border-border">
              <div className="text-4xl font-bold text-accent mb-3">10%+</div>
              <h3 className="text-lg font-bold text-primary mb-2">製程不良率降低</h3>
              <p className="text-foreground/80 text-sm">
                較前一年度降低 10% 以上，持續提升製程品質。
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 text-center border border-border">
              <div className="text-4xl font-bold text-accent mb-3">15%+</div>
              <h3 className="text-lg font-bold text-primary mb-2">客訴案件減少</h3>
              <p className="text-foreground/80 text-sm">
                較前一年度降低 15% 以上，提升客戶滿意度。
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 text-center border border-border">
              <div className="text-4xl font-bold text-accent mb-3">100%</div>
              <h3 className="text-lg font-bold text-primary mb-2">品質檢驗率</h3>
              <p className="text-foreground/80 text-sm">
                每一個產品都經過嚴格的品質檢驗與驗收。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Improvement */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">品質改善成果</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">製程浪費降低</h3>
                  <p className="text-foreground/80">
                    透過 5S 與 PDCA 改善，有效降低製程中的浪費，提升生產效率。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">作業效率提升</h3>
                  <p className="text-foreground/80">
                    標準化製程與工作流程優化，提升整體作業效率與生產能力。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">品質異常處理能力提升</h3>
                  <p className="text-foreground/80">
                    透過品質管理訓練與工具應用，提升員工的問題分析與解決能力。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1 bg-accent rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">客戶信任度提升</h3>
                  <p className="text-foreground/80">
                    穩定的品質表現與快速的客訴處理，建立客戶信任與長期合作關係。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Image */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/quality-control-HoniYqL2eMGKzvJmebG7Ag.webp"
              alt="品質控制"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">對我們的品質管理體系感興趣？</h2>
          <p className="text-lg text-white/90 mb-8">瞭解如何與樂聯工業合作，享受高品質的產品與服務</p>
          <Link href="/contact">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
              聯絡我們
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
