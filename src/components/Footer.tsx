import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoIcon} alt="Smart Mechanic" className="h-12 w-12" />
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-primary">SMART</span>
                <span className="text-xl font-bold">MECHANIC</span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md text-right">
              مركز صيانة شامل — خبرة أكثر من 10 سنوات في ميكانيكا وكهرباء السيارات.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold">
              <Phone className="h-5 w-5" />
              <span dir="ltr">1800 100 900</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">الخدمات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  تغيير الزيت
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  فرامل
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  كهرباء
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  ميزان وترصيص
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">الشركة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  المدونة
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2025 Smart Mechanic. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};
