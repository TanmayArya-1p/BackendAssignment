import { displayError } from './error.js';


function toggleTag(tag_name) {
    const url = new URL(window.location.href);
    let tags = url.searchParams.get('tags') ? url.searchParams.get('tags').split(',') : [];
    if(tags.includes(tag_name)) {
        tags = tags.filter(tag => tag !== tag_name);
    } else {
        tags.push(tag_name);
    }
    url.searchParams.set('tags', tags.join(','));
    window.location.href = url.toString();
}
window.toggleTag = toggleTag;

function searchItems() {
    const searchInput = document.getElementById('search-input').value;
    const url = new URL(window.location.href);
    url.searchParams.set('search', searchInput);
    window.location.href = url.toString();
}
window.searchItems = searchItems;

async function deleteItem(itemid) {
    if(!confirm("Are you sure you want to delete this item?")) {
        return;
    }
    let res = await fetch(`/api/items/${itemid}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if(res.ok) {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.location.href = url.toString();
    } else {
        displayError("Failed to delete item");
    }
}
window.deleteItem = deleteItem;


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("create-item-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const description = document.getElementById("description").value.trim();
        const price = parseFloat(document.getElementById("price").value.trim());
        const tags = document.getElementById("item-tags").value.trim().split(",").map(tag => tag.trim()).filter(tag => tag !== "");
        const image = document.getElementById("file").files[0];

        if (!name || isNaN(price) || price <= 0) {
            displayError("Please enter valid item details");
            return;
        }


        let filename = null;
        if (image) {
            filename = name + "." + image.name.split(".").pop();
            const formData = new FormData();
            formData.append("image", image, filename);
            const uploadRes = await fetch("/api/items/upload", {
                method: "POST",
                body: formData,
            });
            if (uploadRes.status !== 200) {
                displayError("Failed to upload image");
                return;
            }
        }


        let candBody = { name, price, tags, description }
        if(image)  {
            candBody.image =  "/images/" + filename;
        }
            

        let res = await fetch("/api/items", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(candBody),
        });

        if (res.status === 200) {
            const url = new URL(window.location.href);
            url.searchParams.delete('error');
            window.location.href = url.toString();
        } else {
            displayError("Failed to create Item with Error: " + (await res.json()).message);
        }
    })
})