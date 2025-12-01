import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Services } from "@/components/home/Services";
import { Pricing } from "@/components/home/Pricing";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { useAuth } from "@/contexts/SimpleAuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
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
