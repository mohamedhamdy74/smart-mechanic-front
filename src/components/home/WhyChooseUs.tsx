import { Clock, Award, DollarSign, Wrench, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "خبرة عالية",
    description: "فريق من أفضل الميكانيكيين المتخصصين",
  },
  {
    icon: Clock,
    title: "سرعة الأداء",
    description: "خدمة سريعة وموثوقة بدون إضاعة وقتك",
  },
  {
    icon: DollarSign,
    title: "أسعار مناسبة",
    description: "خدمات بجودة عالية والأسعار تناسب الجميع",
  },
  {
    icon: Wrench,
    title: "صيانة شاملة",
    description: "كل أنواع الصيانة والإصلاحات",
  },
  {
    icon: Shield,
    title: "ضمان الجودة",
    description: "ضمان على جميع الخدمات والقطع",
  },
  {
    icon: Zap,
    title: "تشخيص AI",
    description: "تقنية ذكاء اصطناعي لتشخيص سريع",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            لماذا تختارنا؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نقدم أفضل خدمات الصيانة بأحدث التقنيات وأمهر الفنيين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-primary transition-all hover-lift hover-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
