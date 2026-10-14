(function () {
  'use strict';
  document.querySelectorAll('.tg-faq-item button[aria-controls]').forEach(function (button) {
    var answer = document.getElementById(button.getAttribute('aria-controls'));
    if (!answer) return;
    button.setAttribute('aria-expanded', 'false');
    answer.hidden = true;
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
}());
