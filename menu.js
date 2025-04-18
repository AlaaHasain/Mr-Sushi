function loadMenuData() {
    const savedMenu = localStorage.getItem('sushiMenu');
    if (savedMenu) {
        return JSON.parse(savedMenu);
    } else {
        // إرجاع مصفوفة فارغة إذا لم يكن هناك بيانات مخزنة
        return [];
    }
}

// البداية بجلب بيانات القائمة المخزنة أو استخدام القائمة الافتراضية
let menuItems = loadMenuData();

// تخزين البيانات في localStorage
function saveMenuData() {
    localStorage.setItem('sushiMenu', JSON.stringify(menuItems));
}

// تحقق إذا كانت هناك بيانات مخزنة، وإلا استخدم البيانات الافتراضية
if (!localStorage.getItem('sushiMenu')) {
    saveMenuData();
}

const menuItemsContainer = document.getElementById('menu-items');
let activeCategory = 'all'; // الفئة النشطة الافتراضية هي 'all'

// إنشاء عنصر img بشكل افتراضي في حالة عدم وجود الصورة
function createDefaultImage(name) {
    // إنشاء صورة افتراضية للعناصر التي لا تحتوي على صور
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    // خلفية زرقاء فاتحة
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // نص اسم العنصر
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width/2, canvas.height/2);
    
    return canvas.toDataURL();
}

// إضافة دالة لتبديل الفئات
function switchCategory(category) {
    activeCategory = category;
    renderMenuItems();
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function renderMenuItems() {
    menuItemsContainer.innerHTML = '';
    
    // إنشاء عنصر القائمة
    const menuGrid = document.createElement('div');
    menuGrid.classList.add('menu-grid');
    
    // تصفية العناصر حسب الفئة النشطة
    let filteredItems = menuItems;
    if (activeCategory !== 'all') {
        filteredItems = menuItems.filter(item => item.category === activeCategory);
    }
    
    // تقسيم العناصر إلى صفوف (كل 4 عناصر في صف)
    let currentRow;
    filteredItems.forEach((item, index) => {
        if (index % 4 === 0) {
            currentRow = document.createElement('div');
            currentRow.classList.add('menu-row');
            currentRow.style.display = 'flex';
            currentRow.style.justifyContent = 'space-between';
            currentRow.style.marginBottom = '25px';
            menuGrid.appendChild(currentRow);
        }
        
        const menuItemDiv = document.createElement('div');
        menuItemDiv.classList.add('menu-item');
        menuItemDiv.style.width = 'calc(25% - 15px)';
        menuItemDiv.onclick = function() { 
            addToCart(item.id); 
        };
        
        // استخدام صورة افتراضية إذا كانت الصورة غير موجودة
        const imgSrc = item.image;
        
        menuItemDiv.innerHTML = `
            <img src="${imgSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='${createDefaultImage(item.name)}'">
            <div class="menu-item-info">
                <h3>${item.name}</h3>
                <p class="description">${item.description || 'وصف غير متوفر'}</p>
                <div class="menu-item-bottom">
                    <span class="price">${item.price}دينار </span>
                    <div class="item-actions">
                        <button onclick="event.stopPropagation(); addToCart(${item.id})">+ أضف للسلة</button>
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteMenuItem(${item.id})">حذف</button>
                    </div>
                </div>
            </div>
        `;
        
        if (currentRow) {
            currentRow.appendChild(menuItemDiv);
        }
    });
    
    menuItemsContainer.appendChild(menuGrid);
}

// دالة حذف عنصر من القائمة
function deleteMenuItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
        // البحث عن العنصر في القائمة وحذفه
        const index = menuItems.findIndex(item => item.id === id);
        if (index !== -1) {
            menuItems.splice(index, 1);
            // حفظ التغييرات في localStorage
            saveMenuData();
            // إعادة عرض القائمة
            renderMenuItems();
            alert('تم حذف العنصر بنجاح!');
        }
    }
}

// إضافة عنصر جديد للقائمة
function addNewMenuItem() {
    const name = document.getElementById('new-item-name').value;
    const price = parseFloat(document.getElementById('new-item-price').value);
    const description = document.getElementById('new-item-description').value;
    const category = document.getElementById('new-item-category').value;
    
    // التحقق من صحة البيانات
    if (!name || isNaN(price) || price <= 0) {
        alert('يرجى إدخال اسم وسعر صحيح للعنصر');
        return;
    }
    
    // إيجاد أعلى معرف في القائمة وإضافة 1
    const maxId = Math.max(...menuItems.map(item => item.id), 0);
    const newId = maxId + 1;
    
    // إنشاء العنصر الجديد
    const newItem = {
        id: newId,
        name: name,
        price: price,
        description: description,
        category: category,
        // استخدام صورة افتراضية
        image: null
    };
    
    // إضافة العنصر للقائمة
    menuItems.push(newItem);
    
    // حفظ القائمة المحدثة
    saveMenuData();
    
    // إعادة عرض القائمة
    renderMenuItems();
    
    // إعادة تعيين النموذج
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-description').value = '';
    
    alert('تمت إضافة العنصر الجديد بنجاح!');
}

// تنفيذ دالة عرض القائمة عند تحميل الصفحة
window.onload = function() {
    renderCategoryTabs();
    renderMenuItems();
};

// إضافة دالة لإنشاء أزرار التصنيف
function renderCategoryTabs() {
    const categoriesContainer = document.createElement('div');
    categoriesContainer.classList.add('category-tabs');
    categoriesContainer.style.display = 'flex';
    categoriesContainer.style.justifyContent = 'center';
    categoriesContainer.style.margin = '20px 0';
    categoriesContainer.style.gap = '15px';
    
    // إنشاء أزرار الفئات
    const categories = [
        { id: 'sushi', name: 'سوشي' },
        { id: 'sushi_sets', name: 'مجموعات السوشي' },
        { id: 'salad', name: 'سلطة' },
        { id: 'appetizer', name: 'مقبلات' },
        { id: 'soup', name: 'شوربات' },
        { id: 'kids_menu', name: 'منيو أطفال' },
        { id: 'dessert', name: 'حلويات' },
        { id: 'chinese', name: 'أكل صيني' },
        { id: 'drink', name: 'مشروبات' }
    ];
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.classList.add('category-btn');
        button.setAttribute('data-category', category.id);
        button.style.padding = '10px 20px';
        button.style.backgroundColor = category.id === activeCategory ? '#3498db' : '#f0f0f0';
        button.style.color = category.id === activeCategory ? 'white' : '#333';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.style.transition = 'all 0.3s ease';
        
        button.addEventListener('mouseover', function() {
            if (category.id !== activeCategory) {
                this.style.backgroundColor = '#e0e0e0';
            }
        });
        
        button.addEventListener('mouseout', function() {
            if (category.id !== activeCategory) {
                this.style.backgroundColor = '#f0f0f0';
            }
        });
        
        button.addEventListener('click', function() {
            switchCategory(category.id);
        });
        
        categoriesContainer.appendChild(button);
    });
    
    // إضافة أزرار الفئات قبل عرض العناصر
    const menuSection = document.querySelector('.menu');
    menuSection.insertBefore(categoriesContainer, menuItemsContainer);
}
