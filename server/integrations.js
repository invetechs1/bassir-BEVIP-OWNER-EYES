/**
 * بصير | طبقة الخدمات الحقيقية (تُفعَّل بمتغيرات البيئة — انظر .env.example)
 *
 *  البريد الإلكتروني : RESEND_API_KEY (+ EMAIL_FROM)  أو  SENDGRID_API_KEY
 *  واتساب            : WHATSAPP_TOKEN + WHATSAPP_PHONE_ID  (WhatsApp Cloud API من Meta)
 *  الذكاء الاصطناعي  : ANTHROPIC_API_KEY (+ ANTHROPIC_MODEL اختياري)
 *                      يتطلب:  npm install @anthropic-ai/sdk
 *  لقطات الكاميرات   : CAMERA_KEY — مفتاح تدفع به الكاميرا/NVR لقطاتها إلى النظام
 *
 * أي خدمة غير مهيأة تعمل في وضع المحاكاة مع توضيح ذلك في سجل النظام.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ============ تحميل .env (بدون اعتماديات) ============
function loadEnv() {
  const envFile = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(function (line) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}
loadEnv();

// ============ البريد الإلكتروني ============
function emailProvider() {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SENDGRID_API_KEY) return 'sendgrid';
  return null;
}

async function sendEmail(to, subject, html) {
  const provider = emailProvider();
  if (!provider) { const e = new Error('البريد غير مهيأ'); e.notConfigured = true; throw e; }
  const from = process.env.EMAIL_FROM || 'Bassir <reports@bassir.app>';

  let res;
  if (provider === 'resend') {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: from, to: [to], subject: subject, html: html })
    });
  } else {
    res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from.replace(/.*<|>.*/g, '') || from },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      })
    });
  }
  if (!res.ok) throw new Error('فشل إرسال البريد (' + provider + '): ' + res.status + ' ' + (await res.text()).slice(0, 200));
  return { provider: provider };
}

// ============ واتساب (Meta WhatsApp Cloud API) ============
function whatsappConfigured() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

async function sendWhatsapp(to, body) {
  if (!whatsappConfigured()) { const e = new Error('واتساب غير مهيأ'); e.notConfigured = true; throw e; }
  const phone = String(to).replace(/[^0-9]/g, '').replace(/^0/, process.env.WHATSAPP_COUNTRY_CODE || '966');
  const res = await fetch('https://graph.facebook.com/v21.0/' + process.env.WHATSAPP_PHONE_ID + '/messages', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: body } })
  });
  if (!res.ok) throw new Error('فشل إرسال واتساب: ' + res.status + ' ' + (await res.text()).slice(0, 200));
  return { provider: 'whatsapp-cloud-api' };
}

// ============ الذكاء الاصطناعي (Anthropic Claude — رؤية حاسوبية) ============
function aiSdk() {
  try { return require('@anthropic-ai/sdk'); } catch (e) { return null; }
}

function aiConfigured() {
  return !!(process.env.ANTHROPIC_API_KEY && aiSdk());
}

const AI_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    progress: { type: 'integer', description: 'نسبة الإنجاز المرصودة بصرياً 0-100' },
    summary: { type: 'string', description: 'وصف موجز بالعربية لما تظهره الصورة' },
    observations: { type: 'array', items: { type: 'string' }, description: 'ملاحظات فنية بالعربية' },
    safety: { type: 'array', items: { type: 'string' }, description: 'ملاحظات سلامة إن وجدت، بالعربية' }
  },
  required: ['progress', 'summary', 'observations', 'safety'],
  additionalProperties: false
};

/**
 * تحليل صورة موقع إنشائي: يعيد { progress, summary, observations[], safety[] }
 */
async function analyzeImage(buffer, mime, context) {
  if (!process.env.ANTHROPIC_API_KEY) { const e = new Error('الذكاء الاصطناعي غير مهيأ: أضف ANTHROPIC_API_KEY في ملف .env'); e.notConfigured = true; throw e; }
  const Anthropic = aiSdk();
  if (!Anthropic) { const e = new Error('حزمة @anthropic-ai/sdk غير مثبتة — نفّذ: npm install @anthropic-ai/sdk'); e.notConfigured = true; throw e; }

  const client = new Anthropic();
  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    output_config: { format: { type: 'json_schema', schema: ANALYSIS_SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mime || 'image/jpeg', data: buffer.toString('base64') }
        },
        {
          type: 'text',
          text: 'أنت مهندس إشراف خبير في نظام "بصير" لمراقبة المشاريع الإنشائية. حلّل صورة الموقع هذه وقدّر نسبة إنجاز الأعمال الظاهرة فيها.\n' +
            'سياق الصورة: ' + (context.area || 'غير محدد') +
            (context.reported != null ? '\nالنسبة المُبلَّغة من الاستشاري لهذه المنطقة: ' + context.reported + '%' : '') +
            '\nأعد النتيجة وفق المخطط المطلوب، بالعربية، وكن واقعياً في التقدير.'
        }
      ]
    }]
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('تعذر تحليل الصورة (رفض نموذج الذكاء الاصطناعي المعالجة)');
  }
  const text = response.content.filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
  try { return JSON.parse(text); }
  catch (e) { throw new Error('استجابة تحليل غير صالحة من النموذج'); }
}

// ============ الحالة الكلية ============
function status() {
  return {
    email: { configured: !!emailProvider(), provider: emailProvider() },
    whatsapp: { configured: whatsappConfigured(), provider: whatsappConfigured() ? 'whatsapp-cloud-api' : null },
    ai: {
      configured: aiConfigured(),
      keyPresent: !!process.env.ANTHROPIC_API_KEY,
      sdkInstalled: !!aiSdk(),
      model: AI_MODEL
    },
    cameraIngest: { configured: !!process.env.CAMERA_KEY }
  };
}

module.exports = {
  sendEmail: sendEmail,
  sendWhatsapp: sendWhatsapp,
  analyzeImage: analyzeImage,
  status: status,
  emailProvider: emailProvider,
  whatsappConfigured: whatsappConfigured,
  aiConfigured: aiConfigured
};
