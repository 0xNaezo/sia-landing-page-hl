/** Schedule timeline: cards expand on tap (mobile accordion, see mobile.css). */
export function initSchedule() {
  document.querySelectorAll('.stl-card').forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('expanded'));
  });
}
