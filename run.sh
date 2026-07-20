#!/usr/bin/env bash
# بصير - عيون المالك | يعمل على الخادم البعيد داخل مجلد bassir-owner-eyes
# يستقبله deploy.sh عبر scp ثم يُشغَّل تلقائياً — أو نفّذه يدوياً بعد رفع الملف tar:
#   ./run.sh
set -euo pipefail
cd "$(dirname "$0")"

IMAGE_NAME="bassir-owner-eyes"
TAG="latest"
CONTAINER_NAME="bassir-owner-eyes"
TAR_FILE="${IMAGE_NAME}.tar"
DATA_DIR="$(pwd)/data"
PORT_FILE="$(pwd)/.port"

# هذا الخادم يستضيف عدة مشاريع أخرى (aqar-mudar, bevip-app, ...) — كل أوامر
# docker هنا مقيّدة بالاسم "bassir-owner-eyes" فقط ولا تلمس أي حاوية/صورة أخرى.

echo "==> [1/6] إيقاف وحذف حاوية bassir-owner-eyes الحالية فقط (إن وُجدت)..."
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "==> [2/6] حذف صورة bassir-owner-eyes القديمة فقط (إن وُجدت)..."
docker rmi -f "${IMAGE_NAME}:${TAG}" >/dev/null 2>&1 || true

if [ ! -f "${TAR_FILE}" ]; then
  echo "❌ لم يُعثر على ${TAR_FILE} في $(pwd) — تأكد من رفعه أولاً."
  exit 1
fi

echo "==> [3/6] تحميل الصورة الجديدة من ${TAR_FILE}..."
docker load -i "${TAR_FILE}"

echo "==> [4/6] تجهيز مجلد البيانات الدائم (data/)..."
mkdir -p "${DATA_DIR}"

# اختيار منفذ متاح تلقائياً — لا نفترض 3000 لأن الخادم يشغّل مشاريع أخرى قد تحجزه.
# يبدأ من آخر منفذ استُخدم هنا سابقاً (.port) وإلا من 3000، ثم يجرّب 3001, 3002... حتى يجد منفذاً فارغاً.
echo "==> [5/6] البحث عن منفذ متاح..."
port_in_use() { (exec 3<>/dev/tcp/127.0.0.1/"$1") 2>/dev/null && { exec 3>&-; return 0; } || return 1; }

if [ -n "${HOST_PORT:-}" ]; then
  CANDIDATE="${HOST_PORT}"
elif [ -f "${PORT_FILE}" ]; then
  CANDIDATE="$(cat "${PORT_FILE}")"
else
  CANDIDATE=3000
fi
while port_in_use "${CANDIDATE}"; do
  echo "    منفذ ${CANDIDATE} مستخدم من مشروع آخر — تجربة $((CANDIDATE + 1))..."
  CANDIDATE=$((CANDIDATE + 1))
done
HOST_PORT="${CANDIDATE}"
echo "${HOST_PORT}" > "${PORT_FILE}"
echo "    سيُستخدم المنفذ: ${HOST_PORT}"

ENV_FLAG=""
if [ -f "$(pwd)/.env" ]; then
  ENV_FLAG="--env-file $(pwd)/.env"
else
  echo "ℹ️  لا يوجد ملف .env في $(pwd) — ستعمل كل الخدمات الاختيارية بوضع المحاكاة."
  echo "    انسخ .env.example إلى .env هنا واملأه إن أردت تفعيلها، ثم أعد التشغيل."
fi

echo "==> [6/6] تشغيل الحاوية الجديدة..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:3000" \
  -v "${DATA_DIR}:/app/data" \
  ${ENV_FLAG} \
  "${IMAGE_NAME}:${TAG}"

echo ""
echo "✅ الحاوية bassir-owner-eyes تعمل على المنفذ ${HOST_PORT} — مكشوف مباشرة على الإنترنت (0.0.0.0)."
echo "   افتح: http://<server-ip>:${HOST_PORT}  (تأكد أن المنفذ مفتوح في الجدار الناري/Security Group إن لزم)"
echo "   المتابعة: docker logs -f ${CONTAINER_NAME}"
