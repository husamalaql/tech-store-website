
/* =====================================
   تشغيل المتجر والاتصال بقاعدة البيانات
===================================== */

// التحقق من وجود مكتبة Supabase والإعدادات
if (!window.supabase || !SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
    console.error("Supabase configuration is missing.");
    document.getElementById("main-content").textContent =
        "تعذر إعداد الاتصال بقاعدة البيانات.";
} else {

    // إنشاء اتصال Supabase
    const db = window.supabase.createClient(
        SUPABASE_CONFIG.URL,
        SUPABASE_CONFIG.ANON_KEY
    );

    // حفظ إعدادات المتجر
    let storeSettings = null;

    // عناصر الصفحة
    const header = document.getElementById("site-header");
    const main = document.getElementById("main-content");
    const footer = document.getElementById("site-footer");


    /* =====================================
       جلب إعدادات المتجر
    ===================================== */

    async function loadStoreSettings() {

        try {

            const { data, error } = await db
                .from("site_settings")
                .select("*")
                .eq("id", 1)
                .single();

            if (error) {
                throw error;
            }

            storeSettings = data;

            renderHeader();
            renderHome();
            renderFooter();

        } catch (error) {

            console.error("Store settings error:", error);

            main.textContent =
                "تعذر تحميل بيانات المتجر. يرجى المحاولة لاحقاً.";

        }
    }


    /* =====================================
       رأس الموقع
    ===================================== */

    function renderHeader() {

        const storeName =
            storeSettings.store_name || "متجري التقني";

        const logo = storeSettings.logo_url;

        header.className = "site-header";

        header.innerHTML = `
            <div class="container header-inner">

                <a href="index.html" class="store-logo">
                    ${
                        logo
                        ? `<img src="${escapeHTML(logo)}"
                               alt="${escapeHTML(storeName)}"
                               style="height:45px;width:auto;">`
                        : escapeHTML(storeName)
                    }
                </a>

                <nav class="main-nav">
                    <a href="index.html">الرئيسية</a>
                    <a href="#products">المنتجات</a>
                    <a href="#offers">العروض</a>
                    <a href="#news">الأخبار</a>
                    <a href="#services">الخدمات</a>
                    <a href="#contact">اتصل بنا</a>
                </nav>

            </div>
        `;
    }


    /* =====================================
       الصفحة الرئيسية
    ===================================== */

    function renderHome() {

        main.innerHTML = `

            <section class="section">
                <div class="container">

                    <h1 class="section-title">
                        مرحباً بك في
                        ${escapeHTML(
                            storeSettings.store_name || "متجري التقني"
                        )}
                    </h1>

                    <p>
                        ${escapeHTML(
                            storeSettings.store_description || ""
                        )}
                    </p>

                </div>
            </section>

            <section class="section" id="products">
                <div class="container">

                    <h2 class="section-title">
                        أحدث المنتجات
                    </h2>

                    <div class="products-grid" id="products-container">
                        <p class="loading">جاري تحميل المنتجات...</p>
                    </div>

                </div>
            </section>

            <section class="section" id="offers">
                <div class="container">
                    <h2 class="section-title">أحدث العروض</h2>
                    <div id="offers-container">
                        <p class="loading">جاري تحميل العروض...</p>
                    </div>
                </div>
            </section>

            <section class="section" id="news">
                <div class="container">
                    <h2 class="section-title">الأخبار التقنية</h2>
                    <div id="news-container">
                        <p class="loading">جاري تحميل الأخبار...</p>
                    </div>
                </div>
            </section>

            <section class="section" id="services">
                <div class="container">
                    <h2 class="section-title">خدماتنا</h2>
                    <div id="services-container">
                        <p class="loading">جاري تحميل الخدمات...</p>
                    </div>
                </div>
            </section>

        `;

        loadProducts();
        loadOffers();
    }


    /* =====================================
       تحميل المنتجات
    ===================================== */

    async function loadProducts() {

        const container =
            document.getElementById("products-container");

        try {

            const { data, error } = await db
                .from("products")
                .select(`
                    id,
                    name,
                    price,
                    old_price,
                    product_images (
                        image_url,
                        is_main
                    )
                `)
                .eq("is_published", true)
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                container.textContent = "لا توجد منتجات حالياً.";
                return;
            }

            container.innerHTML = data.map(product => {

                const mainImage = product.product_images?.find(
                    image => image.is_main
                );

                const imageUrl = mainImage?.image_url || "";

                return `
                    <article class="product-card">

                        ${
                            imageUrl
                            ? `<img class="product-image"
                                   src="${escapeHTML(imageUrl)}"
                                   alt="${escapeHTML(product.name)}">`
                            : `<div class="product-image"></div>`
                        }

                        <div class="product-info">

                            <h3 class="product-name">
                                ${escapeHTML(product.name)}
                            </h3>

                            <p class="product-price">
                                ${formatPrice(product.price)}
                            </p>

                        </div>

                    </article>
                `;

            }).join("");

        } catch (error) {

            console.error("Products error:", error);

            container.textContent =
                "تعذر تحميل المنتجات.";

        }
    }


    /* =====================================
       تذييل الموقع
    ===================================== */

    function renderFooter() {

        const phone = storeSettings.phone_number || "";
        const whatsapp = storeSettings.whatsapp_number || "";
        const email = storeSettings.email || "";
        const address = storeSettings.address || "";

        footer.className = "site-footer";

        footer.innerHTML = `

            <div class="container" id="contact">

                <h2>
                    ${escapeHTML(
                        storeSettings.store_name || "متجري التقني"
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        storeSettings.store_description || ""
                    )}
                </p>

                ${phone ? `<p>الهاتف: ${escapeHTML(phone)}</p>` : ""}

                ${whatsapp ? `<p>واتساب: ${escapeHTML(whatsapp)}</p>` : ""}

                ${email ? `<p>البريد: ${escapeHTML(email)}</p>` : ""}

                ${address ? `<p>العنوان: ${escapeHTML(address)}</p>` : ""}

                <p>
                    جميع الحقوق محفوظة
                    © ${new Date().getFullYear()}
                </p>

            </div>

        `;
    }


    /* =====================================
       أدوات مساعدة
    ===================================== */

    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );

    }


    function formatPrice(price) {

        return new Intl.NumberFormat("ar-YE", {
            maximumFractionDigits: 2
        }).format(Number(price)) +
        " " +
        escapeHTML(storeSettings?.currency || "YER");

    }

/* =====================================
   تحميل العروض
===================================== */

async function loadOffers() {

    const container = document.getElementById("offers-container");

    try {

        const now = new Date().toISOString();

        const { data, error } = await db
            .from("offers")
            .select(`
                id,
                title,
                description,
                discount_price,
                image_url,
                start_at,
                end_at,
                products (
                    name,
                    price
                )
            `)
            .eq("is_active", true)
            .lte("start_at", now)
            .gte("end_at", now)
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.textContent = "لا توجد عروض نشطة حالياً.";
            return;
        }

        container.innerHTML = data.map(offer => `

            <article class="product-card">

                ${
                    offer.image_url
                    ? `<img class="product-image"
                           src="${escapeHTML(offer.image_url)}"
                           alt="${escapeHTML(offer.title)}">`
                    : ""
                }

                <div class="product-info">

                    <h3 class="product-name">
                        ${escapeHTML(offer.title)}
                    </h3>

                    <p>${escapeHTML(offer.description || "")}</p>

                    ${
                        offer.products
                        ? `<p>المنتج: ${escapeHTML(offer.products.name)}</p>`
                        : ""
                    }

                    <p class="product-price">
                        ${
                            offer.discount_price !== null
                            ? formatPrice(offer.discount_price)
                            : "عرض خاص"
                        }
                    </p>

                </div>

            </article>

        `).join("");

    } catch (error) {

        console.error("Offers error:", error);
        container.textContent = "تعذر تحميل العروض.";

    }
}


    /* =====================================
       بدء تشغيل المتجر
    ===================================== */

    loadStoreSettings();

}
