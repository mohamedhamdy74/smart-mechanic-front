import { authApi } from '@/lib/api';
import { RegisterRequest } from '@/types/api';

// مثال لكيفية تسجيل مستخدم جديد
async function registerNewUser() {
    try {
        // بيانات المستخدم الجديد
        const newUser: RegisterRequest = {
            role: 'user', // يجب أن تكون 'user' أو 'mechanic' أو 'workshopOwner'
            name: 'أحمد محمد',
            email: 'ahmed@example.com',
            password: '123456',
            phone: '+201234567890',
            location: 'أسوان، حي السلام'
        };

        // إرسال طلب التسجيل
        const response = await authApi.register(newUser);

        if (response.data?.success) {
            console.log('تم التسجيل بنجاح!');
            console.log('رسالة النجاح:', response.data.data?.message);
            
            // يمكنك الآن تسجيل الدخول باستخدام نفس البيانات
            const loginResponse = await authApi.login({
                email: newUser.email,
                password: newUser.password
            });

            if (loginResponse.data?.success) {
                console.log('تم تسجيل الدخول بنجاح!');
                // سيتم تخزين التوكن تلقائياً في localStorage
                return loginResponse.data.data;
            }
        } else {
            console.error('فشل التسجيل:', response.data?.error?.message);
        }
    } catch (error) {
        console.error('حدث خطأ أثناء التسجيل:', error);
        throw error;
    }
}

// خطوات التسجيل للميكانيكي
async function registerNewMechanic() {
    try {
        const newMechanic: RegisterRequest = {
            role: 'mechanic',
            name: 'محمد علي',
            email: 'mohamed@example.com',
            password: '123456',
            phone: '+201234567891',
            location: 'أسوان، حي النصر',
            // يمكن إضافة المزيد من المعلومات المتخصصة للميكانيكي في مرحلة لاحقة
        };

        const response = await authApi.register(newMechanic);
        return handleRegistrationResponse(response);
    } catch (error) {
        console.error('حدث خطأ أثناء تسجيل الميكانيكي:', error);
        throw error;
    }
}

// خطوات التسجيل لمركز الصيانة
async function registerNewWorkshop() {
    try {
        const newWorkshop: RegisterRequest = {
            role: 'workshopOwner',
            name: 'مركز الصيانة المتقدم',
            email: 'workshop@example.com',
            password: '123456',
            phone: '+201234567892',
            location: 'أسوان، المنطقة الصناعية',
            // يمكن إضافة المزيد من المعلومات المتخصصة لمركز الصيانة في مرحلة لاحقة
        };

        const response = await authApi.register(newWorkshop);
        return handleRegistrationResponse(response);
    } catch (error) {
        console.error('حدث خطأ أثناء تسجيل مركز الصيانة:', error);
        throw error;
    }
}

// دالة مساعدة للتعامل مع الرد من عملية التسجيل
function handleRegistrationResponse(response: { data?: { success: boolean; data?: { message: string }; error?: { message: string } } }) {
    if (response.data?.success) {
        console.log('تم التسجيل بنجاح!');
        console.log('رسالة النجاح:', response.data.data?.message);
        return response.data.data;
    } else {
        const errorMessage = response.data?.error?.message || 'حدث خطأ غير معروف';
        console.error('فشل التسجيل:', errorMessage);
        throw new Error(errorMessage);
    }
}

export { registerNewUser, registerNewMechanic, registerNewWorkshop };