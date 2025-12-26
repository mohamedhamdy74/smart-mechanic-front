import { Wrench, Droplet, Battery, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import engineRepairImg from "@/assets/services/engine-repair.jpg";
import oilChangeImg from "@/assets/services/oil-change.jpg";
import tireServiceImg from "@/assets/services/tire-service.jpg";
import batteryServiceImg from "@/assets/services/battery-service.jpg";

const services = [
  {
    icon: Wrench,
    title: "إصلاح المحركات",
    description: "إصلاح المحرك وتبديل القطع الغيار باحترافية",
    image: engineRepairImg,
  },
  {
    icon: Droplet,
    title: "تغيير الزيوت",
    description: "خدمة تغيير الزيت والفلاتر بأعلى جودة",
    image: oilChangeImg,
  },
  {
    icon: Settings,
    title: "إطارات وفرامل",
    description: "تركيب الإطارات وفحص الفرامل بدقة عالية",
    image: tireServiceImg,
  },
  {
    icon: Battery,
    title: "كهرباء وبطاريات",
    description: "فحص وتبديل البطاريات والكهرباء",
    image: batteryServiceImg,
  },
];

export const Services = () => {
  const { user } = useAuth();

  // Check if user is workshop or mechanic
  const hideServicesButton = user?.role === 'workshop' || user?.role === 'mechanic';

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 dark:from-black dark:to-gray-900/30 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">خدماتنا</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نوفر مجموعة شاملة من خدمات الصيانة والإصلاح
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary transition-all duration-500 hover-lift animate-fade-in-up shadow-lg hover:shadow-xl hover:scale-105"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex items-end justify-center pb-6">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl mb-4 text-right">{service.title}</h3>
                  <p className="text-muted-foreground text-base text-right leading-relaxed pb-2">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!hideServicesButton && (
          <div className="text-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 hover:border-primary hover:bg-primary/5 px-8 py-6 text-lg font-semibold hover-lift transition-all duration-300"
            >
              <Link to="/services">عرض جميع الخدمات</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
