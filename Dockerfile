# بصير - عيون المالك | صورة Docker
# خادم بدون اعتماديات خارجية (باستثناء @anthropic-ai/sdk الاختيارية) + SQLite مدمجة في Node

FROM node:22-alpine

WORKDIR /app

# طبقة الاعتماديات أولاً (يُعاد استخدام الكاش إن لم يتغيّر package.json)
COPY package*.json ./
RUN npm install --omit=dev

# بقية كود التطبيق
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# data/ (قاعدة SQLite + الملفات المرفوعة) يجب أن تكون مجلّد Volume دائم خارج الحاوية
VOLUME ["/app/data"]

CMD ["node", "server/server.js"]
