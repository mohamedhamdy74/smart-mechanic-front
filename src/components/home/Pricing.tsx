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
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">خطط الأسعار</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجات سيارتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl p-8 border-2 transition-all hover-lift animate-slide-up ${
                plan.highlighted
                  ? "border-primary shadow-primary"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  الأكثر شعبية
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-sm text-muted-foreground">جنيه</span>
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm flex-1 text-right">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-full ${
                  plan.highlighted
                    ? "bg-primary hover:bg-primary-hover"
                    : ""
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
