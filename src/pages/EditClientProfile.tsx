import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component is disabled - profile editing is no longer allowed

const EditClientProfile = () => {
  const navigate = useNavigate();

  // Profile editing is disabled - redirect to profile page
  useEffect(() => {
    navigate('/profile/client');
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">تعديل الملف الشخصي غير متاح</h3>
          <p className="text-muted-foreground mb-4">تم إلغاء ميزة تعديل الملف الشخصي</p>
          <Button onClick={() => navigate('/profile/client')} className="rounded-full">
            العودة للملف الشخصي
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};


export default EditClientProfile;
