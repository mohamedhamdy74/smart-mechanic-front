import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Services } from "@/components/home/Services";
import { Pricing } from "@/components/home/Pricing";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <WhyChooseUs />
        <Services />
        <Pricing />
      </main>
      <Footer />
      <FloatingChatButton />

    </div>
  );
};

export default Index;
