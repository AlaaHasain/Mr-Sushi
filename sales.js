// sales.js - إدارة وعرض المبيعات اليومية

// متغيرات عامة للمبيعات
let salesPanelVisible = false;
let dailySales = []; // مصفوفة لتخزين بيانات المبيعات

// لوحة المبيعات - سيتم إنشاؤها ديناميكياً عند الحاجة
let salesPanel = null;

// وظيفة مساعدة للحصول على المبيعات المفلترة والمرتبة لتاريخ معين
function getFilteredSales(date) {
    const filteredSales = dailySales.filter(sale => {
        if (!sale || !sale.timestamp) return false;
        const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
        return saleDate === date;
    });
    
    // ترتيب المبيعات من الأحدث إلى الأقدم
    return filteredSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة، بدء تهيئة نظام المبيعات');
    addSalesModalStyles();
    createSalesPanel();
    loadSalesData();
});

// إنشاء لوحة المبيعات ديناميكياً
function createSalesPanel() {
    // التحقق مما إذا كانت لوحة المبيعات موجودة بالفعل
    if (document.getElementById('sales-panel')) {
        console.log('لوحة المبيعات موجودة بالفعل');
        return;
    }

    // إنشاء لوحة المبيعات
    salesPanel = document.createElement('div');
    salesPanel.id = 'sales-panel';
    salesPanel.className = 'sales-panel';
    salesPanel.style.display = 'none';
    
    // إنشاء محتوى اللوحة
    salesPanel.innerHTML = `
        <div class="sales-header">
            <h2>تقرير المبيعات</h2>
            <div class="sales-controls">
                <div class="date-filter">
                    <label for="sales-date-filter">تاريخ المبيعات:</label>
                    <input type="date" id="sales-date-filter">
                </div>
            </div>
        </div>
        <div class="sales-stats">
            <div class="stat-box">
                <span class="stat-label">مبيعات اليوم:</span>
                <span id="today-sales" class="stat-value">0 دينار</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">مبيعات الأسبوع:</span>
                <span id="weekly-sales" class="stat-value">0 دينار</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">مبيعات الشهر:</span>
                <span id="monthly-sales" class="stat-value">0 دينار</span>
            </div>
        </div>
        <div id="sales-content" class="sales-content">
            <!-- سيتم ملء هذا القسم بالبيانات ديناميكياً -->
        </div>
    `;
    
    // إضافة اللوحة إلى الصفحة
    document.body.appendChild(salesPanel);
    
    // إضافة مستمع تغيير التاريخ
    const dateFilter = document.getElementById('sales-date-filter');
    if (dateFilter) {
        // تعيين التاريخ الافتراضي إلى اليوم
        const today = new Date().toISOString().split('T')[0];
        dateFilter.value = today;
        
        // إضافة مستمع الحدث
        dateFilter.addEventListener('change', function() {
            renderSalesForDate(this.value);
        });
    }
}

// وظيفة تبديل عرض لوحة المبيعات - هذه هي الدالة المستدعاة من HTML
function toggleSalesPanel() {
    // التأكد من إنشاء لوحة المبيعات إذا لم تكن موجودة
    if (!document.getElementById('sales-panel')) {
        createSalesPanel();
    }
    
    // الحصول على مرجع محدث للوحة
    const salesPanel = document.getElementById('sales-panel');
    if (!salesPanel) {
        console.error('لم يتم العثور على عنصر لوحة المبيعات');
        return;
    }
    
    // تبديل حالة العرض
    salesPanelVisible = !salesPanelVisible;
    
    // عرض أو إخفاء اللوحة بناءً على الحالة الجديدة
    salesPanel.style.display = salesPanelVisible ? 'block' : 'none';
    
    // تحديث البيانات إذا كانت اللوحة مرئية
    if (salesPanelVisible) {
        loadSalesData();
        
        // إضافة مستمعي الأحداث لأزرار التفاصيل والطباعة والحذف
        attachSalesEventListeners();
    }
    
    // تحديث نص الزر
    const toggleBtn = document.querySelector('.toggle-sales-btn');
    if (toggleBtn) {
        toggleBtn.textContent = salesPanelVisible ? 'إخفاء المبيعات' : 'عرض المبيعات';
    }
    
    console.log('حالة عرض لوحة المبيعات:', salesPanelVisible);
}

// وظيفة لإخفاء لوحة المبيعات
function hideSalesPanel() {
    const salesPanel = document.getElementById('sales-panel');
    if (!salesPanel) return;
    
    salesPanel.style.display = 'none';
    salesPanelVisible = false;
    
    // تحديث نص الزر
    const toggleBtn = document.querySelector('.toggle-sales-btn');
    if (toggleBtn) {
        toggleBtn.textContent = 'عرض المبيعات';
    }
}

// وظيفة لتحميل بيانات المبيعات
function loadSalesData() {
    try {
        // استرجاع سجلات المبيعات من LocalStorage
        const salesRecords = JSON.parse(localStorage.getItem('salesRecords') || '[]');
        dailySales = salesRecords;
        
        // التحقق من وجود عنصر فلتر التاريخ
        const dateFilter = document.getElementById('sales-date-filter');
        let selectedDate;
        
        if (dateFilter) {
            // استخدام التاريخ المحدد إذا كان موجودًا، وإلا استخدم اليوم
            selectedDate = dateFilter.value || new Date().toISOString().split('T')[0];
            dateFilter.value = selectedDate; // تحديث قيمة حقل التاريخ
        } else {
            selectedDate = new Date().toISOString().split('T')[0];
        }
        
        // عرض مبيعات التاريخ المحدد
        renderSalesForDate(selectedDate);
        
        // تحديث إجمالي المبيعات
        updateSalesStatistics();
    } catch (error) {
        console.error('خطأ في تحميل بيانات المبيعات:', error);
        showNotification('حدث خطأ أثناء تحميل بيانات المبيعات');
    }
}

// وظيفة جديدة لربط مستمعي الأحداث بأزرار الإجراءات في جدول المبيعات
function attachSalesEventListeners() {
    // انتظر لحظة للتأكد من أن DOM تم تحديثه
    setTimeout(() => {
        // وظيفة مساعدة لإعداد الأزرار
        function setupButtons(selector, actionFn) {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(btn => {
                // إزالة معالج الحدث السابق إذا وجد
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // استخراج مؤشر السجل من النص
                const indexMatch = newBtn.getAttribute('onclick').match(/\((\d+)\)/);
                if (indexMatch && indexMatch[1]) {
                    const index = parseInt(indexMatch[1]);
                    
                    // إضافة معالج حدث جديد
                    newBtn.onclick = function() {
                        actionFn(index);
                    };
                }
            });
        }
        
        // إعداد أزرار التفاصيل والطباعة والحذف
        setupButtons('button[onclick^="showSaleDetails"]', showSaleDetails);
        setupButtons('button[onclick^="reprintInvoice"]', reprintInvoice);
        setupButtons('button[onclick^="deleteSale"]', deleteSale);
    }, 100);
}

// وظيفة لعرض المبيعات حسب التاريخ المحدد
function renderSalesForDate(date) {
    const salesContent = document.getElementById('sales-content');
    if (!salesContent) {
        console.error('لم يتم العثور على عنصر محتوى المبيعات');
        return;
    }
    
    // تصفية المبيعات حسب التاريخ
    const filteredSales = getFilteredSales(date);
    
    if (filteredSales.length === 0) {
        salesContent.innerHTML = '<p>لا توجد مبيعات لهذا اليوم</p>';
        return;
    }
    
    // حساب إجمالي المبيعات
    const totalSales = filteredSales.reduce((total, sale) => total + sale.finalAmount, 0);
    
    // إنشاء جدول المبيعات
    let tableHTML = `
        <table class="sales-table">
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>وقت البيع</th>
                    <th>المبلغ النهائي</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filteredSales.forEach((sale, index) => {
        const saleTime = new Date(sale.timestamp).toLocaleTimeString('ar-JO', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const invoiceNum = sale.invoiceNumber || `فاتورة-${index + 1}`;
        
        tableHTML += `
            <tr data-sale-id="${index}">
                <td>${invoiceNum}</td>
                <td>${saleTime}</td>
                <td>${sale.finalAmount.toFixed(1)} دينار</td>
                <td>
                    <button onclick="showSaleDetails(${index})">التفاصيل</button>
                    <button onclick="reprintInvoice(${index})">طباعة</button>
                    <button onclick="deleteSale(${index})">حذف</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2"><strong>إجمالي المبيعات:</strong></td>
                    <td colspan="2"><strong>${totalSales.toFixed(1)} دينار</strong></td>
                </tr>
            </tfoot>
        </table>
        <button id="delete-day-sales" class="delete-day-btn" onclick="deleteAllDaySales('${date}')">حذف مبيعات اليوم</button>
    `;
    
    salesContent.innerHTML = tableHTML;
}

// تعديل دالة عرض تفاصيل البيع
function showSaleDetails(index) {
    try {
        // إزالة أي نوافذ تفاصيل مفتوحة مسبقاً
        closeModal();
        
        // الحصول على سجل البيع المطلوب
        const dateFilter = document.getElementById('sales-date-filter').value;
        const filteredSales = getFilteredSales(dateFilter);
        
        const sale = filteredSales[index];
        if (!sale) {
            showNotification('لم يتم العثور على بيانات البيع');
            return;
        }
        
        // إنشاء نافذة تفاصيل
        const modal = document.createElement('div');
        modal.className = 'sale-details-modal';
        
        // تنسيق التاريخ والوقت
        const saleDate = new Date(sale.timestamp);
        const formattedDate = saleDate.toLocaleDateString('ar-JO');
        const formattedTime = saleDate.toLocaleTimeString('ar-JO');
        
        // إنشاء مصفوفة فريدة من العناصر
        let uniqueItems = [];
        
        // تجميع العناصر المتشابهة وحساب الكميات
        sale.items.forEach(item => {
            const existingItem = uniqueItems.find(ui => ui.name === item.name && ui.price === item.price);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                uniqueItems.push({...item});
            }
        });
        
        // إنشاء جدول للعناصر الفريدة
        let itemsTable = `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>اسم العنصر</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // حساب مجموع كل العناصر
        let subtotal = 0;
        uniqueItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            itemsTable += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(1)} دينار</td>
                    <td>${itemTotal.toFixed(1)} دينار</td>
                </tr>
            `;
        });
        
        itemsTable += `
                </tbody>
            </table>
        `;
        
        // محتوى النافذة المنبثقة
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل الفاتورة</h3>
                    <span class="close-modal" onclick="closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="sale-info">
                        <p><strong>رقم الفاتورة:</strong> ${sale.invoiceNumber || 'غير معروف'}</p>
                        <p><strong>التاريخ:</strong> ${formattedDate}</p>
                        <p><strong>الوقت:</strong> ${formattedTime}</p>
                    </div>
                    <div class="sale-items">
                        <h4>العناصر المباعة:</h4>
                        ${itemsTable}
                    </div>
                    <div class="sale-summary">
                        <p><strong>المجموع:</strong> ${sale.subtotal.toFixed(1)} دينار</p>
                        <p><strong>الخصم (${sale.discountPercent}%):</strong> ${sale.discountValue.toFixed(1)} دينار</p>
                        <p><strong>المبلغ النهائي:</strong> ${sale.finalAmount.toFixed(1)} دينار</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="reprintInvoice(${index})" class="reprint-btn">طباعة الفاتورة</button>
                    <button onclick="closeModal()" class="close-btn">إغلاق</button>
                </div>
            </div>
        `;
        
        // إضافة النافذة إلى الصفحة
        document.body.appendChild(modal);
        
        // إظهار النافذة
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    } catch (error) {
        console.error('خطأ في عرض تفاصيل البيع:', error);
        showNotification('حدث خطأ أثناء عرض التفاصيل');
    }
}

// وظيفة لإغلاق النافذة المنبثقة
function closeModal() {
    const modals = document.querySelectorAll('.sale-details-modal');
    modals.forEach(modal => {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

// دالة إعادة طباعة الفاتورة
function reprintInvoice(index) {
    try {
        // الحصول على سجل البيع المطلوب
        const dateFilter = document.getElementById('sales-date-filter').value;
        const filteredSales = getFilteredSales(dateFilter);
        
        const sale = filteredSales[index];
        if (!sale) {
            showNotification('لم يتم العثور على الفاتورة المطلوبة');
            return;
        }
        
        // استخدام وظيفة الطباعة المشتركة مع تمرير معلمة الطباعة المعاد
        printInvoice(sale.items, sale.discountPercent, sale.timestamp, true);
        
        // إظهار رسالة نجاح
        showNotification('تمت إعادة طباعة الفاتورة بنجاح');
    } catch (error) {
        console.error('خطأ في إعادة طباعة الفاتورة:', error);
        showNotification('حدث خطأ أثناء إعادة طباعة الفاتورة');
    }
}

// وظيفة لحذف عملية بيع محددة
function deleteSale(index) {
    if (confirm('هل أنت متأكد من حذف هذه العملية؟')) {
        try {
            // الحصول على التاريخ المحدد وسجلات البيع المفلترة
            const dateFilter = document.getElementById('sales-date-filter').value;
            const filteredSales = getFilteredSales(dateFilter);
            
            // معرف السجل المراد حذفه
            const saleToDelete = filteredSales[index];
            
            if (saleToDelete) {
                // حذف السجل من المصفوفة الأصلية
                const newSalesRecords = dailySales.filter(sale => sale.timestamp !== saleToDelete.timestamp);
                
                // حفظ المصفوفة المحدثة
                localStorage.setItem('salesRecords', JSON.stringify(newSalesRecords));
                
                // تحديث المصفوفة المحلية
                dailySales = newSalesRecords;
                
                // تحديث العرض
                renderSalesForDate(dateFilter);
                
                // تحديث إحصائيات المبيعات
                updateSalesStatistics();
                
                // عرض رسالة نجاح
                showNotification('تم حذف العملية بنجاح');
            }
        } catch (error) {
            console.error('خطأ في حذف البيع:', error);
            showNotification('حدث خطأ أثناء حذف العملية');
        }
    }
}

// وظيفة لحذف جميع مبيعات اليوم المحدد
function deleteAllDaySales(date) {
    if (confirm('هل أنت متأكد من حذف جميع مبيعات هذا اليوم؟')) {
        try {
            // حفظ السجلات التي ليست من اليوم المحدد
            const newSalesRecords = dailySales.filter(sale => {
                if (!sale.timestamp) return true;
                const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
                return saleDate !== date;
            });
            
            // حفظ المصفوفة المحدثة
            localStorage.setItem('salesRecords', JSON.stringify(newSalesRecords));
            
            // تحديث المصفوفة المحلية
            dailySales = newSalesRecords;
            
            // تحديث العرض
            renderSalesForDate(date);
            
            // تحديث إحصائيات المبيعات
            updateSalesStatistics();
            
            // عرض رسالة نجاح
            showNotification('تم حذف جميع مبيعات اليوم بنجاح');
        } catch (error) {
            console.error('خطأ في حذف مبيعات اليوم:', error);
            showNotification('حدث خطأ أثناء حذف مبيعات اليوم');
        }
    }
}

// وظيفة لتحديث إحصائيات المبيعات
function updateSalesStatistics() {
    updateTodaySales();
    updateWeeklySales();
    updateMonthlySales();
}

// وظيفة مساعدة لحساب مجموع المبيعات في نطاق زمني
function calculateTotalSales(startDate, endDate) {
    const salesInRange = dailySales.filter(sale => {
        if (!sale || !sale.timestamp) return false;
        const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
        return saleDate >= startDate && saleDate <= endDate;
    });
    
    return salesInRange.reduce((total, sale) => total + sale.finalAmount, 0);
}

// وظيفة لتحديث مبيعات اليوم
function updateTodaySales() {
    const todaySalesElement = document.getElementById('today-sales');
    if (!todaySalesElement) return;
    
    // الحصول على تاريخ اليوم
    const today = new Date().toISOString().split('T')[0];
    
    // حساب مبيعات اليوم
    const totalTodaySales = calculateTotalSales(today, today);
    
    // تحديث النص
    todaySalesElement.textContent = `${totalTodaySales.toFixed(1)} دينار`;
}

// وظيفة لتحديث مبيعات الأسبوع
function updateWeeklySales() {
    const weeklySalesElement = document.getElementById('weekly-sales');
    if (!weeklySalesElement) return;
    
    // الحصول على تاريخ بداية الأسبوع (الأحد)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 للأحد، 1 للاثنين، إلخ
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    // حساب مبيعات الأسبوع
    const totalWeeklySales = calculateTotalSales(startDate, endDate);
    
    // تحديث النص
    weeklySalesElement.textContent = `${totalWeeklySales.toFixed(1)} دينار`;
}

// وظيفة لتحديث مبيعات الشهر
function updateMonthlySales() {
    const monthlySalesElement = document.getElementById('monthly-sales');
    if (!monthlySalesElement) return;
    
    // الحصول على تاريخ بداية الشهر
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    // حساب مبيعات الشهر
    const totalMonthlySales = calculateTotalSales(startDate, endDate);
    
    // تحديث النص
    monthlySalesElement.textContent = `${totalMonthlySales.toFixed(1)} دينار`;
}

// وظيفة عرض الإشعارات للمستخدم
function showNotification(message) {
    // إنشاء عنصر الإشعار إذا لم يكن موجودًا
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // تعيين النص والعرض
    notification.textContent = message;
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// إضافة تعديلات للـ CSS لتحسين شكل النافذة المنبثقة
function addSalesModalStyles() {
    if (document.getElementById('sales-modal-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'sales-modal-styles';
    styleElement.textContent = `
        .sale-details-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .sale-details-modal.visible {
            opacity: 1;
        }

        .modal-content {
            background-color: #fff;
            width: 80%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            direction: rtl;
        }

        .modal-header {
            background-color: #3498db;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }

        .modal-header h3 {
            margin: 0;
        }

        .close-modal {
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
        }

        .modal-body {
            padding: 20px;
        }

        .sale-info {
            margin-bottom: 20px;
        }

        .sale-items {
            margin-bottom: 20px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
        }

        .items-table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        .sale-summary {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }

        .modal-footer {
            padding: 15px;
            display: flex;
            justify-content: flex-start;
            border-top: 1px solid #ddd;
        }

        .modal-footer button {
            margin-left: 10px;
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .reprint-btn {
            background-color: #3498db;
            color: white;
        }

        .close-btn {
            background-color: #f44336;
            color: white;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// إضافة هذه الدالة إلى التنفيذ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة، بدء تهيئة نظام المبيعات');
    addSalesModalStyles();
    createSalesPanel();
    loadSalesData();
});