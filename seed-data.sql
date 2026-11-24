-- بيانات تجريبية عربية للمتجر التقني
-- شغّل هذا الملف مرة واحدة من Supabase > SQL Editor > New query.
-- يستخدم ON CONFLICT / NOT EXISTS لتقليل تكرار السجلات عند إعادة التشغيل.
-- لا ينشئ جداول ولا يغيّر سياسات RLS.

insert into public.categories (name, slug, type, description, is_active)
values
 ('الهواتف الذكية','smartphones','product','هواتف ذكية وإكسسواراتها',true),
 ('الإكسسوارات التقنية','tech-accessories','product','ملحقات وأجهزة تقنية للاستخدام اليومي',true),
 ('أخبار التقنية','technology-news','news','آخر المستجدات والأخبار التقنية',true),
 ('خدمات الاتصالات','telecom-services','service','خدمات متعلقة بأرقام وخطوط الاتصالات',true)
on conflict (slug) do nothing;

insert into public.products (category_id,name,slug,description,price,old_price,sku,stock,is_published)
select c.id,v.name,v.slug,v.description,v.price,v.old_price,v.sku,v.stock,true
from (values
 ('smartphones','سماعة لاسلكية بتقنية Bluetooth','wireless-bluetooth-earbuds','سماعة لاسلكية عملية للاستماع إلى الموسيقى وإجراء المكالمات، بتصميم مريح وعلبة شحن صغيرة.',18500::numeric,22000::numeric,'TS-EAR-001',18),
 ('tech-accessories','شاحن سريع USB-C','usb-c-fast-charger','شاحن سريع بتصميم مدمج ومنفذ USB-C، مناسب للاستخدام المنزلي والمكتبي. تحقق من توافق قدرة الشحن مع جهازك قبل الطلب.',12500::numeric,15000::numeric,'TS-CHG-002',25),
 ('tech-accessories','بطارية متنقلة 10000mAh','power-bank-10000','بطارية متنقلة بسعة 10000mAh لمساعدتك على شحن هاتفك أثناء التنقل، بحجم يسهل حمله في الحقيبة.',24000::numeric,27000::numeric,'TS-PB-003',12),
 ('smartphones','حامل هاتف مكتبي قابل للتعديل','adjustable-phone-stand','حامل ثابت للهاتف قابل لتعديل زاوية الرؤية، مناسب لمكالمات الفيديو ومشاهدة المحتوى والعمل المكتبي.',6500::numeric,null,'TS-ST-004',30)
) as v(category_slug,name,slug,description,price,old_price,sku,stock)
join public.categories c on c.slug=v.category_slug
on conflict (slug) do nothing;

insert into public.product_images (product_id,image_url,is_main,sort_order)
select p.id,v.image_url,true,0
from (values
 ('wireless-bluetooth-earbuds','https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85'),
 ('usb-c-fast-charger','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85'),
 ('power-bank-10000','https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1000&q=85'),
 ('adjustable-phone-stand','https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=85')
) as v(product_slug,image_url)
join public.products p on p.slug=v.product_slug
where not exists (select 1 from public.product_images pi where pi.product_id=p.id and pi.image_url=v.image_url);

insert into public.offers (product_id,title,description,image_url,discount_price,start_at,end_at,is_active)
select p.id,'عرض خاص على السماعة اللاسلكية','احصل على السماعة اللاسلكية بسعر مخفض لفترة محدودة. الكمية محدودة، تواصل معنا لتأكيد التوفر.','https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85',16500,now(),now()+interval '30 days',true
from public.products p
where p.slug='wireless-bluetooth-earbuds'
  and not exists (select 1 from public.offers o where o.title='عرض خاص على السماعة اللاسلكية');

insert into public.news (category_id,title,slug,summary,content,image_url,is_published,published_at)
select c.id,v.title,v.slug,v.summary,v.content,v.image_url,true,now()
from (values
 ('دليل مبسط لاختيار شاحن مناسب لهاتفك','how-to-choose-phone-charger','اختيار الشاحن المناسب لا يعتمد على الشكل فقط؛ تحقق من قدرة الشحن ونوع المنفذ وتوافق جهازك.','قبل شراء الشاحن، راجع القدرة التي يدعمها هاتفك ونوع منفذ الشحن ومعايير الحماية. استخدام شاحن متوافق يساعد على الاستفادة من سرعة الشحن التي يدعمها الجهاز. لا تعتمد على وصف الشحن السريع وحده، بل تحقق من المواصفات الفعلية للشاحن والهاتف.','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=85'),
 ('نصائح للحفاظ على عمر البطارية','practical-battery-care-tips','عادات بسيطة مثل تجنب الحرارة المرتفعة واستخدام شاحن موثوق تساعد في الحفاظ على البطارية.','تؤثر الحرارة المرتفعة على كفاءة بطاريات الهواتف مع مرور الوقت. احرص على عدم ترك الهاتف تحت أشعة الشمس، واستخدم شاحناً وكابلاً موثوقين، وتجنب تشغيل التطبيقات الثقيلة أثناء ارتفاع حرارة الجهاز. تختلف خصائص الشحن وإدارة البطارية من هاتف إلى آخر، لذلك راجع إرشادات الشركة المصنعة.','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85'),
 ('كيف تختار سماعة لاسلكية تناسب استخدامك؟','choosing-wireless-earbuds','قارن بين جودة الصوت والميكروفون وراحة الاستخدام وعمر البطارية قبل اتخاذ قرار الشراء.','عند اختيار سماعة لاسلكية، حدد أولاً استخدامك الأساسي: المكالمات أو الموسيقى أو التنقل. قارن جودة الميكروفون وراحة السماعة وثباتها وعمر البطارية، وتأكد من توافقها مع هاتفك. كما يُفضّل الاطلاع على سياسة الضمان والاستبدال قبل الشراء.','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85')
) as v(title,slug,summary,content,image_url)
join public.categories c on c.slug='technology-news'
where not exists (select 1 from public.news n where n.slug=v.slug);

-- إخفاء خدمات الصيانة/التصليح المنشورة حالياً، دون حذفها من قاعدة البيانات.
update public.services
set is_published=false
where name ilike '%صيانة%' or name ilike '%تصليح%';

insert into public.services (category_id,name,slug,description,price,image_url,is_published)
select c.id,
 'سنة استقبال لرقم سبأفون',
 'sabafon-one-year-incoming-validity',
 'حافظ على إمكانية استقبال المكالمات على رقمك في سبأفون لمدة عام كامل مقابل 500 ريال فقط. لا تدع رقمك ينقطع عنك أو تفوتك اتصالات الأهل والعمل؛ اطلب الخدمة الآن، وسنساعدك في إتمام التجديد بعد التحقق من حالة الرقم وتوفر الخدمة وفق أنظمة سبأفون.',
 500,
 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=1200&q=85',
 true
from public.categories c
where c.slug='telecom-services'
  and not exists (select 1 from public.services s where s.slug='sabafon-one-year-incoming-validity');

-- ضع رقم واتساب المتجر من لوحة الإدارة > إعدادات المتجر قبل استقبال الطلبات.