function navigatePage(next = true,id="") {
  let curr =
    Number(document.getElementById("page-current"+id).innerText.trim()) - 1;
  let total =
    Number(document.getElementById("page-total"+id).innerText.trim()) - 1;
  if (curr === -1 && total === -1) return;
  const url = new URL(window.location.href);
  if (next) {
    url.searchParams.set("page"+id, Math.min(curr + 1, total));
  } else {
    url.searchParams.set("page"+id, Math.max(curr - 1, 0));
  }
  window.location.href = url.toString();
}
window.navigatePage = navigatePage;
