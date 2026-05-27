import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Download, Search, Filter, BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DEPARTMENTS = [
  '廠務部',
  '製造部',
  '品保部',
  '資材部',
  '業務部',
  '研發部',
  '總務部',
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AdminDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  // 獲取所有評估結果
  const allResultsQuery = trpc.adminDashboard.getAllResults.useQuery({
    limit: 1000,
    offset: 0,
  });

  // 獲取公司統計
  const companyStatsQuery = trpc.adminDashboard.getCompanyStats.useQuery();

  // 獲取部門統計
  const departmentStatsQuery = trpc.adminDashboard.getDepartmentStats.useQuery(
    { department: selectedDepartment },
    { enabled: !!selectedDepartment }
  );

  // 過濾和搜尋結果
  const filteredResults = useMemo(() => {
    if (!allResultsQuery.data) return [];
    
    let results = allResultsQuery.data;
    
    if (selectedDepartment) {
      results = results.filter(r => r.department === selectedDepartment);
    }
    
    if (searchEmployee) {
      results = results.filter(r => 
        r.employeeName.toLowerCase().includes(searchEmployee.toLowerCase())
      );
    }
    
    return results;
  }, [allResultsQuery.data, selectedDepartment, searchEmployee]);

  // 準備圖表數據 - 部門職能對比
  const departmentChartData = useMemo(() => {
    if (!allResultsQuery.data) return [];
    
    const deptMap: Record<string, { dept: string; completion: number; gap: number; count: number }> = {};
    
    allResultsQuery.data.forEach(result => {
      if (!deptMap[result.department]) {
        deptMap[result.department] = { dept: result.department, completion: 0, gap: 0, count: 0 };
      }
      deptMap[result.department].completion += result.completionPercentage;
      deptMap[result.department].gap += result.gapPercentage;
      deptMap[result.department].count += 1;
    });
    
    return Object.values(deptMap).map(d => ({
      dept: d.dept,
      avgCompletion: Math.round(d.completion / d.count),
      avgGap: Math.round(d.gap / d.count),
      employees: d.count,
    }));
  }, [allResultsQuery.data]);

  // 準備圖表數據 - 職能完成度分佈
  const completionDistribution = useMemo(() => {
    if (!allResultsQuery.data) return [];
    
    const ranges = [
      { range: '0-20%', count: 0 },
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-80%', count: 0 },
      { range: '80-100%', count: 0 },
    ];
    
    allResultsQuery.data.forEach(result => {
      const completion = result.completionPercentage;
      if (completion <= 20) ranges[0].count++;
      else if (completion <= 40) ranges[1].count++;
      else if (completion <= 60) ranges[2].count++;
      else if (completion <= 80) ranges[3].count++;
      else ranges[4].count++;
    });
    
    return ranges;
  }, [allResultsQuery.data]);

  // 導出 Excel
  const handleExportExcel = async () => {
    try {
      // 動態導入 xlsx
      const XLSX = await import('xlsx');
      
      // 準備數據
      const data = filteredResults.map(result => ({
        '員工名稱': result.employeeName,
        '部門': result.department,
        '職位': result.positionName,
        '已具備職能': result.acquiredCompetencies,
        '職能缺口': result.gapCompetencies,
        '總職能數': result.totalCompetencies,
        '完成度%': result.completionPercentage,
        '缺口%': result.gapPercentage,
        '評估日期': new Date(result.assessmentDate).toLocaleDateString('zh-TW'),
      }));
      
      // 建立工作簿
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '評估結果');
      
      // 設定列寬
      ws['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
      ];
      
      // 導出文件
      XLSX.writeFile(wb, `職能評估結果_${new Date().toLocaleDateString('zh-TW')}.xlsx`);
      toast.success('Excel 報表已導出');
    } catch (error) {
      console.error('Failed to export Excel:', error);
      toast.error('導出 Excel 失敗');
    }
  };

  const isLoading = allResultsQuery.isLoading || companyStatsQuery.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 頁面頭部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/training">
              <a className="text-primary hover:text-primary/80 mb-4 inline-flex items-center gap-2 text-sm">
                ← 返回人才培育
              </a>
            </Link>
            <h1 className="text-4xl font-bold text-foreground">管理員儀表板</h1>
            <p className="text-foreground/60 mt-2">職能評估結果分析與管理</p>
          </div>
          <Button
            onClick={handleExportExcel}
            disabled={filteredResults.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            導出 Excel
          </Button>
        </div>

        {/* 公司統計卡片 */}
        {companyStatsQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">總員工數</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {companyStatsQuery.data.totalEmployees}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">部門數量</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {companyStatsQuery.data.totalDepartments}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">平均完成度</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {companyStatsQuery.data.avgCompletion}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">平均缺口</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {companyStatsQuery.data.avgGap}%
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 篩選和搜尋 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              篩選與搜尋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">部門</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇部門" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部部門</SelectItem>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">員工名稱</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <Input
                    placeholder="搜尋員工名稱"
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">檢視模式</label>
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'chart')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">列表檢視</SelectItem>
                    <SelectItem value="chart">圖表檢視</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-foreground/60">
              共 {filteredResults.length} 條評估結果
            </div>
          </CardContent>
        </Card>

        {/* 圖表檢視 */}
        {viewMode === 'chart' && (
          <div className="space-y-8 mb-8">
            {/* 部門職能對比 */}
            <Card>
              <CardHeader>
                <CardTitle>部門職能對比分析</CardTitle>
              </CardHeader>
              <CardContent>
                {departmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dept" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgCompletion" fill="#10b981" name="平均完成度%" />
                      <Bar dataKey="avgGap" fill="#ef4444" name="平均缺口%" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-foreground/60">
                    暫無數據
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 職能完成度分佈 */}
            <Card>
              <CardHeader>
                <CardTitle>職能完成度分佈</CardTitle>
              </CardHeader>
              <CardContent>
                {completionDistribution.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={completionDistribution}
                        dataKey="count"
                        nameKey="range"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {completionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-foreground/60">
                    暫無數據
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 列表檢視 */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>評估結果列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-foreground/60">
                  加載中...
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">員工名稱</th>
                        <th className="text-left py-3 px-4 font-medium">部門</th>
                        <th className="text-left py-3 px-4 font-medium">職位</th>
                        <th className="text-center py-3 px-4 font-medium">已具備</th>
                        <th className="text-center py-3 px-4 font-medium">缺口</th>
                        <th className="text-center py-3 px-4 font-medium">完成度</th>
                        <th className="text-center py-3 px-4 font-medium">缺口%</th>
                        <th className="text-left py-3 px-4 font-medium">評估日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-slate-50">
                          <td className="py-3 px-4">{result.employeeName}</td>
                          <td className="py-3 px-4">{result.department}</td>
                          <td className="py-3 px-4">{result.positionName}</td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium">
                              {result.acquiredCompetencies}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-medium">
                              {result.gapCompetencies}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${result.completionPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{result.completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-orange-600 font-medium">
                            {result.gapPercentage}%
                          </td>
                          <td className="py-3 px-4 text-foreground/60">
                            {new Date(result.assessmentDate).toLocaleDateString('zh-TW')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-foreground/60">
                  {isLoading ? '加載中...' : '暫無評估結果'}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
