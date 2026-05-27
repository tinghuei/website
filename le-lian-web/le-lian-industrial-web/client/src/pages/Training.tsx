import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Users, Zap, Target, BarChart3 } from "lucide-react";

/**
 * Training Page - Talent Development & Training Programs
 * Design: Industrial Minimalist - Showcase training initiatives and development
 */

export default function Training() {
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
          <h1 className="text-5xl font-bold text-primary">人才培育</h1>
          <p className="text-lg text-foreground/70 mt-4">樂聯工業的教育訓練與人才發展計畫</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/team-collaboration-d6ZAaEqT7GUXeK7X3gTrja.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1
          }}
        />
        <div className="container max-w-5xl relative z-10">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
            <h2 className="text-3xl font-bold text-primary mb-4">投資人才，成就未來</h2>
            <p className="text-lg text-foreground/80 leading-relaxed">
              樂聯工業重視內部人才發展，致力於打造良好學習環境。透過系統化教育訓練制度進行在職技能與管理能力培養、跨部門合作與知識傳承，促進員工專業成長，並提升組織整體執行力與向心力。
            </p>
          </div>
        </div>
      </section>

      {/* Training Strategy */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">教育訓練策略</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg p-8 border-l-4 border-accent">
              <h3 className="text-xl font-bold text-primary mb-4">訓練目標</h3>
              <ul className="space-y-3 text-foreground/80">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>建立完整教育訓練與人才培育體系</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>提升員工專業能力與技術水準</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>增進管理能力與領導力</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>提升員工留任率與組織穩定度</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>符合產業發展與法規要求</span>
                </li>
              </ul>
            </div>

            <div className="bg-background rounded-lg p-8 border-l-4 border-secondary">
              <h3 className="text-xl font-bold text-primary mb-4">訓練方式</h3>
              <ul className="space-y-3 text-foreground/80">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>年度訓練計畫與課程安排</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>在職訓練與技能培養</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>外部講師與專業培訓</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>內部知識傳承與導師制度</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>跨部門協作與專案實踐</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">年度課程規劃</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Operational Excellence */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary">提升營運效率與降低成本</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">課程展開計畫</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 製程改善與流程優化（5S、PDCA）</li>
                    <li>• 成本控管與效率分析</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">預期效果</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 製程浪費降低、作業效率提升</li>
                    <li>• 不良率及返工率下降</li>
                    <li>• 管理決策依據更具數據化基礎</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quality Enhancement */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary">強化品質與降低客訴風險</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">課程展開計畫</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 品質管理基礎（ISO、品質工具）</li>
                    <li>• 客訴處理與風險預防</li>
                    <li>• 問題分析與矯正預防措施</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">預期效果</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 品質異常處理能力提升</li>
                    <li>• 客訴案件有效減量</li>
                    <li>• 公司品質形象與客戶信任度提升</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Market Expansion */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary">擴展市場與提升客戶經營能力</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">課程展開計畫</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 業務溝通與顧客關係管理（CRM）</li>
                    <li>• 跨部門協作與專案管理</li>
                    <li>• 國內外市場趨勢與商務基礎知識</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">預期效果</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 客戶開發與維繫能力提升</li>
                    <li>• 跨部門溝通效率改善</li>
                    <li>• 支援公司市場拓展與業務成長</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Management Development */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary">強化管理能力與組織穩定度</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">課程展開計畫</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 基層與中階主管管理技能</li>
                    <li>• 績效管理與目標設定</li>
                    <li>• 勞動法規、內控制度與風險管理</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">預期效果</p>
                  <ul className="space-y-1 text-sm text-foreground/70">
                    <li>• 管理角色認知明確</li>
                    <li>• 組織運作穩定度提升</li>
                    <li>• 人事與管理風險有效控管</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Collaboration */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663179180092/9L8SbPCYZdJrd6fcYwLffH/team-collaboration-d6ZAaEqT7GUXeK7X3gTrja.webp"
                alt="團隊協作"
                className="w-full h-80 object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">團隊合作與知識傳承</h2>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                樂聯工業強調跨部門協作與知識傳承，透過內部導師制度、團隊專案與定期分享會，促進員工之間的溝通與學習。
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">內部導師制度 - 經驗傳承與新人培養</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">跨部門專案 - 增進協作與創新</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">知識分享會 - 定期分享最佳實踐</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground">員工建議制度 - 鼓勵創新與改善</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Training Impact */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">訓練成效</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
              <div className="text-3xl font-bold text-accent mb-2">提升</div>
              <p className="text-foreground/80 text-sm">員工專業能力與技術水準</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
              <div className="text-3xl font-bold text-accent mb-2">增進</div>
              <p className="text-foreground/80 text-sm">管理能力與領導力</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
              <div className="text-3xl font-bold text-accent mb-2">提高</div>
              <p className="text-foreground/80 text-sm">員工留任率與滿意度</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
              <div className="text-3xl font-bold text-accent mb-2">強化</div>
              <p className="text-foreground/80 text-sm">組織執行力與向心力</p>
            </div>
          </div>
        </div>
      </section>

      {/* Competency Gap Analysis */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="bg-accent/10 rounded-lg p-4 flex-shrink-0">
                  <Target className="w-8 h-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary mb-3">職能落差分析工具</h3>
                  <p className="text-foreground/80 mb-6">
                    透過系統化的職能落差分析，評估員工目前能力與職位要求的差距，制定個性化的培訓計畫，幫助員工快速成長。
                  </p>
                  <Link href="/detailed-competency-assessment">
                    <Button className="bg-accent hover:bg-accent/90 text-white">
                      開始分析
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="bg-blue-100 rounded-lg p-4 flex-shrink-0">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary mb-3">管理員儀表板</h3>
                  <p className="text-foreground/80 mb-6">
                    查看所有員工的職能評估結果，分析部門職能水平，導出評估報表，支持數據驅動的人才發展決策。
                  </p>
                  <Link href="/admin-dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      查看儀表板
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">加入樂聯工業，開啟職涯發展</h2>
          <p className="text-lg text-white/90 mb-8">在樂聯工業，我們投資您的成長，支持您的夢想</p>
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
