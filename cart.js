// تخزين بيانات السلة في localStorage
function loadCartData() {
    const savedCart = localStorage.getItem('sushiCart');
    return savedCart ? JSON.parse(savedCart) : [];
}

let cart = loadCartData();
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const discountPercentElement = document.getElementById('discount-percent');
const discountValueElement = document.getElementById('discount-value');
const afterDiscountElement = document.getElementById('after-discount');

// متغيرات للخصم
let discountPercent = 0;

function saveCartData() {
    localStorage.setItem('sushiCart', JSON.stringify(cart));
}

function addToCart(itemId) {
    // البحث عن العنصر في القائمة المحدثة
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    
    if (!item) {
        console.error('العنصر غير موجود في القائمة');
        return;
    }
    
    const existingCartItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCartData();
    updateCart();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCartData();
    updateCart();
}

function updateQuantity(itemId, change) {
    const cartItem = cart.find(item => item.id === itemId);
    
    if (cartItem) {
        cartItem.quantity += change;
        
        if (cartItem.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCartData();
            updateCart();
        }
    }
}

// دالة تطبيق الخصم
function applyDiscount(percent) {
    discountPercent = percent;
    updateCart();
}

function updateCart() {
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        
        cartItemDiv.innerHTML = `
            <span class="cart-item-name">${item.name}</span>
            <div class="cart-actions">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
            <span>${(item.price * item.quantity).toFixed(1)} دينار </span>
        `;
        
        cartItemsContainer.appendChild(cartItemDiv);
        
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = totalPrice.toFixed(1);
    
    // حساب الخصم والمبلغ النهائي
    const discountValue = (totalPrice * discountPercent) / 100;
    const afterDiscount = totalPrice - discountValue;
    
    // تحديث عناصر الخصم في الواجهة
    discountPercentElement.textContent = discountPercent;
    discountValueElement.textContent = discountValue.toFixed(1);
    afterDiscountElement.textContent = afterDiscount.toFixed(1);
}

function closeInvoice() {
    if (cart.length === 0) {
        alert('السلة فارغة. لا يمكن إغلاق الفاتورة.');
        return;
    }
    
    // إنشاء رقم فاتورة جديد
    const invoiceNumber = generateInvoiceNumber();
    
    // عرض الفاتورة في نافذة منبثقة
    showInvoicePopup(cart, discountPercent, invoiceNumber);
    
    // تسجيل المبيعات
    recordSale(cart, discountPercent, invoiceNumber);
    
    // تفريغ السلة
    emptyCart();
    
    // إظهار رسالة تأكيد
    showNotification('تم إغلاق الفاتورة وتسجيل المبيعات بنجاح.');
}

// دالة لعرض الفاتورة في نافذة منبثقة
function showInvoicePopup(cart, discountPercent, invoiceNumber) {
    // حساب المجاميع
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const discountValue = (subtotal * discountPercent) / 100;
    const finalAmount = subtotal - discountValue;
    
    // إنشاء HTML للفاتورة
    const now = new Date();
    
    // تنسيق التاريخ والوقت باللغة الإنجليزية
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    const formattedTime = now.toLocaleTimeString('en-US');
    
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
                    <p>Tel: 07 8910 0906</p>
                    <p><strong>RECEIPT</strong></p>
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
    cart.forEach(item => {
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


// إنشاء رقم فاتورة فريد بناءً على التاريخ والوقت
function generateInvoiceNumber() {
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

// دالة الطباعة المعدلة باستخدام الدوال المشتركة
// دالة الطباعة المعدلة لتستخدم النافذة المنبثقة
function autoPrint() {
    if (cart.length === 0) {
        alert('السلة فارغة. لا يمكن طباعة الفاتورة.');
        return;
    }
    
    // إنشاء رقم فاتورة جديد
    const invoiceNumber = generateInvoiceNumber();
    
    // عرض الفاتورة في نافذة منبثقة
    showInvoicePopup(cart, discountPercent, invoiceNumber);
}

// إضافة وظيفة تفريغ السلة - تم تعديلها لحل المشكلة
function emptyCart() {
    cart = [];
    saveCartData();
    
    // إعادة تعيين الخصم عند تفريغ السلة
    discountPercent = 0;
    updateCart();
    
    // التأكد من تحديث localStorage مباشرة
    localStorage.removeItem('sushiCart');
    localStorage.setItem('sushiCart', JSON.stringify([]));
}