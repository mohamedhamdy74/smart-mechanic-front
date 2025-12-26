import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Phone, Mail, MapPin, Wrench, LogIn, AlertTriangle, MessageCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import MapComponent from "@/features/map/MapComponent";
import ChatComponent from "@/features/chat/ChatComponent";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Mechanics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [realMechanics, setRealMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0);
  const [selectedMechanicForChat, setSelectedMechanicForChat] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const mechanicsPerPage = 12;

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      setServiceFilter(serviceParam);
      setSpecializationFilter(serviceParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch(`http://localhost:5000/users/mechanics/public?page=${currentPage}&limit=${mechanicsPerPage}`)
      .then(res => res.json())
      .then(data => console.log("🔍 Raw API Data:", data))
      .catch(err => console.error("❌ Fetch error:", err));
  }, []);

  const { data: mechanicsResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['mechanics', currentPage, mechanicsPerPage],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/users/mechanics/public?page=${currentPage}&limit=${mechanicsPerPage}`);
      if (!response.ok) throw new Error('فشل في تحميل بيانات الميكانيكيين');
      const data = await response.json();
      return {
        mechanics: data.mechanics || [],
        total: data.total || 0,
        pages: data.pages || 1,
        page: data.page || 1
      };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    retry: 1,
  });

  useEffect(() => {
    if (mechanicsResponse) {
      setRealMechanics(mechanicsResponse.mechanics);
      setTotalPages(mechanicsResponse.pages);
      setMapRefreshTrigger(prev => prev + 1);
    }
  }, [mechanicsResponse]);

  useEffect(() => {
    setLoading(isLoading);
    if (queryError) {
      setError(queryError.message);
    }
  }, [isLoading, queryError]);

  const filteredMechanics = useMemo(() => {
    return realMechanics.filter((mechanic) => {
      const matchesSearch = mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mechanic.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mechanic.services.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesServiceFilter = !serviceFilter ||
        mechanic.services.some((service: string) =>
          service.toLowerCase().includes(serviceFilter.toLowerCase()) ||
          serviceFilter.toLowerCase().includes(service.toLowerCase())
        );

      const matchesSpecialization = specializationFilter === "" || specializationFilter === "all" ||
        mechanic.services.some((service: string) =>
          service.toLowerCase().includes(specializationFilter.toLowerCase()) ||
          specializationFilter.toLowerCase().includes(service.toLowerCase())
        );

      return matchesSearch && matchesServiceFilter && matchesSpecialization;
    });
  }, [realMechanics, searchTerm, serviceFilter, specializationFilter]);

  const specializations = useMemo(() => {
    return [...new Set(realMechanics.flatMap(m => m.services))];
  }, [realMechanics]);

  const handleMechanicSelect = (mechanic: any) => {
    navigate(`/mechanic-public/${mechanic.id}`);
  };

  const handleChatWithMechanic = (mechanic: any) => {
    if (user && user.role === 'client') {
      setSelectedMechanicForChat(mechanic);
      setShowChat(true);
    } else {
      toast.error("يجب تسجيل الدخول كعميل أولاً للدردشة");
      navigate('/auth?mode=login');
    }
  };

  useEffect(() => {
    const handleViewMechanicProfile = (event: any) => {
      const mechanicId = event.detail;
      navigate(`/mechanic-public/${mechanicId}`);
    };

    const handleChatWithMechanicEvent = (event: any) => {
      const mechanicId = event.detail;
      const mechanic = realMechanics.find(m => m.id === mechanicId);
      if (mechanic) {
        handleChatWithMechanic(mechanic);
      }
    };

    window.addEventListener('viewMechanicProfile', handleViewMechanicProfile);
    window.addEventListener('chatWithMechanic', handleChatWithMechanicEvent);

    return () => {
      window.removeEventListener('viewMechanicProfile', handleViewMechanicProfile);
      window.removeEventListener('chatWithMechanic', handleChatWithMechanicEvent);
    };
  }, [realMechanics, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {serviceFilter ? `ميكانيكيين متخصصين في ${serviceFilter}` : 'الميكانيكيين المتاحين'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              {serviceFilter
                ? `اختر الميكانيكي المناسب لخدمة ${serviceFilter} من بين أفضل المتخصصين في المنطقة`
                : 'اختر الميكانيكي المناسب لسيارتك من بين أفضل المتخصصين في المنطقة'
              }
            </p>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث بالاسم أو التخصص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 rounded-full h-12"
                />
              </div>

              <div className="flex justify-center gap-4">
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger className="w-64 rounded-full">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التخصصات</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowMap(!showMap)}
                  variant={showMap ? "default" : "outline"}
                  className="rounded-full px-6"
                >
                  <MapPin className="h-4 w-4 ml-2" />
                  {showMap ? 'إخفاء الخريطة' : 'عرض الخريطة'}
                </Button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6 border border-border/50">
                  <div className="bg-muted/50 rounded-xl h-32 mb-4 overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="text-right mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">حدث خطأ في تحميل البيانات</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="rounded-full">
                إعادة المحاولة
              </Button>
            </div>
          )}

          {showMap && !loading && !error && (
            <div className="mb-12">
              <Card className="p-6">
                <MapComponent
                  onMechanicSelect={handleMechanicSelect}
                  onChatWithMechanic={handleChatWithMechanic}
                  refreshTrigger={mapRefreshTrigger}
                />
              </Card>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMechanics.map((mechanic, index) => (
                <Card
                  key={mechanic.id}
                  className="group bg-card/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-border/50 dark:border-gray-700/50 hover:border-primary transition-all hover-lift hover-glow animate-slide-up transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div
                    className="bg-muted/50 rounded-xl h-32 mb-4 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/mechanic-public/${mechanic.id}`)}
                  >
                    {mechanic.image ? (
                      <img
                        src={mechanic.image}
                        alt={mechanic.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="text-right mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(mechanic.rating)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                              }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({mechanic.reviews})
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{mechanic.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {mechanic.level}
                      </Badge>
                    </div>

                    <p className="text-primary font-semibold mb-1">{mechanic.specialization}</p>
                    <p className="text-sm text-muted-foreground mb-2">{mechanic.experience} خبرة</p>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{mechanic.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{mechanic.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{mechanic.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-right">الخدمات المقدمة:</p>
                    <div className="flex flex-wrap gap-1">
                      {mechanic.services.slice(0, 2).map((service, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {mechanic.services.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{mechanic.services.length - 2} أخرى
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user && user.role === 'client' ? (
                      <>
                        <Button
                          className="flex-1 rounded-full bg-primary hover:bg-primary-hover"
                          onClick={() => navigate(`/book-appointment/${mechanic.id}`)}
                        >
                          <Wrench className="h-4 w-4 ml-2" />
                          احجز موعد
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => handleChatWithMechanic(mechanic)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="flex-1 rounded-full"
                          onClick={() => {
                            toast.error("يجب تسجيل الدخول كعميل أولاً لحجز موعد");
                            navigate('/auth?mode=login');
                          }}
                        >
                          <LogIn className="h-4 w-4 ml-2" />
                          تسجيل الدخول للحجز
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {!loading && !error && filteredMechanics.length === 0 && (
            <div className="text-center py-20">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {serviceFilter ? `لا يوجد ميكانيكيين متخصصين في ${serviceFilter}` : 'لم يتم العثور على ميكانيكيين'}
              </h3>
              <p className="text-muted-foreground">
                {serviceFilter
                  ? 'جرب البحث عن تخصص آخر أو تواصل معنا للمساعدة'
                  : 'لا يوجد ميكانيكيين متاحين حالياً'
                }
              </p>
              {serviceFilter && (
                <Button
                  onClick={() => {
                    setServiceFilter("");
                    setSpecializationFilter("");
                    navigate('/mechanics');
                  }}
                  className="mt-4 rounded-full"
                >
                  عرض جميع الميكانيكيين
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-3xl h-[600px] p-0 flex flex-col" hideClose={true}>
          {selectedMechanicForChat && (
            <ChatComponent
              otherUserId={selectedMechanicForChat.id}
              otherUserName={selectedMechanicForChat.name}
              onClose={() => setShowChat(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mechanics;