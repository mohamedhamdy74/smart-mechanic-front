
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation as NavigationIcon, Clock, Star, Phone, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

// Dynamic import helper for React
function dynamic(importFunc: any, options?: any) {
  return importFunc;
}

const MechanicTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        toast.success("تم تحديد موقعك بنجاح");
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error("فشل في تحديد الموقع. يرجى السماح بالوصول للموقع");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fetch available mechanics near user location
  const fetchNearbyMechanics = async () => {
    if (!userLocation) return;

    try {
      const response = await fetch(
        `http://localhost:5000/users/mechanics/available?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=20`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMechanics(data.mechanics);
        if (data.mechanics.length === 0) {
          toast.info("لا يوجد ميكانيكيين متاحين في منطقتك حالياً");
        }
      } else {
        toast.error("فشل في تحميل الميكانيكيين");
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      toast.error("حدث خطأ في تحميل الميكانيكيين");
    }
  };

  // Start tracking mechanic location
  const startTracking = (mechanic: any) => {
    setSelectedMechanic(mechanic);
    setTracking(true);
    toast.success(`بدء تتبع ${mechanic.name}`);
  };

  // Stop tracking
  const stopTracking = () => {
    setSelectedMechanic(null);
    setTracking(false);
    toast.info("تم إيقاف التتبع");
  };

  // Update mechanic location periodically
  useEffect(() => {
    if (!tracking || !selectedMechanic) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/users/${selectedMechanic._id}/location`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSelectedMechanic((prev: any) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
            lastLocationUpdate: data.lastLocationUpdate
          }));
        }
      } catch (error) {
        console.error('Error updating mechanic location:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [tracking, selectedMechanic]);

  // Fetch mechanics when user location is available
  useEffect(() => {
    if (userLocation) {
      fetchNearbyMechanics();
    }
  }, [userLocation]);

  // Check if user is logged in and is a client
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }

    if (user.role !== 'client') {
      toast.error("هذه الخدمة متاحة للعملاء فقط");
      navigate('/');
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-bounce-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent pb-4">
              تتبع الميكانيكي الأقرب
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              حدد موقعك واعثر على أقرب ميكانيكي متاح لخدمتك
            </p>
          </div>

          {/* Location Button */}
          <div className="text-center mb-12">
            <Button
              onClick={getUserLocation}
              disabled={loading}
              className="rounded-full px-10 py-6 text-xl font-bold hover-lift transition-all duration-300 shadow-lg bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600"
            >
              <MapPin className="h-6 w-6 ml-3" />
              {loading ? "جاري تحديد الموقع..." : "تحديد موقعي الحالي"}
            </Button>
          </div>

          {userLocation && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map */}
              <div className="lg:col-span-2">
                <Card className="p-6 h-[600px] animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                  <div className="h-full rounded-xl overflow-hidden border border-border/20">
                    <MapContainer
                      center={[userLocation.lat, userLocation.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />

                      {/* User Location Marker */}
                      <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>
                          <div className="text-center">
                            <User className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            موقعك الحالي
                          </div>
                        </Popup>
                      </Marker>

                      {/* Mechanic Markers */}
                      {mechanics.map((mechanic) => (
                        <Marker
                          key={mechanic._id}
                          position={[mechanic.latitude, mechanic.longitude]}
                        >
                          <Popup>
                            <div className="text-center">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                <NavigationIcon className="h-4 w-4 text-primary" />
                              </div>
                              <h3 className="font-bold text-sm mb-1">{mechanic.name}</h3>
                              <p className="text-xs text-muted-foreground mb-2">{mechanic.specialty}</p>
                              <div className="flex items-center justify-center gap-1 mb-2">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">{mechanic.rating?.toFixed(1) || 'غير مقيم'}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                المسافة: {mechanic.distance} كم
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                الوقت المقدر: {mechanic.eta} دقيقة
                              </p>
                              <Button
                                size="sm"
                                onClick={() => startTracking(mechanic)}
                                className="w-full text-xs"
                              >
                                تتبع هذا الميكانيكي
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {/* Route Line */}
                      {selectedMechanic && userLocation && (
                        <Polyline
                          positions={[
                            [userLocation.lat, userLocation.lng],
                            [selectedMechanic.latitude, selectedMechanic.longitude]
                          ]}
                          color="blue"
                          weight={3}
                          opacity={0.7}
                        />
                      )}
                    </MapContainer>
                  </div>
                </Card>
              </div>

              {/* Mechanics List */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">الميكانيكيين المتاحين</h3>

                {mechanics.length === 0 ? (
                  <Card className="p-8 text-center animate-fade-in shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                    <p className="text-muted-foreground text-lg">
                      {userLocation ? "لا يوجد ميكانيكيين متاحين في منطقتك" : "يرجى تحديد موقعك أولاً"}
                    </p>
                  </Card>
                ) : (
                  mechanics.map((mechanic, index) => (
                    <Card key={mechanic._id} className="p-6 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 hover-lift transition-all duration-300 transition-colors" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <NavigationIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 text-right">
                          <h4 className="font-bold text-xl mb-2">{mechanic.name}</h4>
                          <p className="text-base text-muted-foreground mb-4">{mechanic.specialty}</p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              <span className="text-base font-semibold">{mechanic.rating?.toFixed(1) || 'غير مقيم'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-base text-muted-foreground">
                              <MapPin className="h-5 w-5" />
                              <span>{mechanic.distance} كم</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-base text-muted-foreground">
                              <Clock className="h-5 w-5" />
                              <span>{mechanic.eta} دقيقة</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/mechanic/${mechanic._id}`)}
                              className="rounded-full px-4 py-2 hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                            >
                              عرض البروفايل
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => startTracking(mechanic)}
                            disabled={tracking && selectedMechanic?._id === mechanic._id}
                            className="w-full rounded-full py-3 text-base font-semibold hover-lift transition-all duration-300 bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600"
                          >
                            {tracking && selectedMechanic?._id === mechanic._id ? "يتم التتبع" : "تتبع الموقع"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}

                {/* Tracking Status */}
                {tracking && selectedMechanic && (
                  <Card className="p-6 bg-gradient-to-br from-primary/10 to-orange-500/10 dark:from-gray-900/50 dark:to-gray-800/30 border-primary/30 dark:border-gray-700/50 animate-bounce-in shadow-xl transition-colors duration-300">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <NavigationIcon className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                      <h4 className="font-bold text-xl mb-3">يتم تتبع {selectedMechanic.name}</h4>
                      <p className="text-base text-muted-foreground mb-6">
                        آخر تحديث: {selectedMechanic.lastLocationUpdate ?
                          new Date(selectedMechanic.lastLocationUpdate).toLocaleTimeString('ar-EG') :
                          'الآن'}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopTracking}
                        className="w-full rounded-full py-3 text-base font-semibold hover-lift transition-all duration-300 hover:border-destructive hover:bg-destructive/5"
                      >
                        إيقاف التتبع
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MechanicTracker;