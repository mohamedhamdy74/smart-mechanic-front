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
    <section className="py-20 bg-muted/20 dark:bg-gray-900/20 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-bounce-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            لماذا تختارنا؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نقدم أفضل خدمات الصيانة بأحدث التقنيات وأمهر الفنيين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-card rounded-3xl border border-border hover:border-primary transition-all duration-500 hover-lift animate-fade-in-up shadow-lg hover:shadow-xl hover:scale-105"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl group-hover:from-primary/15 group-hover:to-orange-500/15 transition-all duration-300">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-xl mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed pb-2">
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
