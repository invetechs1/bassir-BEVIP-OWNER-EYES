(function () {
  var lang = localStorage.getItem('bassir-lang') === 'en' ? 'en' : 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
})();
