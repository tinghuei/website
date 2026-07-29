import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// 定義所有職位和對應的職能要求
const POSITIONS_DATA = {
  "廠務經理": {
    department: "廠務部",
    requiredCompetencies: ["領導能力", "安全管理", "成本控制", "溝通協調", "問題解決"],
  },
  "廠務副理": {
    department: "廠務部",
    requiredCompetencies: ["領導能力", "安全管理", "成本控制", "溝通協調"],
  },
  "設備工程師": {
    department: "廠務部",
    requiredCompetencies: ["機械設備操作", "技術文檔", "問題解決", "安全管理"],
  },
  "廠務助理": {
    department: "廠務部",
    requiredCompetencies: ["安全管理", "機械設備操作", "溝通協調"],
  },
  "製造課長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "生產計畫", "品質管理", "成本控制", "安全管理"],
  },
  "製造副課長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "生產計畫", "品質管理", "安全管理"],
  },
  "資材課長": {
    department: "資材部",
    requiredCompetencies: ["採購管理", "領導能力", "成本控制", "數據分析"],
  },
  "資材副課長": {
    department: "資材部",
    requiredCompetencies: ["採購管理", "成本控制", "溝通協調"],
  },
  "採購助理": {
    department: "資材部",
    requiredCompetencies: ["採購管理", "溝通協調", "時間管理"],
  },
  "採購專員": {
    department: "資材部",
    requiredCompetencies: ["採購管理", "溝通協調", "成本控制"],
  },
  "生管": {
    department: "製造部",
    requiredCompetencies: ["生產計畫", "數據分析", "溝通協調"],
  },
  "物管": {
    department: "製造部",
    requiredCompetencies: ["採購管理", "時間管理", "溝通協調"],
  },
  "成倉": {
    department: "製造部",
    requiredCompetencies: ["時間管理", "安全管理", "溝通協調"],
  },
  "技術員": {
    department: "製造部",
    requiredCompetencies: ["機械設備操作", "品質管理", "安全管理"],
  },
  "班長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理", "溝通協調"],
  },
  "副組長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理"],
  },
  "組長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理", "品質管理"],
  },
  "加工組組長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理", "品質管理", "問題解決"],
  },
  "沖床組組長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理", "品質管理", "問題解決"],
  },
  "塗裝組組長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理", "品質管理", "問題解決"],
  },
  "組立組組長": {
    department: "製造部",
    requiredCompetencies: ["領導能力", "機械設備操作", "安全管理", "品質管理", "問題解決"],
  },
  "品保課課長": {
    department: "品質部",
    requiredCompetencies: ["品質管理", "領導能力", "數據分析", "溝通協調"],
  },
  "品保課副課長": {
    department: "品質部",
    requiredCompetencies: ["品質管理", "數據分析", "溝通協調"],
  },
  "品檢員": {
    department: "品質部",
    requiredCompetencies: ["品質管理", "技術文檔", "安全管理"],
  },
  "總務課課長": {
    department: "總務部",
    requiredCompetencies: ["人力資源管理", "領導能力", "溝通協調", "財務管理"],
  },
  "總務課副課長": {
    department: "總務部",
    requiredCompetencies: ["人力資源管理", "溝通協調", "財務管理"],
  },
  "總務專員": {
    department: "總務部",
    requiredCompetencies: ["人力資源管理", "溝通協調", "時間管理"],
  },
  "總務助理": {
    department: "總務部",
    requiredCompetencies: ["溝通協調", "時間管理"],
  },
  "人資助理": {
    department: "總務部",
    requiredCompetencies: ["人力資源管理", "溝通協調"],
  },
  "人資專員": {
    department: "總務部",
    requiredCompetencies: ["人力資源管理", "溝通協調", "時間管理"],
  },
  "庶務組長": {
    department: "總務部",
    requiredCompetencies: ["領導能力", "溝通協調", "時間管理"],
  },
  "庶務員": {
    department: "總務部",
    requiredCompetencies: ["時間管理", "溝通協調"],
  },
  "清潔員": {
    department: "總務部",
    requiredCompetencies: ["安全管理", "時間管理"],
  },
  "業務課組長": {
    department: "業務部",
    requiredCompetencies: ["領導能力", "客戶服務", "溝通協調", "成本控制"],
  },
  "業務助理": {
    department: "業務部",
    requiredCompetencies: ["客戶服務", "溝通協調", "時間管理"],
  },
  "業務專員": {
    department: "業務部",
    requiredCompetencies: ["客戶服務", "溝通協調", "問題解決"],
  },
  "研發課課長": {
    department: "研發部",
    requiredCompetencies: ["領導能力", "技術文檔", "問題解決", "溝通協調"],
  },
  "研發課副課長": {
    department: "研發部",
    requiredCompetencies: ["技術文檔", "問題解決", "溝通協調"],
  },
  "研發工程師": {
    department: "研發部",
    requiredCompetencies: ["技術文檔", "問題解決", "數據分析"],
  },
  "文管中心": {
    department: "總經理室",
    requiredCompetencies: ["溝通協調", "時間管理", "客戶服務"],
  },
  "營業部經理": {
    department: "營業部",
    requiredCompetencies: ["領導能力", "客戶服務", "成本控制", "溝通協調"],
  },
  "總經理室秘書": {
    department: "總經理室",
    requiredCompetencies: ["溝通協調", "時間管理", "客戶服務", "財務管理"],
  },
  "總經理室副理": {
    department: "總經理室",
    requiredCompetencies: ["領導能力", "溝通協調", "問題解決", "財務管理", "時間管理"],
  },
};

// 所有可用的職能
const ALL_COMPETENCIES = [
  "機械設備操作",
  "品質管理",
  "生產計畫",
  "成本控制",
  "安全管理",
  "溝通協調",
  "領導能力",
  "問題解決",
  "時間管理",
  "客戶服務",
  "技術文檔",
  "數據分析",
  "採購管理",
  "人力資源管理",
  "財務管理",
];

interface AssessmentResult {
  employeeName: string;
  position: string;
  department: string;
  totalRequired: number;
  currentLevel: number;
  gapCount: number;
  gapPercentage: number;
  missingCompetencies: string[];
  recommendations: string[];
}

export default function CompetencyAssessment() {
  const [employeeName, setEmployeeName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedCompetencies, setSelectedCompetencies] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCompetencyToggle = (competency: string) => {
    const newSelected = new Set(selectedCompetencies);
    if (newSelected.has(competency)) {
      newSelected.delete(competency);
    } else {
      newSelected.add(competency);
    }
    setSelectedCompetencies(newSelected);
  };

  const handleAnalyze = () => {
    if (!employeeName.trim() || !selectedPosition) {
      alert("請輸入員工名稱並選擇職位");
      return;
    }

    const positionData = POSITIONS_DATA[selectedPosition as keyof typeof POSITIONS_DATA];
    if (!positionData) {
      alert("無效的職位選擇");
      return;
    }

    const requiredCompetencies = positionData.requiredCompetencies;
    const missingCompetencies = requiredCompetencies.filter(
      (comp) => !selectedCompetencies.has(comp)
    );

    const gapCount = missingCompetencies.length;
    const gapPercentage = (gapCount / requiredCompetencies.length) * 100;

    // 生成建議
    const recommendations = missingCompetencies.map((comp) => {
      const suggestions: Record<string, string> = {
        "領導能力": "建議參加領導力培訓課程，學習團隊管理和決策能力",
        "安全管理": "建議參加安全管理認證課程，了解工作場所安全標準",
        "成本控制": "建議學習成本分析和預算管理方法",
        "溝通協調": "建議參加溝通技巧工作坊，提升跨部門協作能力",
        "問題解決": "建議參加問題解決和創新思維培訓",
        "機械設備操作": "建議參加設備操作認證培訓課程",
        "品質管理": "建議學習 ISO 品質管理體系和持續改善方法",
        "生產計畫": "建議參加生產計畫和物流管理課程",
        "時間管理": "建議參加時間管理和效率提升工作坊",
        "客戶服務": "建議參加客戶服務和溝通技巧培訓",
        "技術文檔": "建議學習技術寫作和文檔管理",
        "數據分析": "建議參加數據分析和 Excel 進階課程",
        "採購管理": "建議參加採購管理和供應鏈優化課程",
        "人力資源管理": "建議參加人力資源管理和員工發展課程",
        "財務管理": "建議參加財務管理和預算控制課程",
      };
      return suggestions[comp] || `建議加強 ${comp} 的培訓`;
    });

    const assessmentResult: AssessmentResult = {
      employeeName,
      position: selectedPosition,
      department: positionData.department,
      totalRequired: requiredCompetencies.length,
      currentLevel: requiredCompetencies.length - gapCount,
      gapCount,
      gapPercentage,
      missingCompetencies,
      recommendations,
    };

    setResult(assessmentResult);
    setShowResult(true);
  };

  const handleReset = () => {
    setEmployeeName("");
    setSelectedPosition("");
    setSelectedCompetencies(new Set());
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">職能落差分析</h1>
          <p className="text-lg text-slate-600">評估員工職能與職位要求的差距，制定培訓計畫</p>
        </div>

        {!showResult ? (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle>員工職能評估</CardTitle>
              <CardDescription>請填寫員工信息並勾選已具備的職能</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* 員工名稱 */}
              <div className="space-y-2">
                <Label htmlFor="employeeName" className="text-base font-medium">
                  員工名稱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employeeName"
                  placeholder="請輸入員工名稱"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* 職位選擇 */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-base font-medium">
                  職位 <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger id="position" className="text-base">
                    <SelectValue placeholder="請選擇職位" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(POSITIONS_DATA).map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 職能勾選 */}
              {selectedPosition && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-3">
                      該職位需要的職能：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POSITIONS_DATA[selectedPosition as keyof typeof POSITIONS_DATA]?.requiredCompetencies.map(
                        (comp) => (
                          <span
                            key={comp}
                            className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium"
                          >
                            {comp}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      請勾選員工已具備的職能：
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                      {POSITIONS_DATA[selectedPosition as keyof typeof POSITIONS_DATA]?.requiredCompetencies.map(
                        (competency) => (
                          <div key={competency} className="flex items-center space-x-2">
                            <Checkbox
                              id={competency}
                              checked={selectedCompetencies.has(competency)}
                              onCheckedChange={() => handleCompetencyToggle(competency)}
                            />
                            <Label htmlFor={competency} className="font-normal cursor-pointer">
                              {competency}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 按鈕 */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!employeeName.trim() || !selectedPosition}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  開始分析
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : result ? (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                職能落差分析結果
              </CardTitle>
              <CardDescription>
                {result.employeeName} - {result.position} ({result.department})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* 統計信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">職能總數</p>
                  <p className="text-2xl font-bold text-blue-600">{result.totalRequired}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">已具備</p>
                  <p className="text-2xl font-bold text-green-600">{result.currentLevel}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">缺口數量</p>
                  <p className="text-2xl font-bold text-orange-600">{result.gapCount}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">缺口百分比</p>
                  <p className="text-2xl font-bold text-red-600">{result.gapPercentage.toFixed(1)}%</p>
                </div>
              </div>

              {/* 缺少的職能 */}
              {result.missingCompetencies.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900 mb-2">需要改善的職能：</p>
                      <div className="flex flex-wrap gap-2">
                        {result.missingCompetencies.map((comp) => (
                          <span
                            key={comp}
                            className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-sm font-medium"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 培訓建議 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-900">培訓建議：</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 按鈕 */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  進行新的評估
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
