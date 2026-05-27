import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Contact Page - Contact Information & Form
 * Design: Industrial Minimalist - Professional contact interface
 */

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const submitMutation = trpc.contact.submit.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        message: formData.message,
      });
      
      toast.success("感謝您的來信，我們將盡快回覆您。");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      toast.error("提交失敗，請稍後重試");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
          <h1 className="text-5xl font-bold text-primary">聯絡我們</h1>
          <p className="text-lg text-foreground/70 mt-4">我們很樂意聽取您的想法與建議</p>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Phone */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">電話</h3>
              <p className="text-foreground/80 mb-2">(08) 866-9966</p>
              <p className="text-sm text-foreground/60">營業時間：週一至週五 09:00-18:00</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">電子郵件</h3>
              <p className="text-foreground/80 mb-2">待補充</p>
              <p className="text-sm text-foreground/60">我們將在 24 小時內回覆</p>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">公司地址</h3>
              <p className="text-foreground/80 mb-2">屏東縣枋寮鄉精進路37號</p>
              <p className="text-sm text-foreground/60">樂聯工業股份有限公司</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">聯絡表單</h2>
          
          <form onSubmit={handleSubmit} className="bg-background rounded-lg p-8 shadow-sm border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  姓名 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="請輸入您的姓名"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  電子郵件 <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="請輸入您的電子郵件"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  電話
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="請輸入您的電話"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  公司名稱
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="請輸入您的公司名稱"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                訊息 <span className="text-accent">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="請輸入您的訊息"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white"
              >
                送出訊息
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">其他聯絡方式</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4">業務洽詢</h3>
              <p className="text-foreground/80 mb-4">
                對我們的產品與服務感興趣？聯絡我們的業務團隊，瞭解如何為您的業務提供支援。
              </p>
              <p className="text-foreground/80 text-sm">
                電話：(08) 866-9966<br />
                部門：營業部
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4">技術支援</h3>
              <p className="text-foreground/80 mb-4">
                需要技術支援或售後服務？我們的技術團隊隨時準備幫助您。
              </p>
              <p className="text-foreground/80 text-sm">
                電話：(08) 866-9966<br />
                部門：研發課
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4">人力資源</h3>
              <p className="text-foreground/80 mb-4">
                有興趣加入樂聯工業團隊？歡迎投遞您的履歷與自傳。
              </p>
              <p className="text-foreground/80 text-sm">
                電話：(08) 866-9966<br />
                部門：總務課 / 人資
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold text-primary mb-4">一般查詢</h3>
              <p className="text-foreground/80 mb-4">
                有任何其他問題或建議？我們很樂意聽取您的意見。
              </p>
              <p className="text-foreground/80 text-sm">
                電話：(08) 866-9966<br />
                部門：秘書室
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-3xl">
          <div className="bg-background rounded-lg p-8 border-l-4 border-accent">
            <h3 className="text-xl font-bold text-primary mb-4">回覆時間</h3>
            <p className="text-foreground/80 mb-4">
              我們致力於提供快速且專業的客戶服務。以下是我們的典型回覆時間：
            </p>
            <ul className="space-y-3 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>營業時間內的查詢：</strong>通常在 2-4 小時內回覆</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>營業時間外的查詢：</strong>將在下一個營業日回覆</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>緊急事項：</strong>請直接撥打我們的緊急聯絡電話</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
