# بصير — عيون المالك | صورة إنتاجية
# تعتمد Node 22 لدعم node:sqlite المدمج (قاعدة بيانات حقيقية بلا خدمة منفصلة).
FROM node:22-slim

ENV NODE_ENV=production \
    PORT=3000 \
    STORAGE=sqlite

WORKDIR /app

# تثبيت الاعتماديات أولاً للاستفادة من طبقات الكاش
# (الحزمة الوحيدة الفعلية هي @anthropic-ai/sdk الاختيارية للتحليل البصري)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

# نسخ التطبيق
COPY . .

# بناء نسخة الديمو الثابتة (لا تعطّل البناء إن فشلت)
RUN node tools/build-demo.js || true

# مجلد البيانات (قاعدة البيانات + الملفات المرفوعة + النسخ الاحتياطية) — يُركَّب كـ volume
RUN mkdir -p /app/data && chown -R node:node /app
VOLUME ["/app/data"]

USER node
EXPOSE 3000

# فحص صحة الحاوية عبر نقطة /healthz العامة
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--no-warnings", "server/server.js"]
