import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Initialize() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);

  const initMutation = trpc.init.seedData.useMutation();

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await initMutation.mutateAsync();
      setInitResult(result);
    } catch (error) {
      setInitResult({
        success: false,
        message: "初始化失敗，請稍後重試",
      });
      console.error(error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">系統初始化</h1>
          <p className="text-lg text-slate-600">初始化職位和職能數據，使員工能夠進行職能評估</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle>一鍵初始化數據</CardTitle>
            <CardDescription>點擊下方按鈕初始化所有職位和 iCAP 職能數據</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {!initResult && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">初始化內容：</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ 37 個職位（廠務、製造、品質、資材、採購、總務、業務、研發等）</li>
                    <li>✓ 15 個 iCAP 職能（基於金屬製造業標準）</li>
                    <li>✓ 每個職位的職能要求和重要性評級</li>
                  </ul>
                </div>

                <Button
                  onClick={handleInitialize}
                  disabled={isInitializing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      初始化中...
                    </>
                  ) : (
                    "開始初始化"
                  )}
                </Button>
              </div>
            )}

            {initResult && (
              <div className="space-y-4">
                {initResult.success ? (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">{initResult.message}</p>
                      <p className="text-sm text-green-700 mt-1">
                        現在您可以返回職能評估頁面，選擇職位進行員工評估。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">{initResult.message}</p>
                      <p className="text-sm text-red-700 mt-1">請檢查數據庫連接或稍後重試。</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setInitResult(null);
                    window.location.href = "/employee-self-assessment";
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  返回職能評估
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
