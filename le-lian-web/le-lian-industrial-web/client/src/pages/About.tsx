import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

/**
 * About Page - Company Introduction
 * Design: Industrial Minimalist - Professional, clean layout with company history and structure
 */

export default function About() {
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
          <h1 className="text-5xl font-bold text-primary">公司簡介</h1>
          <p className="text-lg text-foreground/70 mt-4">瞭解樂聯工業的發展歷程與企業文化</p>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-6">公司概況</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              <strong>樂聯工業股份有限公司</strong>成立於民國75年（1986年），是一家專注於工業製造與相關技術服務的專業公司。公司自創立以來，持續深耕本業，致力於提升產品品質、製程效率與客戶滿意度，並穩健拓展市場版圖。
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              本公司由鄭凱仁先生擔任負責人，具備多年產業實務經驗與企業經營背景。在其領導下，公司秉持穩健經營、持續改善與人才培育並重之管理理念，推動組織專業化與制度化發展。
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed">
              樂聯工業股份有限公司主要從事辦公家具相關產品之製造、加工、整合服務，產品應用涵蓋家具及裝設品產業領域。公司重視產品品質與技術精進，透過標準化製程管理與持續改善機制，提供客戶穩定、可靠且具競爭力之產品與服務。
            </p>
          </div>
        </div>
      </section>

      {/* Organization Structure */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-6">組織架構</h2>
          <p className="text-foreground/70 mb-8">
            公司組織架構完整，涵蓋管理、製造、品保、業務及後勤支援等單位，運作分工明確。
          </p>
          
          <div className="bg-background rounded-lg p-8 border-l-4 border-accent">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-primary mb-4">組織層級</h3>
                <div className="space-y-3 text-foreground/80">
                  <p className="flex items-center gap-3"><span className="text-accent font-bold">董事長</span> - 鄭凱仁先生</p>
                  <p className="flex items-center gap-3 ml-4"><span className="text-accent font-bold">副董事長</span> - 公司策略與營運監督</p>
                  <p className="flex items-center gap-3 ml-8"><span className="text-accent font-bold">總經理/副總經理</span> - 日常營運管理</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary mb-4">主要部門與課室</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <h4 className="font-bold text-primary mb-3">營業部</h4>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li>• 業務課 - 市場開發與客戶服務</li>
                      <li>• 研發課 - 產品開發與技術支援</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-border">
                    <h4 className="font-bold text-primary mb-3">管理部</h4>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li>• 總務課/人資 - 人力資源與行政管理</li>
                      <li>• 品保課 - 品質管理與檢驗</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-border">
                    <h4 className="font-bold text-primary mb-3">財務部</h4>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li>• 會計課 - 財務管理與會計</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-border">
                    <h4 className="font-bold text-primary mb-3">廠務部</h4>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li>• 資材課 - 物料管理與採購</li>
                      <li>• 廠務室/製造課 - 生產製造與設備管理</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary mb-3">支援單位</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">秘書室 - 行政協調與文書管理</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission, Strategy */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">願景、使命、策略</h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Vision */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-accent">願</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">願景</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    樂聯工業股份有限公司以成為具備專業製造能力、穩定品質與永續經營之工業製造企業為願景，持續強化核心技術、人才培育與組織管理，在競爭激烈的產業環境中建立長期信賴價值。
                  </p>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-accent">使</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">使命</h3>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    樂聯工業股份有限公司之核心價值包含品質至上、專業精進、誠信負責、團隊合作與永續經營。
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    於中長期發展目標中，樂聯工業將以「穩定本業、深化專業、提升附加價值」為核心使命，持續投入製造技術精進與流程改善，並配合市場需求調整營運策略，以提升企業整體競爭力。
                  </p>
                </div>
              </div>
            </div>

            {/* Strategy */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-accent">策</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">策略規劃方向</h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex gap-3">
                      <span className="text-accent font-bold">1.</span>
                      <span>建立完整教育訓練與人才培育體系，提升員工專業與留任率</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent font-bold">2.</span>
                      <span>導入制度化管理與流程標準化，降低營運風險並提升效率</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent font-bold">3.</span>
                      <span>強化內部溝通與組織整合，提升執行一致性</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-accent font-bold">4.</span>
                      <span>配合政府政策與產業趨勢，透過補助計畫加速組織升級</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Goals */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">短期與中長期目標</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Short Term */}
            <div className="bg-background rounded-lg p-8 border-t-4 border-accent">
              <h3 className="text-2xl font-bold text-primary mb-6">短期目標</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">客戶數成長</p>
                  <p className="text-foreground/80">年度客戶數成長 10～15%</p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">製程不良率</p>
                  <p className="text-foreground/80">較前一年度降低 10% 以上</p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">客訴案件</p>
                  <p className="text-foreground/80">較前一年度降低 15% 以上</p>
                </div>
              </div>
            </div>

            {/* Long Term */}
            <div className="bg-background rounded-lg p-8 border-t-4 border-secondary">
              <h3 className="text-2xl font-bold text-primary mb-6">中長期目標</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-2">核心方向</p>
                  <p className="text-foreground/80">「穩定製程、降低浪費」為核心方向</p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">市場拓展</p>
                  <p className="text-foreground/80">逐步拓展市場版圖，確保長期成長動能</p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">品質提升</p>
                  <p className="text-foreground/80">持續投入產品與服務品質之提升</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-6">企業文化</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
            <p className="text-foreground/80 leading-relaxed mb-6">
              公司內部重視教育訓練與人才培育，透過年度訓練計畫與在職訓練制度，提升員工專業能力與組織整體競爭力，並符合產業發展與法規要求。
            </p>
            <p className="text-foreground/80 leading-relaxed">
              樂聯工業重視內部人才發展，致力於打造良好學習環境，透過系統化教育訓練制度進行在職技能與管理能力培養、跨部門合作與知識傳承，促進員工專業成長，並提升組織整體執行力與向心力。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">瞭解更多關於樂聯工業</h2>
          <p className="text-lg text-white/90 mb-8">探索我們的業務範疇、品質管理與人才培育計畫</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                業務範疇
              </Button>
            </Link>
            <Link href="/quality">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                品質管理
              </Button>
            </Link>
            <Link href="/training">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                人才培育
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
