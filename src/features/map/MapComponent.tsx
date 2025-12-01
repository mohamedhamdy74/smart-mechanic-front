 import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { MapPin, RefreshCw, User, Star, Wrench, Loader2, AlertCircle, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface Mechanic {
  _id: string;
  name: string;
  rating: number;
  latitude: number;
  longitude: number;
  specialty: string;
  skills: string[];
  phone: string;
  email: string;
  location: string;
  completedBookings?: number;
}

interface MapComponentProps {
  onMechanicSelect?: (mechanic: Mechanic) => void;
  onChatWithMechanic?: (mechanic: Mechanic) => void;
  onMechanicLocationSelect?: (location: { lat: number; lng: number }) => void;
  refreshTrigger?: number; // Add refresh trigger prop
}

const MapComponent: React.FC<MapComponentProps> = ({ onMechanicSelect, onChatWithMechanic, onMechanicLocationSelect, refreshTrigger }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualSelectionMode, setIsManualSelectionMode] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [mechanicsLoaded, setMechanicsLoaded] = useState(false);
  const [mapLayer] = useState<'osm'>('osm'); // Always use OSM
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapHeight, setMapHeight] = useState(280);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        console.log('Initializing map...');

        // Ensure container has proper dimensions
        if (mapRef.current) {
          mapRef.current.style.width = '100%';
          mapRef.current.style.height = `${mapHeight}px`;
          mapRef.current.style.minHeight = `${mapHeight}px`;
          mapRef.current.style.position = 'relative';
          mapRef.current.style.zIndex = '1';
        }

        // Wait for DOM to be fully ready
        await new Promise(resolve => setTimeout(resolve, 300));

        const map = initializeMap(mapRef.current, {
          center: [24.0889, 32.8998], // Aswan
          zoom: 12,
          layer: mapLayer,
        });

        mapInstanceRef.current = map;

        // Wait for map to be fully loaded and tiles to render
        map.whenReady(() => {
          if (mounted) {
            console.log('Map loaded successfully');

            // Force size invalidation to ensure proper rendering
            const invalidateSizes = () => {
              if (mapInstanceRef.current && mounted) {
                mapInstanceRef.current.invalidateSize();
              }
            };

            invalidateSizes();
            setTimeout(invalidateSizes, 200);
            setTimeout(invalidateSizes, 500);
            setTimeout(invalidateSizes, 1000);

            setTimeout(() => {
              if (mounted) {
                setMapLoaded(true);
                console.log('Map fully loaded and ready');

                // Add center marker for Aswan
                addCenterMarker(24.0889, 32.8998, 'مركز مدينة أسوان - موقع الميكانيكيين');

                // Load mechanics
                loadMechanics();
              }
            }, 1200);
          }
        });

        // Add error handling for tile loading
        map.on('tileerror', (e) => {
          console.warn('Tile loading error:', e);
        });

        // Force resize on window resize
        const handleResize = () => {
          if (mapInstanceRef.current && mounted) {
            setTimeout(() => {
              mapInstanceRef.current?.invalidateSize();
            }, 100);
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('Error initializing map:', error);
        setError('فشل في تحميل الخريطة. يرجى إعادة تحميل الصفحة.');
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && mechanics.length > 0) {
      updateMarkers();
    }
  }, [userLocation, mechanics]);

  // Add effect to refresh mechanics when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && !onMechanicLocationSelect) {
      loadMechanics();
    }
  }, [refreshTrigger]);

  const loadMechanics = async () => {
    // Only load mechanics if we're not in mechanic location selection mode
    if (onMechanicLocationSelect) {
      setMechanics([]);
      setMechanicsLoaded(true);
      return;
    }

    try {
      const response = await api.get('/users?role=mechanic');
      const mechanicsData = (response.data as any).users || [];

      // Filter mechanics with valid coordinates
      const validMechanics = mechanicsData.filter((mechanic: any) =>
        mechanic.latitude && mechanic.longitude &&
        typeof mechanic.latitude === 'number' &&
        typeof mechanic.longitude === 'number' &&
        mechanic.latitude !== 0 && mechanic.longitude !== 0
      );

      setMechanics(validMechanics);
      setMechanicsLoaded(true);
      console.log('Loaded', validMechanics.length, 'mechanics with valid locations');
    } catch (error) {
      console.error('Error loading mechanics:', error);
      setError('فشل في تحميل بيانات الميكانيكيين');
    }
  };

  const getUserLocation = async () => {
    if (!mapLoaded) {
      console.log('Map not loaded yet, waiting...');
      return;
    }

    setIsLoadingLocation(true);
    setLocationStatus('loading');
    setError(null);

    try {
      console.log('Getting user location...');
      const location = await getCurrentPosition() as { lat: number; lng: number };
      console.log('User location obtained:', location);

      setUserLocation(location);
      setLocationStatus('success');

      if (mapInstanceRef.current) {
        updateMapCenter(location.lat, location.lng, 14);
        addUserMarker(location.lat, location.lng, 'موقعك الحالي');
        console.log('User marker added to map');
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      setLocationStatus('error');
      setError('تعذر الحصول على موقعك. يرجى إدخال عنوانك يدوياً أو اختيار موقعك على الخريطة.');
      setIsManualSelectionMode(true);
      enableManualLocationSelection();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleManualAddress = async () => {
    if (!manualAddress.trim()) return;

    setIsLoadingLocation(true);
    setLocationStatus('loading');
    setError(null);

    try {
      console.log('Geocoding address:', manualAddress);
      const location = await geocodeAddress(manualAddress);
      console.log('Geocoded location:', location);

      setUserLocation(location);
      setLocationStatus('success');

      if (mapInstanceRef.current) {
        updateMapCenter(location.lat, location.lng, 14);
        addUserMarker(location.lat, location.lng, `موقعك: ${manualAddress}`);
      }

      setManualAddress('');
      setIsManualSelectionMode(false);
      removeClickHandler();
    } catch (error) {
      console.error('Error geocoding address:', error);
      setLocationStatus('error');
      setError('العنوان غير صحيح. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const enableManualLocationSelection = () => {
    if (mapInstanceRef.current) {
      console.log('Enabling manual location selection');

      // Add visual feedback - change cursor
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getContainer().style.cursor = 'crosshair';
      }

      addClickHandler(async (lat, lng) => {
        console.log('Map clicked at:', lat, lng);

        // Reset cursor
        if (mapInstanceRef.current) {
          mapInstanceRef.current.getContainer().style.cursor = '';
        }

        if (onMechanicLocationSelect) {
          // For mechanic location selection
          handleMechanicLocationSelect({ lat, lng });
        } else {
          // For client location selection
          setUserLocation({ lat, lng });
          setLocationStatus('success');

          try {
            const address = await reverseGeocode(lat, lng);
            console.log('Reverse geocoded address:', address);
            addUserMarker(lat, lng, `موقعك المحدد: ${address}`);
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            addUserMarker(lat, lng, 'موقعك المحدد');
          }

          setIsManualSelectionMode(false);
          removeClickHandler();
          updateMapCenter(lat, lng, 14);
        }
      });
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) {
      console.log('Cannot update markers: map not available');
      return;
    }

    console.log('Updating markers for', mechanics.length, 'mechanics');
    clearMechanicMarkers();

    // Add mechanic markers
    mechanics.forEach((mechanic) => {
      console.log('Processing mechanic:', mechanic.name, 'lat:', mechanic.latitude, 'lng:', mechanic.longitude);

      let distance = 0;
      if (userLocation) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mechanic.latitude,
          mechanic.longitude
        );
        console.log('Distance to mechanic:', mechanic.name, 'is', distance.toFixed(1), 'km');
      }

      // Show all mechanics if no user location, or within 50km if location available
      const shouldShow = !userLocation || distance <= 50;

      if (shouldShow) {
        console.log('Adding marker for mechanic:', mechanic.name);
        addMechanicMarker(mechanic);
      } else {
        console.log('Mechanic', mechanic.name, 'too far away:', distance.toFixed(1), 'km');
      }
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setMapHeight(isFullscreen ? 280 : 400);
  };


  const handleMechanicSelect = (mechanic: Mechanic) => {
    if (onMechanicSelect) {
      onMechanicSelect(mechanic);
    }
  };

  const handleChatWithMechanic = (mechanic: Mechanic) => {
    if (onChatWithMechanic) {
      onChatWithMechanic(mechanic);
    }
  };

  const handleMechanicLocationSelect = (location: { lat: number; lng: number }) => {
    if (onMechanicLocationSelect) {
      onMechanicLocationSelect(location);
    }
  };

  return (
    <Card className="w-full h-full shadow-lg border border-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="w-4 h-4" />
          <Wrench className="w-4 h-4" />
          ابحث عن الميكانيكيين القريبين
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`flex items-center gap-1 text-xs ${mapLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
            {mapLoaded ? <CheckCircle className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
            الخريطة {mapLoaded ? 'محملة' : 'جاري التحميل'}
          </div>

          {locationStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <CheckCircle className="w-3 h-3" />
              تم تحديد الموقع
            </div>
          )}

          {mechanicsLoaded && (
            <div className="flex items-center gap-1 text-blue-600 text-xs">
              <CheckCircle className="w-3 h-3" />
              تم تحميل {mechanics.length} ميكانيكي
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={getUserLocation}
            disabled={isLoadingLocation || !mapLoaded}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg text-sm py-2"
            size="sm"
          >
            {isLoadingLocation ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <MapPin className="w-3 h-3 mr-1" />
            )}
            حدث موقعي
          </Button>
          <Button
            onClick={() => {
              setIsManualSelectionMode(!isManualSelectionMode);
              if (!isManualSelectionMode) {
                enableManualLocationSelection();
              } else {
                removeClickHandler();
              }
            }}
            disabled={!mapLoaded}
            variant={isManualSelectionMode ? "default" : "outline"}
            className={`${isManualSelectionMode ? "bg-green-500 hover:bg-green-600" : ""} text-sm py-2`}
            size="sm"
          >
            <User className="w-3 h-3 mr-1" />
            {isManualSelectionMode ? 'إلغاء التحديد اليدوي' : 'اختر موقع يدوياً'}
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-sm py-2"
            size="sm"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>


        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="أدخل عنوانك (مثال: القاهرة، مصر)"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="flex-1"
                  disabled={isLoadingLocation}
                />
                <Button
                  onClick={handleManualAddress}
                  size="sm"
                  disabled={isLoadingLocation || !manualAddress.trim()}
                >
                  {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تعيين الموقع'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isManualSelectionMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription className="text-blue-600">
                  <strong>وضع التحديد اليدوي مفعل:</strong><br />
                  {onMechanicLocationSelect ? 'اضغط على أي مكان في الخريطة لتحديد موقعك كميكانيكي' : 'اضغط على أي مكان في الخريطة لتحديد موقعك الجديد'}<br />
                  <span className="text-sm text-blue-500 mt-1 block">
                    (المؤشر سيتحول إلى شكل +)
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10 border-2 border-orange-200">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                <p className="text-gray-600 font-medium">جاري تحميل الخريطة...</p>
                <p className="text-sm text-gray-500 mt-1">يرجى الانتظار حتى تظهر الخريطة كاملة</p>
              </div>
            </div>
          )}
          <motion.div
            ref={mapRef}
            className="w-full rounded-lg border-2 border-orange-200 overflow-hidden bg-white"
            style={{
              height: `${mapHeight}px`,
              minHeight: `${mapHeight}px`,
              backgroundColor: '#f8f9fa',
              position: 'relative',
              zIndex: 1
            }}
            animate={{ height: mapHeight }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>

        <div className="text-xs text-gray-500 text-center bg-gray-50 p-1 rounded">
          خريطة مفتوحة المصدر مقدمة من OpenStreetMap • {mechanics.length} ميكانيكي متاح
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions for map operations
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Unknown location';
  }
};

const geocodeAddress = async (address: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } else {
      throw new Error('Address not found');
    }
  } catch (error) {
    throw new Error('Failed to geocode address: ' + error.message);
  }
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const initializeMap = (mapContainer: HTMLElement, options: any = {}) => {
  const defaultOptions = {
    center: [24.0889, 32.8998], // Default to Aswan
    zoom: 12,
    ...options,
  };

  // Clear any existing map instance
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {
      console.warn('Error removing previous map instance:', e);
    }
  }

  // Ensure container is properly sized
  if (mapContainer) {
    mapContainer.style.width = '100%';
    mapContainer.style.height = '400px';
    mapContainer.style.position = 'relative';
  }

  mapInstance = L.map(mapContainer, {
    center: defaultOptions.center,
    zoom: defaultOptions.zoom,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true,
    touchZoom: true,
    fadeAnimation: true,
    zoomAnimation: true,
    markerZoomAnimation: true,
    preferCanvas: false, // Use SVG renderer for better compatibility
  });

  // Choose tile layer based on options
  let tileLayer;
  if (defaultOptions.layer === 'satellite') {
    tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
      minZoom: 3,
    });
  } else {
    // Use multiple tile servers for better reliability
    tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Transparent fallback
      crossOrigin: true,
    });
  }

  tileLayer.addTo(mapInstance);

  // Add tile load error handling
  tileLayer.on('tileerror', function(e) {
    console.warn('Tile failed to load:', e);
  });

  // Force initial size calculation with multiple attempts
  const forceResize = () => {
    if (mapInstance) {
      mapInstance.invalidateSize();
      console.log('Map size invalidated');
    }
  };

  setTimeout(forceResize, 100);
  setTimeout(forceResize, 300);
  setTimeout(forceResize, 600);
  setTimeout(forceResize, 1000);

  console.log('Map initialized with options:', defaultOptions);
  return mapInstance;
};

const addUserMarker = (lat: number, lng: number, popupContent = 'Your Location') => {
  if (userMarker) {
    mapInstance.removeLayer(userMarker);
  }

  const userIcon = L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  userMarker = L.marker([lat, lng], { icon: userIcon })
    .addTo(mapInstance)
    .bindPopup(popupContent);

  return userMarker;
};

const addCenterMarker = (lat: number, lng: number, popupContent = 'مركز أسوان') => {
  if (centerMarker) {
    mapInstance.removeLayer(centerMarker);
  }

  const centerIcon = L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: #dc2626;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: #dc2626;
            border-radius: 50%;
          "></div>
        </div>
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #dc2626;
        "></div>
      </div>
    `,
    className: '',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });

  centerMarker = L.marker([lat, lng], { icon: centerIcon })
    .addTo(mapInstance)
    .bindPopup(popupContent);

  return centerMarker;
};

const addMechanicMarker = (mechanic: Mechanic) => {
  const mechanicIcon = L.divIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background-color: #f59e0b;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background-color: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="color: white; font-size: 10px; font-weight: bold;">✓</span>
        </div>
      </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  const marker = L.marker([mechanic.latitude, mechanic.longitude], { icon: mechanicIcon })
    .addTo(mapInstance)
    .bindPopup(`
      <div class="p-4 max-w-sm" dir="rtl">
        <div class="flex items-center mb-3">
          <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-3">
            <span class="text-white font-bold text-lg">${mechanic.name.charAt(0)}</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 text-lg mb-1">${mechanic.name}</h3>
            <div class="flex items-center gap-1">
              <span class="text-yellow-500 text-sm">★</span>
              <span class="text-sm font-semibold text-gray-700">${mechanic.rating?.toFixed(1) || '4.5'}</span>
              <span class="text-xs text-gray-500">(${mechanic.completedBookings || 0} عملية)</span>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-3">${mechanic.specialty || mechanic.skills?.join('، ') || 'صيانة عامة'}</p>
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>📍 ${mechanic.location || 'أسوان'}</span>
          <span>📞 ${mechanic.phone || 'غير محدد'}</span>
        </div>
        <div class="flex gap-2">
          <button onclick="window.dispatchEvent(new CustomEvent('viewMechanicProfile', { detail: '${mechanic._id}' }))" class="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
            عرض الملف
          </button>
          <button onclick="window.dispatchEvent(new CustomEvent('chatWithMechanic', { detail: '${mechanic._id}' }))" class="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors">
            شات
          </button>
        </div>
      </div>
    `, {
      maxWidth: 300,
      className: 'custom-popup'
    });

  mechanicMarkers.push(marker);
  return marker;
};

const clearMechanicMarkers = () => {
  mechanicMarkers.forEach(marker => {
    if (mapInstance) {
      mapInstance.removeLayer(marker);
    }
  });
  mechanicMarkers = [];
};

const updateMapCenter = (lat: number, lng: number, zoom = 14) => {
  if (mapInstance) {
    mapInstance.setView([lat, lng], zoom);
  }
};

const addClickHandler = (callback: (lat: number, lng: number) => void) => {
  if (mapInstance) {
    mapInstance.on('click', (e: any) => {
      callback(e.latlng.lat, e.latlng.lng);
    });
  }
};

const removeClickHandler = () => {
  if (mapInstance) {
    mapInstance.off('click');
  }
};

// Global map state management
let mapInstance: L.Map | null = null;
let userMarker: L.Marker | null = null;
let mechanicMarkers: L.Marker[] = [];
let centerMarker: L.Marker | null = null;

// Import Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

// Import Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default MapComponent;