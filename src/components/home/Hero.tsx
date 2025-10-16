import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-mechanic.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 md:order-1 text-right animate-slide-up">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary font-semibold text-sm">خدمة السيارات</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              أفضل خدمات الصيانة
              <br />
              <span className="text-gradient-primary">لعربيتك</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              مع Smart Mechanic تقدر تلاقي كل الخدمات اللي عربيتك محتاجها في مكان واحد. من صيانة وتجليد وتلميع، كله تحت سقف واحد!
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-8 hover-lift hover-glow"
              >
                <Link to="/services">
                  احجز الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-2 hover:border-primary hover:bg-primary/5"
              >
                <Link to="/ai-diagnosis">
                  تعرف أكثر
                  <MessageSquare className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-card rounded-2xl border border-border hover-lift">
                <div className="text-3xl font-bold text-primary mb-1">+500</div>
                <div className="text-sm text-muted-foreground">عامل</div>
              </div>
              <div className="text-center p-4 bg-card rounded-2xl border border-border hover-lift">
                <div className="text-3xl font-bold text-primary mb-1">+1200</div>
                <div className="text-sm text-muted-foreground">خدمة مكتملة</div>
              </div>
              <div className="text-center p-4 bg-card rounded-2xl border border-border hover-lift">
                <div className="text-3xl font-bold text-primary mb-1">+10</div>
                <div className="text-sm text-muted-foreground">سنوات خبرة</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-20 blur-2xl" />
              <img
                src={heroImage}
                alt="Smart Mechanic"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
