import ItemFilter from './item-filter.js';


let ctrMap = {}
let price = 0
let priceIndex = {}

let itemf = new ItemFilter(document.getElementById('item-selector'), document.getElementById('item-template'))
window.itemf = itemf;

async function initPriceIndex() {
    let res = await fetch('/api/items');
    res = await res.json();
    res.forEach(item => {
        priceIndex[item.id] = item.price;
    });
}
initPriceIndex();


export function logoutHandler() {
    fetch('/api/auth/logout', {
        method: 'POST',
    })
    .then(res => {
        if (res.status === 200) {
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    })
}
window.logoutHandler = logoutHandler;


export function toggleTag(tag) {
    itemf.toggleFilterTag(tag);
    let tagElement = document.getElementById(`${tag}-toggler`);
    if(tagElement.classList.contains('tag-selected')) {
        tagElement.classList.remove('tag-selected');
    } else {
        tagElement.classList.add('tag-selected');
    }
}
window.toggleTag = toggleTag;