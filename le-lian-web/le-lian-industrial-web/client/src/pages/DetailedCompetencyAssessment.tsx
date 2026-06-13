import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, AlertCircle, Download } from 'lucide-react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { DETAILED_COMPETENCY_FRAMEWORK, type CompetencyItem } from '../data/competencyFramework';

export default function DetailedCompetencyAssessment() {
  const [employeeName, setEmployeeName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedCompetencies, setSelectedCompetencies] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const saveAssessmentMutation = trpc.adminDashboard.saveAssessment.useMutation();

  const positions = Object.keys(DETAILED_COMPETENCY_FRAMEWORK) as (keyof typeof DETAILED_COMPETENCY_FRAMEWORK)[];
  const currentPosition = selectedPosition ? DETAILED_COMPETENCY_FRAMEWORK[selectedPosition as keyof typeof DETAILED_COMPETENCY_FRAMEWORK] : null;

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleCompetency = (competencyId: string) => {
    const newSelected = new Set(selectedCompetencies);
    if (newSelected.has(competencyId)) {
      newSelected.delete(competencyId);
    } else {
      newSelected.add(competencyId);
    }
    setSelectedCompetencies(newSelected);
  };

  const handleAnalyze = () => {
    const newErrors: string[] = [];
    
    if (!employeeName.trim()) {
      newErrors.push('請輸入員工名稱');
    }
    if (!selectedPosition) {
      newErrors.push('請選擇職位');
    }
    if (selectedCompetencies.size === 0) {
      newErrors.push('請至少選擇一項職能');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setShowResults(true);
  };

  const handleSaveAssessment = async () => {
    if (!currentPosition || !gapAnalysis) return;

    setIsSaving(true);
    try {
      const assessmentData = JSON.stringify(
        Array.from(selectedCompetencies).map(id => ({
          id,
          selected: true
        }))
      );

      const department = currentPosition.category;
      const positionId = positions.indexOf(selectedPosition as keyof typeof DETAILED_COMPETENCY_FRAMEWORK);

      await saveAssessmentMutation.mutateAsync({
        employeeName: employeeName.trim(),
        department,
        positionId,
        positionName: selectedPosition,
        assessmentData,
        totalCompetencies: gapAnalysis.totalCompetencies,
        acquiredCompetencies: gapAnalysis.achievedCompetencies,
        gapCompetencies: gapAnalysis.gapCompetencies,
        completionPercentage: gapAnalysis.achievedPercentage,
        gapPercentage: gapAnalysis.gapPercentage,
        recommendations: gapAnalysis.missingCompetencies
          .slice(0, 3)
          .map(cat => `${cat.category}: ${cat.items.slice(0, 2).map(i => i.name).join('、')}`)
          .join('; '),
      });

      toast.success('評估結果已保存到資料庫');
      
      setEmployeeName('');
      setSelectedPosition('');
      setSelectedCompetencies(new Set());
      setShowResults(false);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast.error('保存評估結果失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateGapAnalysis = () => {
    if (!currentPosition) return null;

    const totalCompetencies = currentPosition.competencies.reduce((sum, cat) => sum + cat.items.length, 0);
    const achievedCompetencies = selectedCompetencies.size;
    const gapCompetencies = totalCompetencies - achievedCompetencies;
    const gapPercentage = Math.round((gapCompetencies / totalCompetencies) * 100);
    const achievedPercentage = 100 - gapPercentage;

    // 獲取缺失的職能
    const missingCompetencies: Array<{ category: string; items: CompetencyItem[] }> = [];
    currentPosition.competencies.forEach(cat => {
      const missingItems = cat.items.filter(item => !selectedCompetencies.has(item.id));
      if (missingItems.length > 0) {
        missingCompetencies.push({
          category: cat.category,
          items: missingItems
        });
      }
    });

    return {
      totalCompetencies,
      achievedCompetencies,
      gapCompetencies,
      gapPercentage,
      achievedPercentage,
      missingCompetencies,
      requiredLevel: currentPosition.requiredLevel
    };
  };

  const gapAnalysis = showResults ? calculateGapAnalysis() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/training">
          <a className="text-primary hover:text-primary/80 mb-6 inline-flex items-center gap-2">
            ← 返回人才培育
          </a>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 評估表單 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">職能評估表單</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 員工名稱 */}
                <div>
                  <label className="text-sm font-medium text-foreground">員工名稱 *</label>
                  <Input
                    placeholder="請輸入員工名稱"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* 職位選擇 */}
                <div>
                  <label className="text-sm font-medium text-foreground">職位 *</label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="選擇職位" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 職位信息 */}
                {currentPosition && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p><strong>部門：</strong>{currentPosition.category}</p>
                    <p><strong>等級：</strong>{currentPosition.level}</p>
                    <p><strong>要求等級：</strong>{currentPosition.requiredLevel} 級</p>
                  </div>
                )}

                {/* 錯誤提示 */}
                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    {errors.map((error, idx) => (
                      <div key={idx} className="flex gap-2 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 分析按鈕 */}
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!selectedPosition}
                >
                  開始分析
                </Button>

                {/* 統計信息 */}
                {currentPosition && (
                  <div className="text-sm text-foreground/60">
                    <p>已選擇職能：{selectedCompetencies.size} / {currentPosition.competencies.reduce((sum, cat) => sum + cat.items.length, 0)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 職能選擇區域 */}
          <div className="lg:col-span-2">
            {currentPosition ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">職能細項評估</CardTitle>
                  <p className="text-sm text-foreground/60 mt-2">請勾選您目前具備的職能</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentPosition.competencies.map(category => (
                    <div key={category.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium text-foreground">{category.category}</span>
                        {expandedCategories.has(category.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {expandedCategories.has(category.id) && (
                        <div className="border-t p-4 space-y-3 bg-slate-50">
                          {category.items.map(item => (
                            <div key={item.id} className="flex items-start gap-3">
                              <Checkbox
                                id={item.id}
                                checked={selectedCompetencies.has(item.id)}
                                onCheckedChange={() => toggleCompetency(item.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={item.id}
                                  className="text-sm font-medium text-foreground cursor-pointer"
                                >
                                  {item.name}
                                </label>
                                <p className="text-xs text-foreground/60 mt-1">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-foreground/60">
                  請先選擇職位以查看職能細項
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 分析結果 */}
        {showResults && gapAnalysis && (
          <div className="mt-8 space-y-6">
            {/* 結果摘要 */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl">職能落差分析結果</CardTitle>
                  <p className="text-sm text-foreground/60 mt-2">
                    {employeeName} - {selectedPosition}
                  </p>
                </div>
                <Button
                  onClick={handleSaveAssessment}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isSaving ? '保存中...' : '保存評估結果'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-foreground/60">已具備職能</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{gapAnalysis.achievedCompetencies}</p>
                    <p className="text-sm text-foreground/60 mt-1">{gapAnalysis.achievedPercentage}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-foreground/60">職能缺口</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{gapAnalysis.gapCompetencies}</p>
                    <p className="text-sm text-foreground/60 mt-1">{gapAnalysis.gapPercentage}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-foreground/60">總職能數</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{gapAnalysis.totalCompetencies}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-foreground/60">職位要求等級</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{gapAnalysis.requiredLevel}</p>
                    <p className="text-sm text-foreground/60 mt-1">級</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 缺失職能詳情 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">需要改善的職能</CardTitle>
                <p className="text-sm text-foreground/60 mt-2">以下職能需要通過培訓進行改善</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {gapAnalysis.missingCompetencies.map((cat, idx) => (
                  <div key={idx} className="border-l-4 border-orange-400 pl-4 py-2">
                    <h4 className="font-medium text-foreground mb-2">{cat.category}</h4>
                    <ul className="space-y-2">
                      {cat.items.map(item => (
                        <li key={item.id} className="text-sm text-foreground/70">
                          <span className="font-medium">{item.name}</span>
                          <p className="text-xs text-foreground/60 mt-1">{item.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 培訓建議 */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">培訓建議</CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/70 space-y-3">
                <p>根據職能落差分析，建議 {employeeName} 重點關注以下方面：</p>
                <ol className="list-decimal list-inside space-y-2">
                  {gapAnalysis.missingCompetencies.slice(0, 3).map((cat, idx) => (
                    <li key={idx}>
                      <strong>{cat.category}</strong>：建議參加相關培訓課程，重點學習 {cat.items.slice(0, 2).map(i => i.name).join('、')} 等內容
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm">建議培訓時間：3-6 個月，根據實際情況進行調整。</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
