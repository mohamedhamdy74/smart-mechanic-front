import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "أساسي",
    price: "1500",
    description: "خدمة دورية وصيانة أساسية",
    features: [
      "فحص عام للسيارة",
      "تغيير زيت المحرك",
      "فحص الفرامل",
      "ضمان 30 يوم",
    ],
    highlighted: false,
  },
  {
    name: "متوسط",
    price: "3000",
    description: "خدمة متقدمة + فحص شامل",
    features: [
      "كل مميزات الخطة الأساسية",
      "فحص شامل بالكمبيوتر",
      "تنظيف المحرك",
      "ضمان 60 يوم",
      "خصم 15% على القطع",
    ],
    highlighted: true,
  },
  {
    name: "متكامل",
    price: "4500",
    description: "خدمة شاملة لكل الصيانة والتحديثات",
    features: [
      "كل مميزات الخطة المتوسطة",
      "صيانة كاملة",
      "تنظيف وتلميع",
      "ضمان 90 يوم",
      "أولوية في المواعيد",
      "خصم 25% على القطع",
    ],
    highlighted: false,
  },
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-muted/20 dark:bg-gray-900/20 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 animate-bounce-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">خطط الأسعار</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجات سيارتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-3xl p-10 border-2 transition-all duration-500 hover-lift animate-fade-in-up shadow-xl hover:shadow-xl hover:scale-105 ${
                plan.highlighted
                  ? "border-primary shadow-primary bg-gradient-to-br from-primary/5 to-orange-500/5"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  الأكثر شعبية
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-3">{plan.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-lg text-muted-foreground">جنيه</span>
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                </div>
                <p className="text-base text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 pb-1">
                    <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base flex-1 text-right leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-full py-6 text-lg font-semibold transition-all duration-300 hover-lift shadow-lg ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white"
                    : "hover:bg-primary hover:text-white border-2 hover:border-primary"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link to="/auth?mode=register">اختر الخطة</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
