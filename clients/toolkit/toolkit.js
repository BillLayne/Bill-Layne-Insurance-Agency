'use strict';
const reviewForm = document.getElementById('review-form');
const printTopics = document.getElementById('print-topics');
const printButton = document.getElementById('print-review');
function updateReview() {
  const selected = [...reviewForm.querySelectorAll('input:checked')];
  printTopics.replaceChildren(...selected.map(input => {
    const item = document.createElement('li');
    item.textContent = input.value;
    return item;
  }));
  printButton.disabled = selected.length === 0;
  document.getElementById('review-status').textContent = selected.length
    ? `${selected.length} topic${selected.length === 1 ? '' : 's'} selected for your review.`
    : 'Select any topics you’d like to discuss.';
}
reviewForm.addEventListener('change', updateReview);
printButton.addEventListener('click', () => window.print());
window.addEventListener('pageshow', updateReview);
updateReview();
