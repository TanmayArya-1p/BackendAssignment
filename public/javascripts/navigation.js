

function navigatePage(next=true) {
    let curr = Number(document.getElementById('page-current').innerText.trim())-1;
    let total = Number(document.getElementById('page-total').innerText.trim())-1;
    const url = new URL(window.location.href);

    if(next) {
        url.searchParams.set('page', Math.min(curr+1,total));
    } else {
        url.searchParams.set('page', Math.max(curr-1,0));
    }
    window.location.href = url.toString();
}
window.navigatePage = navigatePage;