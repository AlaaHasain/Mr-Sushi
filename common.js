// وظائف مشتركة للطباعة وتنسيق الفواتير

// دالة إنشاء محتوى الفاتورة للطباعة (مشتركة)
function createInvoiceContent(items, discountPercent, timestamp, isReprint = false) {
    // المجموع قبل الخصم
    let totalPrice = 0;
    items.forEach(item => {
        totalPrice += item.price * item.quantity;
    });
    
    // حساب الخصم والمبلغ النهائي
    const discountValue = (totalPrice * discountPercent) / 100;
    const afterDiscount = totalPrice - discountValue;
    
    // إنشاء عنصر مؤقت للطباعة
    const printContent = document.createElement('div');
    printContent.style.direction = 'ltr'; // تغيير الاتجاه للغة الإنجليزية
    printContent.style.width = '70mm'; // تحديد عرض الطباعة
    printContent.style.fontFamily = 'Arial, sans-serif';
    printContent.style.fontSize = '10px'; // حجم خط أصغر ليناسب الطابعة الصغيرة
    printContent.style.padding = '0';
    printContent.style.margin = '0';
    printContent.style.textAlign = 'center'; // توسيط النص
    
    // تحديد التاريخ والوقت
    const invoiceDate = timestamp ? new Date(timestamp) : new Date();
    const dateString = invoiceDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
    const timeString = invoiceDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[invoiceDate.getDay()];
    
    // إنشاء ترويسة الفاتورة
    const header = document.createElement('div');
    header.style.marginBottom = '5px';
    header.style.borderBottom = '1px dashed #000';
    header.style.paddingBottom = '5px';
    
    header.innerHTML = `
        <div style="font-size: 14px; font-weight: bold;">SUSHI RESTAURANT</div>
        <div style="font-size: 9px;">Tel: 07 9719 5312</div>
        <div style="font-size: 11px; font-weight: bold;">RECEIPT${isReprint ? ' (REPRINT)' : ''}</div>
        <div style="font-size: 9px;">Date: ${dateString} (${dayName})</div>
        <div style="font-size: 9px;">Time: ${timeString}</div>
    `;
    
    printContent.appendChild(header);
    
    // إنشاء خط فاصل
    const divider1 = document.createElement('div');
    divider1.style.borderBottom = '1px dashed #000';
    divider1.style.margin = '5px 0';
    printContent.appendChild(divider1);
    
    // إنشاء جدول للعناصر
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '9px';
    
    // إنشاء رأس الجدول
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // إنشاء عناوين الأعمدة
    const headers = ['Item', 'Qty', 'Price', 'Total'];
    const widths = ['40%', '15%', '20%', '25%'];
    const aligns = ['left', 'center', 'right', 'right'];
    
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.width = widths[index];
        th.style.textAlign = aligns[index];
        th.style.paddingBottom = '3px';
        th.style.borderBottom = '1px solid #000';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // إنشاء جسم الجدول
    const tbody = document.createElement('tbody');
    
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        const row = document.createElement('tr');
        
        // تقصير اسم العنصر إذا كان طويلاً جداً
        let itemName = item.name;
        if (itemName.length > 12) {
            itemName = itemName.substring(0, 10) + '...';
        }
        
        // إنشاء خلايا الصف
        const cells = [
            itemName,
            item.quantity,
            item.price.toFixed(1),
            itemTotal.toFixed(1)
        ];
        
        cells.forEach((cellText, index) => {
            const td = document.createElement('td');
            td.textContent = cellText;
            td.style.textAlign = aligns[index];
            td.style.paddingTop = '3px';
            td.style.paddingBottom = '3px';
            if (index === 0) {
                td.style.paddingLeft = '2px';
                td.style.overflow = 'hidden';
                td.style.textOverflow = 'ellipsis';
                td.style.whiteSpace = 'nowrap';
            }
            if (index === 3) {
                td.style.paddingRight = '2px';
            }
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    printContent.appendChild(table);
    
    // خط فاصل
    const divider2 = document.createElement('div');
    divider2.style.borderBottom = '1px dashed #000';
    divider2.style.marginTop = '5px';
    divider2.style.marginBottom = '5px';
    printContent.appendChild(divider2);
    
    // المجموع قبل الخصم
    const subtotalSection = document.createElement('div');
    subtotalSection.style.display = 'flex';
    subtotalSection.style.justifyContent = 'space-between';
    subtotalSection.style.marginBottom = '5px';
    subtotalSection.style.fontSize = '10px';
    subtotalSection.style.paddingRight = '2px';
    subtotalSection.innerHTML = `
        <span style="text-align: left; padding-left: 2px;">SUBTOTAL:</span>
        <span style="text-align: right;">${totalPrice.toFixed(1)} JD</span>
    `;
    printContent.appendChild(subtotalSection);
    
    // معلومات الخصم (تظهر فقط عند وجود خصم)
    if (discountPercent > 0) {
        const discountSection = document.createElement('div');
        discountSection.style.display = 'flex';
        discountSection.style.justifyContent = 'space-between';
        discountSection.style.marginBottom = '5px';
        discountSection.style.fontSize = '10px';
        discountSection.style.paddingRight = '2px';
        discountSection.innerHTML = `
            <span style="text-align: left; padding-left: 2px;">DISCOUNT (${discountPercent}%):</span>
            <span style="text-align: right;">-${discountValue.toFixed(1)} JD</span>
        `;
        printContent.appendChild(discountSection);
    }
    
    // المجموع النهائي بعد الخصم
    const totalSection = document.createElement('div');
    totalSection.style.fontWeight = 'bold';
    totalSection.style.display = 'flex';
    totalSection.style.justifyContent = 'space-between';
    totalSection.style.marginBottom = '5px';
    totalSection.style.fontSize = '11px';
    totalSection.style.paddingRight = '2px';
    totalSection.innerHTML = `
        <span style="text-align: left; padding-left: 2px;">TOTAL:</span>
        <span style="text-align: right;">${afterDiscount.toFixed(1)} JD</span>
    `;
    
    printContent.appendChild(totalSection);
    
    // خط فاصل
    const divider3 = document.createElement('div');
    divider3.style.borderBottom = '1px dashed #000';
    divider3.style.marginBottom = '5px';
    printContent.appendChild(divider3);
    
    // تذييل الفاتورة باللغة الإنجليزية
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.paddingTop = '5px';
    footer.style.fontSize = '9px';
    footer.innerHTML = `
        <div style="margin-bottom: 3px;">Thank you for your visit!</div>
        <div>Enjoy your meal</div>
    `;
    
    printContent.appendChild(footer);
    
    return {
        content: printContent,
        totalPrice: totalPrice,
        discountValue: discountValue,
        afterDiscount: afterDiscount
    };
}

// دالة الطباعة المشتركة المعدلة
function printInvoice(items, discountPercent, timestamp, isReprint = false) {
    if (items.length === 0) {
        alert('لا توجد عناصر للطباعة.');
        return;
    }
    
    // إنشاء رقم فاتورة جديد أو استخدام الموجود في حالة إعادة الطباعة
    const invoiceNumber = isReprint ? generateDefaultInvoiceNumber() : generateDefaultInvoiceNumber();
    
    // استخدام النافذة المنبثقة بدلاً من طريقة الطباعة المباشرة
    printSaleInvoicePopup(items, discountPercent, timestamp, invoiceNumber);
    
    // إرجاع بيانات الفاتورة للاستخدام اللاحق إذا لزم الأمر
    let totalPrice = 0;
    items.forEach(item => {
        totalPrice += item.price * item.quantity;
    });
    
    const discountValue = (totalPrice * discountPercent) / 100;
    const afterDiscount = totalPrice - discountValue;
    
    return {
        content: null, // لم نعد بحاجة إلى محتوى الطباعة المباشر
        totalPrice: totalPrice,
        discountValue: discountValue,
        afterDiscount: afterDiscount
    };
}

// دالة لعرض نافذة منبثقة للطباعة من المبيعات
function printSaleInvoicePopup(items, discountPercent, timestamp, invoiceNumber) {
    // حساب المجاميع
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const discountValue = (subtotal * discountPercent) / 100;
    const finalAmount = subtotal - discountValue;
    
    // إنشاء HTML للفاتورة
    const invoiceDate = timestamp ? new Date(timestamp) : new Date();
    
    // تنسيق التاريخ والوقت باللغة الإنجليزية
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = invoiceDate.toLocaleDateString('en-US', options);
    const formattedTime = invoiceDate.toLocaleTimeString('en-US');
    
    let invoiceHTML = `
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Mr Sushi Receipt - ${invoiceNumber}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 10px;
                    text-align: center;
                }
                .receipt {
                    width: 300px;
                    margin: 0 auto;
                    padding: 10px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 5px; /* تقليل المسافة */
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 3px 0; /* تقليل المسافة بين الفقرات */
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 5px 0; /* تقليل المسافة */
                }
                .items-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    margin-bottom: 3px; /* تقليل المسافة */
                    padding-bottom: 3px; /* إضافة مسافة قبل الخط */
                    border-bottom: 2px solid #000; /* خط متصل غامق */
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2px; /* تقليل المسافة */
                    line-height: 1.2; /* تقليل المسافة بين الأسطر */
                }
                .totals {
                    text-align: right;
                    margin-top: 5px; /* تقليل المسافة */
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2px; /* تقليل المسافة */
                }
                .footer {
                    text-align: center;
                    margin-top: 10px; /* تقليل المسافة */
                    font-size: 14px;
                }
                .footer p {
                    margin: 3px 0; /* تقليل المسافة بين الفقرات */
                }
                @media print {
                    .no-print {
                        display: none;
                    }
                    body {
                        margin: 0;
                        padding: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1>Mr Sushi</h1>
                    <p>Tel: 07 9719 5312</p>
                    <p><strong>RECEIPT (REPRINT)</strong></p>
                    <p>${formattedDate}</p>
                    <p>${formattedTime}</p>
                </div>
                
                <div class="divider"></div>
                
                <div class="items-header">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Total</span>
                </div>
    `;
    
    // إضافة العناصر
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        invoiceHTML += `
            <div class="item-row">
                <span>${item.name}</span>
                <span>${item.quantity}</span>
                <span>${item.price.toFixed(1)}</span>
                <span>${itemTotal.toFixed(1)}</span>
            </div>
        `;
    });
    
    // إضافة المجاميع والخصم
    invoiceHTML += `
                <div class="divider"></div>
                
                <div class="totals">
                    <div class="total-row">
                        <span><strong>Subtotal:</strong></span>
                        <span>${subtotal.toFixed(1)} JD</span>
                    </div>
    `;
    
    // إضافة الخصم فقط إذا كان موجوداً
    if (discountPercent > 0) {
        invoiceHTML += `
                    <div class="total-row">
                        <span><strong>Discount (${discountPercent}%):</strong></span>
                        <span>${discountValue.toFixed(1)} JD</span>
                    </div>
        `;
    }
    
    invoiceHTML += `
                    <div class="total-row">
                        <span><strong>Total:</strong></span>
                        <span>${finalAmount.toFixed(1)} JD</span>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="footer">
                    <p>Thank you for visit Mr Sushi</p>
                    <p>Enjoy your meal</p>
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Print Receipt</button>
                    <button onclick="window.close()">Close</button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // فتح نافذة منبثقة وعرض الفاتورة فيها
    const popupWindow = window.open('', 'invoicePopup', 'width=400,height=600');
    popupWindow.document.open();
    popupWindow.document.write(invoiceHTML);
    popupWindow.document.close();
}

// دالة تسجيل المبيعات (مشتركة) - تم تعديلها لتشمل رقم الفاتورة
function recordSale(items, discountPercent, invoiceNumber = null) {
    if (items.length === 0) return null;
    
    // حساب القيم الإجمالية
    let totalAmount = 0;
    items.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    
    // حساب قيمة الخصم والمبلغ النهائي
    const discountValue = (totalAmount * discountPercent) / 100;
    const finalAmount = totalAmount - discountValue;
    
    // إنشاء سجل للمبيعات
    const saleRecord = {
        items: JSON.parse(JSON.stringify(items)), // نسخة عميقة من العناصر
        timestamp: new Date().toISOString(), // تحديث الوقت بالتوقيت الحالي
        subtotal: totalAmount,
        discountPercent: discountPercent,
        discountValue: discountValue,
        finalAmount: finalAmount,
        amountAfterDiscount: finalAmount,
        invoiceNumber: invoiceNumber || generateDefaultInvoiceNumber() // إضافة رقم الفاتورة
    };
    
    // الحصول على سجلات المبيعات السابقة من LocalStorage
    let salesRecords = JSON.parse(localStorage.getItem('salesRecords') || '[]');
    
    // إضافة السجل الجديد
    salesRecords.push(saleRecord);
    
    // حفظ السجلات في LocalStorage
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
    
    return saleRecord;
}

// دالة إنشاء رقم فاتورة افتراضي إذا لم يتم تمرير واحد
function generateDefaultInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

// دالة إظهار الإشعارات
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
