/** بصير | نواة تعدد اللغات: عربي (RTL) / إنجليزي (LTR) */
(function () {
  'use strict';

  const KEY = 'bassir-lang';
  const DICT = Object.create(null);

  function getLang() {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'ar';
  }

  function applyDocDir() {
    const lang = getLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
  }

  function setLang(lang) {
    localStorage.setItem(KEY, lang === 'en' ? 'en' : 'ar');
    applyDocDir();
  }

  function registerDict(entries) {
    for (const k in entries) {
      if (Object.prototype.hasOwnProperty.call(entries, k)) DICT[k] = entries[k];
    }
  }

  /** ترجمة نص عربي ثابت (chrome) — يُعاد كما هو في وضع العربية أو إن لم توجد ترجمة */
  function t(s) {
    if (getLang() !== 'en') return s;
    return Object.prototype.hasOwnProperty.call(DICT, s) ? DICT[s] : s;
  }

  function locale() {
    return getLang() === 'en' ? 'en-US' : 'ar-SA-u-ca-gregory';
  }

  applyDocDir();
  window.I18n = { t: t, getLang: getLang, setLang: setLang, applyDocDir: applyDocDir, registerDict: registerDict, locale: locale };
})();
