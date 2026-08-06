# 🚀 دليل النشر الحي | بصير — عيون المالك

هذا الدليل ينقل بصير من التطوير إلى خادم إنتاجي حقيقي. النظام **خفيف بلا اعتماديات ثقيلة**: خادم Node واحد + قاعدة بيانات SQLite مدمجة، فلا يحتاج قاعدة بيانات منفصلة.

## المتطلبات
- **Node.js ≥ 22** (لدعم `node:sqlite` المدمج) — أو Docker.
- خادم Linux بذاكرة 1GB فأكثر، ومساحة تكفي الملفات المرفوعة ونماذج BIM.
- (اختياري) نطاق وشهادة HTTPS، وخادم MediaMTX للبث المباشر للكاميرات.

## 1) التهيئة
```bash
cp .env.example .env
# حرّر .env واضبط ما يلزم (كلها اختيارية عدا JWT_SECRET للإنتاج):
#   JWT_SECRET=سر-طويل-عشوائي-للإنتاج
#   RESEND_API_KEY / SENDGRID_API_KEY + EMAIL_FROM   (البريد + إشعارات دورة المراجعة)
#   WHATSAPP_TOKEN + WHATSAPP_PHONE_ID               (واتساب)
#   ANTHROPIC_API_KEY                                 (تحليل صور الموقع)
#   CAMERA_KEY                                         (استقبال لقطات الكاميرات)
#   MEDIA_SERVER_URL                                  (البث المباشر RTSP عبر MediaMTX)
```
أي تكامل غير مهيأ **يعمل تلقائياً بوضع المحاكاة** — النظام يعمل كاملاً بدونها.

## 2) فحص الجاهزية
```bash
npm run preflight
```
يتحقق من إصدار Node، قاعدة البيانات، قابلية الكتابة، سلامة الوحدات، وحالة التكاملات — ويخرج برمز خطأ إن وُجد خلل حرج.

## 3) التشغيل

### أ) Docker (موصى به)
```bash
docker compose up -d          # يبني ويشغّل بحاوية واحدة
docker compose logs -f        # متابعة السجل
curl http://localhost:3000/healthz
```
البيانات تُحفَظ في volume باسم `bassir-data` (قاعدة البيانات + الملفات + النسخ الاحتياطية + سر التوقيع)، فتبقى عبر التحديثات.

**التحديث:**
```bash
git pull && docker compose up -d --build
```

### ب) مباشرةً بـ Node
```bash
npm install --omit=dev        # يثبّت SDK التحليل الاختياري
npm run build:demo            # (اختياري) بناء نسخة الديمو الثابتة
npm start                     # يشغّل على PORT (افتراضي 3000)
```

### ج) systemd (خادم مباشر دائم)
```bash
sudo cp deploy/bassir.service /etc/systemd/system/
# عدّل المسار (/opt/bassir) والمستخدم داخل الملف
sudo systemctl daemon-reload && sudo systemctl enable --now bassir
sudo journalctl -u bassir -f
```

## 4) الوكيل العكسي وHTTPS
لا تعرّض المنفذ 3000 مباشرةً — ضع Nginx أمامه:
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/bassir
# عدّل server_name إلى نطاقك
sudo ln -s /etc/nginx/sites-available/bassir /etc/nginx/sites-enabled/
sudo certbot --nginx -d bassir.example.com   # شهادة HTTPS مجانية
sudo nginx -t && sudo systemctl reload nginx
```
الملف يضبط `client_max_body_size 512M` لرفع نماذج BIM الكبيرة، ومهلة قراءة موسّعة، وترويسات أمان.

## 5) كاميرات الموقع (اختياري)
- **استقبال اللقطات:** اضبط `CAMERA_KEY`، ثم تدفع الكاميرا/NVR لقطة JPEG:
  ```bash
  curl -X POST https://bassir.example.com/api/cameras/CAM1/snapshot \
    -H "x-camera-key: $CAMERA_KEY" -H "Content-Type: image/jpeg" \
    --data-binary @snapshot.jpg
  ```
  إن كان `ANTHROPIC_API_KEY` مضبوطاً، تُحلَّل اللقطة آلياً وتُقارَن بنسبة نموذج BIM.
- **البث المباشر:** شغّل MediaMTX (فك التعليق في `docker-compose.yml`) واضبط `MEDIA_SERVER_URL` — فيظهر البث الحي داخل صفحة الكاميرات.

## 6) النسخ الاحتياطي
- **آلي من داخل النظام:** الأدمن ← "خادم الملفات المركزي" ← زر النسخ الاحتياطي، فتُكتب نسخة كاملة في `data/backups/`.
- **على مستوى الخادم:** انسخ مجلد `data/` (أو الـvolume) دورياً:
  ```bash
  docker run --rm -v bassir-data:/d -v $(pwd):/out alpine tar czf /out/bassir-backup-$(date +%F).tar.gz -C /d .
  ```

## 7) المراقبة والصحة
- **نقطة الصحة:** `GET /healthz` تُرجع `{status, uptime, storage, projects, version}` — يستخدمها Docker وموازِن الأحمال.
- **سجل النظام داخل التطبيق:** الأدمن وممثل المالك يريان كل عملية (دخول، إضافة، اعتماد، إرسال، رفع...).

## ملاحظات أمان
- اضبط `JWT_SECRET` صراحةً في الإنتاج (وإلا يُولَّد ويُحفَظ في `data/.jwt-secret`؛ لازم للتشغيل متعدد النسخ).
- كلمات المرور مشفّرة بـ scrypt، والتوكنات موقّعة (JWT HS256)، مع تحديد لمحاولات الدخول.
- شغّل خلف HTTPS دائماً؛ لا تكشف المنفذ 3000 للإنترنت مباشرة.
- بدّل كلمات مرور الحسابات التجريبية أو احذفها من صفحة المستخدمين قبل الإطلاق.
