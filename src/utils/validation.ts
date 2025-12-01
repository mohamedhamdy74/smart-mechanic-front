import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'الإسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
  role: z.enum(['client', 'mechanic', 'workshop']),
  phone: z.string().optional(),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور وتأكيدها غير متطابقين',
  path: ['confirmPassword'],
});

// Client specific validation
export const clientProfileSchema = z.object({
  name: z.string().min(3, 'الإسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().optional(),
  location: z.string().optional(),
  carBrand: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.string().optional(),
  plateNumber: z.string().optional(),
  mileage: z.string().optional(),
  lastMaintenance: z.string().optional(),
  dealership: z.string().optional(),
});

// Mechanic specific validation
export const mechanicProfileSchema = z.object({
  name: z.string().min(3, 'الإسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().optional(),
  location: z.string().min(1, 'الموقع مطلوب'),
  specialty: z.string().optional(),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

// Workshop specific validation
export const workshopProfileSchema = z.object({
  workshopName: z.string().min(1, 'اسم المركز مطلوب'),
  address: z.string().min(1, 'العنوان مطلوب'),
  phone: z.string().optional(),
  description: z.string().optional(),
  services: z.string().optional(),
  workingHours: z.string().optional(),
});

// Booking validation
export const bookingSchema = z.object({
  mechanicId: z.string().min(1, 'يجب اختيار ميكانيكي'),
  serviceType: z.string().min(1, 'نوع الخدمة مطلوب'),
  appointmentDate: z.string().min(1, 'تاريخ الموعد مطلوب'),
  appointmentTime: z.string().min(1, 'وقت الموعد مطلوب'),
  carInfo: z.string().min(1, 'معلومات السيارة مطلوبة'),
  licensePlate: z.string().min(1, 'رقم اللوحة مطلوب'),
  location: z.string().min(1, 'الموقع مطلوب'),
  description: z.string().optional(),
  estimatedCost: z.number().min(0).optional(),
});

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  description: z.string().min(1, 'وصف المنتج مطلوب'),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من صفر'),
  category: z.string().min(1, 'الفئة مطلوبة'),
  stock: z.number().min(0, 'المخزون يجب أن يكون أكبر من أو يساوي صفر'),
});

// Order validation
export const orderSchema = z.object({
  products: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  })).min(1, 'يجب اختيار منتج واحد على الأقل'),
  shippingAddress: z.string().min(1, 'عنوان الشحن مطلوب'),
  paymentMethod: z.enum(['cash', 'card', 'vodafone_cash', 'fawry']),
});

// Review validation
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5, 'التقييم يجب أن يكون بين 1 و 5'),
  comment: z.string().optional(),
});

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين',
  path: ['confirmPassword'],
});

// Utility functions
export const validateForm = <T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: z.ZodError } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    return { success: false };
  }
};

export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};