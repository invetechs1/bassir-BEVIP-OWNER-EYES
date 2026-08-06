# بصير - عيون المالك | صورة Docker
# خادم بدون اعتماديات خارجية أساسية (فقط pdfkit/arabic-reshaper للتقارير، @anthropic-ai/sdk اختيارية) + SQLite مدمجة في Node

FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    STORAGE=sqlite

WORKDIR /app

# طبقة الاعتماديات أولاً (يُعاد استخدام الكاش إن لم يتغيّر package.json)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

# بقية كود التطبيق
COPY . .

# بناء نسخة الديمو الثابتة (لا تعطّل البناء إن فشلت)
RUN node tools/build-demo.js || true

# مجلدا البيانات: data/ (قاعدة SQLite) و uploads-external (تخزين خارجي اختياري عبر UPLOADS_DIR) —
# يُركَّبان كـ Volume دائم خارج الحاوية. تُنشآن هنا مسبقاً بملكية node لتعمل مع USER غير الجذر أدناه؛
# عند تركيبهما كـ bind mount من مجلد على المضيف، تأكد أن الأخير قابل للكتابة لنفس المستخدم (uid 1000) —
# انظر run.sh الذي يضبط الصلاحيات تلقائياً عند إنشاء مجلدات المضيف.
RUN mkdir -p /app/data /app/uploads-external && chown -R node:node /app
VOLUME ["/app/data", "/app/uploads-external"]

USER node
EXPOSE 3000

# فحص صحة الحاوية عبر نقطة /healthz العامة
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--no-warnings", "server/server.js"]
