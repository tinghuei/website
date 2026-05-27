import { Link } from "wouter";
import { ArrowLeft, BarChart3, TrendingUp, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CompetencyGapAnalysis() {
  const [employeeName, setEmployeeName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [competencyScores, setCompetencyScores] = useState<Record<number, number>>({});
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Fetch positions
  const positionsQuery = trpc.competency.getPositions.useQuery();
  
  // Fetch competencies
  const competenciesQuery = trpc.competency.getAllCompetencies.useQuery();
  
  // Fetch position competencies when position is selected
  const positionCompQuery = trpc.competency.getPositionCompetencies.useQuery(
    selectedPosition || 0,
    { enabled: !!selectedPosition }
  );

  // Initialize competency scores when position competencies load
  useEffect(() => {
    if (positionCompQuery.data) {
      const scores: Record<number, number> = {};
      positionCompQuery.data.forEach((pc: any) => {
        scores[pc.competencyId] = 0;
      });
      setCompetencyScores(scores);
    }
  }, [positionCompQuery.data]);

  const handleAnalyze = async () => {
    if (!employeeName || !employeeName.trim()) {
      toast.error("請輸入員工名稱");
      return;
    }

    if (!selectedPosition) {
      toast.error("請選擇職位");
      return;
    }

    if (!positionCompQuery.data || positionCompQuery.data.length === 0) {
      toast.error("該職位尚未設置職能要求");
      return;
    }

    // Check if all competencies have been scored
    const allScored = positionCompQuery.data.every(
      (pc: any) => competencyScores[pc.competencyId] !== undefined && competencyScores[pc.competencyId] >= 0
    );

    if (!allScored) {
      toast.error("請評估所有職能");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Calculate gap analysis
      let totalGap = 0;
      let totalRequired = 0;
      const gapDetails: any[] = [];

      positionCompQuery.data.forEach((pc: any) => {
        const gap = Math.max(0, pc.requiredLevel - (competencyScores[pc.competencyId] || 0));
        totalGap += gap;
        totalRequired += pc.requiredLevel;
        
        const comp = competenciesQuery.data?.find((c: any) => c.id === pc.competencyId);
        gapDetails.push({
          competencyId: pc.competencyId,
          competencyName: comp?.name || "未知職能",
          requiredLevel: pc.requiredLevel,
          currentLevel: competencyScores[pc.competencyId] || 0,
          gap: gap,
          importance: pc.importance,
        });
      });

      const gapPercentage = totalRequired > 0 ? Math.round((totalGap / totalRequired) * 100) : 0;

      setAnalysisResult({
        employeeName,
        positionId: selectedPosition,
        totalGap,
        gapPercentage,
        totalRequired,
        gapDetails,
      });

      toast.success("分析完成！");
      setShowForm(false);
    } catch (error) {
      toast.error("分析失敗，請重試");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGapLevel = (percentage: number) => {
    if (percentage <= 20) return { level: "優秀", color: "bg-green-500", textColor: "text-green-700" };
    if (percentage <= 40) return { level: "良好", color: "bg-blue-500", textColor: "text-blue-700" };
    if (percentage <= 60) return { level: "中等", color: "bg-yellow-500", textColor: "text-yellow-700" };
    if (percentage <= 80) return { level: "需改進", color: "bg-orange-500", textColor: "text-orange-700" };
    return { level: "急需改進", color: "bg-red-500", textColor: "text-red-700" };
  };

  const gapLevel = analysisResult ? getGapLevel(analysisResult.gapPercentage) : null;
  const selectedPositionName = positionsQuery.data?.find((p: any) => p.id === selectedPosition)?.name;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <Link href="/training">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回人才培育
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-primary">職能落差分析</h1>
          <p className="text-lg text-foreground/70 mt-4">評估員工職能與職位要求的差距，制定培訓計畫</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">職能評估表</h2>

              {/* Employee Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  員工名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="請輸入員工名稱"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Position Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  職位 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPosition || ""}
                  onChange={(e) => setSelectedPosition(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">選擇職位</option>
                  {positionsQuery.data?.map((pos: any) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name} ({pos.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Competency Scores */}
              {selectedPosition && positionCompQuery.data && positionCompQuery.data.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">職能評估</h3>
                  <div className="space-y-4">
                    {positionCompQuery.data.map((pc: any) => {
                      const comp = competenciesQuery.data?.find((c: any) => c.id === pc.competencyId);
                      return (
                        <div key={pc.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-foreground">{comp?.name || "未知職能"}</p>
                              <p className="text-sm text-foreground/60">{comp?.category}</p>
                              <p className="text-xs text-foreground/50 mt-1">
                                職位要求等級: <span className="font-semibold">{pc.requiredLevel}</span>
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              pc.importance === "high" ? "bg-red-100 text-red-700" :
                              pc.importance === "medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {pc.importance === "high" ? "高" : pc.importance === "medium" ? "中" : "低"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="4"
                              value={competencyScores[pc.competencyId] || 0}
                              onChange={(e) =>
                                setCompetencyScores({
                                  ...competencyScores,
                                  [pc.competencyId]: parseInt(e.target.value),
                                })
                              }
                              className="flex-1"
                            />
                            <span className="text-sm font-semibold text-primary min-w-8 text-center">
                              {competencyScores[pc.competencyId] || 0}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/50 mt-2">
                            0 = 無經驗, 1 = 初級, 2 = 中級, 3 = 高級, 4 = 專家
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedPosition ? (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">該職位尚未設置職能要求</p>
                    <p className="text-sm text-yellow-700 mt-1">請先在系統中配置該職位的職能要求</p>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedPosition}
                  className="flex-1"
                >
                  {isAnalyzing ? "分析中..." : "開始分析"}
                </Button>
              </div>
            </div>
          </div>
        ) : analysisResult ? (
          <div className="max-w-4xl mx-auto">
            {/* Analysis Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Overall Gap Score */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">整體評估</h3>
                  <div className="text-center">
                    <div className={`${gapLevel?.color} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-white text-3xl font-bold">{analysisResult.gapPercentage}%</span>
                    </div>
                    <p className={`text-lg font-bold ${gapLevel?.textColor} mb-2`}>{gapLevel?.level}</p>
                    <p className="text-sm text-foreground/60">職能落差程度</p>
                  </div>
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">員工名稱:</span>
                      <span className="font-medium">{analysisResult.employeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">職位:</span>
                      <span className="font-medium">{selectedPositionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">總落差點數:</span>
                      <span className="font-medium">{analysisResult.totalGap}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Gap Analysis */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">職能詳細分析</h3>
                  <div className="space-y-4">
                    {analysisResult.gapDetails.map((detail: any, idx: number) => (
                      <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-foreground">{detail.competencyName}</p>
                            <p className="text-xs text-foreground/60">重要性: {detail.importance === "high" ? "高" : detail.importance === "medium" ? "中" : "低"}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            detail.gap === 0 ? "bg-green-100 text-green-700" :
                            detail.gap <= 1 ? "bg-blue-100 text-blue-700" :
                            detail.gap <= 2 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            落差: {detail.gap}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-foreground/60">當前: {detail.currentLevel}</span>
                              <span className="text-foreground/60">要求: {detail.requiredLevel}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(detail.currentLevel / detail.requiredLevel) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Training Recommendations */}
            <div className="bg-white rounded-lg border border-border p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                培訓建議
              </h3>
              <div className="space-y-3">
                {analysisResult.gapDetails
                  .filter((d: any) => d.gap > 0)
                  .sort((a: any, b: any) => {
                    const importanceMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
                    return (importanceMap[b.importance as string] || 0) - (importanceMap[a.importance as string] || 0);
                  })
                  .map((detail: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">
                          {detail.competencyName} - 需提升 {detail.gap} 個等級
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          從當前的 Level {detail.currentLevel} 提升至 Level {detail.requiredLevel}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowForm(true);
                  setAnalysisResult(null);
                  setCompetencyScores({});
                }}
                variant="outline"
                className="flex-1"
              >
                進行新的評估
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
