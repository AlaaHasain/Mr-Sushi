// تحقق من حالة تسجيل الدخول عند تحميل الصفحة
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // إذا لم يكن المستخدم مسجل الدخول، يتم توجيهه إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
    }
}

// تسجيل الخروج
function logout() {
    // تعيين حالة تسجيل الدخول إلى false
    localStorage.setItem('isLoggedIn', 'false');
    // توجيه المستخدم إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}