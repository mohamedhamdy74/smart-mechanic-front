import { Wrench, Droplet, Battery, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نوفر مجموعة شاملة من خدمات الصيانة والإصلاح
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover-lift hover-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-4">
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-right">{service.title}</h3>
                  <p className="text-muted-foreground text-sm text-right mb-4">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-2 hover:border-primary hover:bg-primary/5"
          >
            <Link to="/services">عرض جميع الخدمات</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
