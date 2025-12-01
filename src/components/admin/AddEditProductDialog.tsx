import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';

interface AddEditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  product?: any;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: 'engine', label: 'قطع المحرك' },
  { value: 'brake', label: 'قطع الفرامل' },
  { value: 'electrical', label: 'قطع كهربائية' },
  { value: 'tires', label: 'إطارات' },
  { value: 'filters', label: 'فلاتر' },
  { value: 'oils', label: 'زيوت ومواد تشحيم' },
  { value: 'other', label: 'أخرى' },
];

export function AddEditProductDialog({ isOpen, onClose, onSave, product, isLoading }: AddEditProductDialogProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || '',
    description: product?.description || '',
    carType: product?.carType || '',
    workshopId: product?.userId || '',
  });

  const [errors, setErrors] = useState<any>({});

  // Fetch workshops for selection
  const { data: shopsData } = useQuery({
    queryKey: ['admin-workshops-for-product'],
    queryFn: async () => {
      const response = await adminApi.getShops({ limit: 100 });
      return response.data;
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المنتج مطلوب';
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'السعر يجب أن يكون رقم موجب';
    }

    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'الكمية يجب أن تكون رقم صحيح';
    }

    if (!formData.category) {
      newErrors.category = 'الفئة مطلوبة';
    }

    if (!formData.workshopId) {
      newErrors.workshopId = 'يجب اختيار مركز الخدمة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء أولاً');
      return;
    }

    // Submit the form data
    onSave({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  // Find selected workshop name
  const typedShopsData = shopsData as any;
  const selectedWorkshop = (typedShopsData?.shops || []).find((shop: any) => shop._id === formData.workshopId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'قم بتعديل بيانات المنتج' : 'أضف منتج جديد إلى النظام'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المنتج *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="أدخل اسم المنتج"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">العلامة التجارية</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="أدخل العلامة التجارية"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">الكمية *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                min="0"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">الفئة *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workshopId">مركز الخدمة *</Label>
            <Select value={formData.workshopId} onValueChange={(value) => handleInputChange('workshopId', value)}>
              <SelectTrigger className={errors.workshopId ? 'border-red-500' : ''}>
                <SelectValue placeholder="اختر مركز الخدمة" />
              </SelectTrigger>
              <SelectContent>
                {(typedShopsData?.shops || []).map((shop: any) => (
                  <SelectItem key={shop._id} value={shop._id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workshopId && <p className="text-sm text-red-500">{errors.workshopId}</p>}
            {selectedWorkshop && (
              <p className="text-xs text-muted-foreground">
                العنوان: {selectedWorkshop.address || 'غير محدد'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="carType">نوع السيارة المتوافق</Label>
            <Input
              id="carType"
              value={formData.carType}
              onChange={(e) => handleInputChange('carType', e.target.value)}
              placeholder="مثل: هيونداي إلنترا"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="وصف المنتج وخصائصه"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : product ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}