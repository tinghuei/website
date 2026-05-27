import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CompetencyItem {
  id: number;
  name: string;
  category: string;
  description: string | null;
  requiredLevel: number;
  importance: string;
}

interface AssessmentResult {
  employeeName: string;
  positionName: string;
  totalCompetencies: number;
  assessedCompetencies: number;
  gapPercentage: number;
  gapLevel: string;
  recommendations: Array<{
    competency: string;
    gap: number;
    importance: string;
    recommendation: string;
  }>;
}

export default function EmployeeSelfAssessment() {
  const [employeeName, setEmployeeName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedCompetencies, setSelectedCompetencies] = useState<Set<number>>(new Set());
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 獲取職位列表
  const { data: positions, isLoading: positionsLoading } = trpc.competency.getPositions.useQuery();

  // 獲取職位職能要求
  const positionIdNum = selectedPosition ? parseInt(selectedPosition) : null;
  const { data: competencies, isLoading: competenciesLoading } = trpc.competency.getPositionCompetencies.useQuery(
    positionIdNum as number,
    { enabled: !!positionIdNum }
  );

  // 提交評估
  const handleSubmitAssessment = async () => {
    if (!employeeName.trim()) {
      setError("請輸入員工名稱");
      return;
    }
    if (!selectedPosition) {
      setError("請選擇職位");
      return;
    }
    if (selectedCompetencies.size === 0) {
      setError("請至少選擇一個職能");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 模擬 API 調用進行職能落差分析
      const competencyArray = competencies || [];
      const selectedCompetencyIds = Array.from(selectedCompetencies);

      // 計算落差
      const totalCompetencies = competencyArray.length;
      const assessedCompetencies = selectedCompetencyIds.length;
      const gapPercentage = Math.round(((totalCompetencies - assessedCompetencies) / totalCompetencies) * 100);

      // 確定等級
      let gapLevel = "優秀";
      if (gapPercentage > 50) gapLevel = "需要改善";
      else if (gapPercentage > 25) gapLevel = "良好";

      // 生成建議
      const recommendations = competencyArray
        .filter((comp: CompetencyItem) => !selectedCompetencyIds.includes(comp.id))
        .map((comp: CompetencyItem) => ({
          competency: comp.name,
          gap: comp.requiredLevel,
          importance: comp.importance,
          recommendation: `建議加強 ${comp.name} 能力，目標等級 ${comp.requiredLevel} 級`,
        }))
        .sort((a: any, b: any) => {
          const importanceMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (importanceMap[b.importance as string] || 0) - 
                 (importanceMap[a.importance as string] || 0);
        });

      setAssessmentResult({
        employeeName,
        positionName: positions?.find((p: any) => p.id === parseInt(selectedPosition))?.name || selectedPosition,
        totalCompetencies,
        assessedCompetencies,
        gapPercentage,
        gapLevel,
        recommendations,
      });
    } catch (err) {
      setError("評估失敗，請稍後重試");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmployeeName("");
    setSelectedPosition("");
    setSelectedCompetencies(new Set());
    setAssessmentResult(null);
    setError("");
  };

  const toggleCompetency = (id: number) => {
    const newSet = new Set(selectedCompetencies);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCompetencies(newSet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">員工職能自主評估</h1>
          <p className="text-lg text-slate-600">評估您目前具備的職務能力，系統將自動分析職能落差並提供改善建議</p>
        </div>

        {/* 評估表單 */}
        {!assessmentResult && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle>職能評估表單</CardTitle>
              <CardDescription>請填寫您的基本資訊並勾選您目前具備的職能</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">員工名稱</label>
                  <Input
                    placeholder="請輸入您的名稱"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">職位</label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="請選擇您的職位" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionsLoading ? (
                        <SelectItem value="loading" disabled>
                          載入中...
                        </SelectItem>
                      ) : positions && positions.length > 0 ? (
                        positions.map((pos: any) => (
                          <SelectItem key={pos.id} value={pos.id.toString()}>
                            {pos.name} ({pos.department})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          無可用職位
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 職能勾選 */}
              {selectedPosition && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    請勾選您目前具備的職能（共 {competencies?.length || 0} 項）
                  </label>
                  {competenciesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : competencies && competencies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {competencies.map((comp: CompetencyItem) => (
                        <div
                          key={comp.id}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => toggleCompetency(comp.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedCompetencies.has(comp.id)}
                              onChange={() => toggleCompetency(comp.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{comp.name}</p>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    comp.importance === "high"
                                      ? "bg-red-100 text-red-700"
                                      : comp.importance === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {comp.importance === "high" ? "高" : comp.importance === "medium" ? "中" : "低"}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{comp.description}</p>
                              <p className="text-xs text-slate-500 mt-2">要求等級: {comp.requiredLevel} 級</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      請先選擇職位以查看相應的職能要求
                    </div>
                  )}
                </div>
              )}

              {/* 錯誤提示 */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* 按鈕 */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitAssessment}
                  disabled={isLoading || !employeeName || !selectedPosition || selectedCompetencies.size === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    "生成職能落差分析"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析結果 */}
        {assessmentResult && (
          <div className="space-y-6">
            {/* 結果摘要 */}
            <Card className="shadow-lg border-green-200 bg-green-50">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <CardTitle>評估完成</CardTitle>
                    <CardDescription>職能落差分析結果已生成</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">員工名稱</p>
                    <p className="text-lg font-bold text-slate-900">{assessmentResult.employeeName}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">職位</p>
                    <p className="text-lg font-bold text-slate-900">{assessmentResult.positionName}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">職能落差</p>
                    <p className="text-lg font-bold text-red-600">{assessmentResult.gapPercentage}%</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">評估等級</p>
                    <p
                      className={`text-lg font-bold ${
                        assessmentResult.gapLevel === "優秀"
                          ? "text-green-600"
                          : assessmentResult.gapLevel === "良好"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {assessmentResult.gapLevel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 職能統計 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>職能統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">已具備職能</span>
                      <span className="text-sm font-bold text-green-600">
                        {assessmentResult.assessedCompetencies} / {assessmentResult.totalCompetencies}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(assessmentResult.assessedCompetencies / assessmentResult.totalCompetencies) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 改善建議 */}
            {assessmentResult.recommendations.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>改善建議</CardTitle>
                  <CardDescription>
                    根據您的職能評估，以下是優先改善的職能（按重要性排序）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-slate-900">{rec.competency}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  rec.importance === "high"
                                    ? "bg-red-100 text-red-700"
                                    : rec.importance === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {rec.importance === "high" ? "高" : rec.importance === "medium" ? "中" : "低"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{rec.recommendation}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-700">落差</p>
                            <p className="text-lg font-bold text-orange-600">{rec.gap} 級</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 操作按鈕 */}
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                重新評估
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                下載評估報告
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
