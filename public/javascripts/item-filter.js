

export default class ItemFilter {
    constructor(item_container,template) {
        this.items = [];
        this.container = item_container;
        this.filterTags = []
        this.ctrMap = {}
        this.instructionMap = {}
        this.template = template;
        this.itemComponents = {}
        this.addedPrice = 0;

        this.populateItems();
    }

    async populateItems() {
        let res = await fetch("/api/items" , {headers: {"Content-Type": "application/json"}})
        this.items = await res.json();
        for(const i of this.items) {
            this.ctrMap[i.id] = 0;
        }
        this.init();
    }

    render() {
        for(const i of this.items) {
            let item = this.itemComponents[i.id];
            if (this.filterTags.length === 0 || this.filterTags.some(tag => i.tags.map(a => a[1]).includes(tag))) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        }
    }

    init() {
        this.container.innerHTML = "";
        for(const i of this.items) {
            let item = this.template.cloneNode(true);
            item.style.display = "flex";
            item.querySelector(".item-name").textContent = i.name;
            item.querySelector(".item-description").textContent = i.description;
            item.querySelector(".item-price").textContent = "Price: ₹"+ String(i.price);
            item.querySelector(".item-image").src = i.image || "/images/default.png";
            item.querySelector(".item-ctr").textContent = this.ctrMap[i.id].ctr ? this.ctrMap[i.id].ctr : 0;
            item.querySelector(".item-incr").addEventListener("click", () => {
                this.ctrMap[i.id]++;
                this.addedPrice += i.price;
                this.updateAddedPrice();
                item.querySelector(".item-ctr").textContent = Number(this.ctrMap[i.id] ? this.ctrMap[i.id] : 0);
            }
            );
            item.querySelector(".item-decr").addEventListener("click", () => {
                if(this.ctrMap[i.id] > 0) {
                    this.ctrMap[i.id]--;
                    this.addedPrice -= i.price;
                    this.updateAddedPrice();
                    item.querySelector(".item-ctr").textContent = this.ctrMap[i.id] ? this.ctrMap[i.id] : 0;
                }
            });
            item.querySelector(".item-instructions").value = this.instructionMap[i.id] || "";
            item.querySelector(".item-instructions").addEventListener("input", (e) => {
                this.instructionMap[i.id] = e.target.value;
            });
            
            let tag_template = item.querySelector(".item-tags-template");
            let tag_container = item.querySelector("#tags");
            for(const j of i.tags.map(a=>a[1]))  {
                let tag = tag_template.cloneNode(true);
                tag.style.display = "block";
                tag.textContent = j;
                tag_container.appendChild(tag);
            }
            


            this.container.appendChild(item);
            this.itemComponents[i.id] = item;
        }
        this.render()

    }

    addFilterTag(tag) {
        if (!this.filterTags.includes(tag)) {
            this.filterTags.push(tag);
            this.render();
        }
    }

    updateAddedPrice() {
        const cnt = document.getElementById("addedPrice");
        cnt.textContent = String(this.addedPrice);
    }

    removeFilterTag(tag) {
        const index = this.filterTags.indexOf(tag);
        if (index !== -1) {
            this.filterTags.splice(index, 1);
            this.render();
        }
    }

    toggleFilterTag(tag) {
        if (this.filterTags.includes(tag)) {
            this.removeFilterTag(tag);
        } else {
            this.addFilterTag(tag);
        }
    }

    clearFilterTags() {
        this.filterTags = [];
        this.render();
    }

    reapplyFilter(filter_tags) {
        this.filterTags = filter_tags;
        this.render();
    }

    async addItemsToOrder(order_id) {
        let items = [];
        for(const i of this.items) {
            if(this.ctrMap[i.id] > 0) {
                items.push({
                    item_id: i.id,
                    quantity: this.ctrMap[i.id],
                    instructions: this.instructionMap[i.id] ? this.instructionMap[i.id] : ""
                });
            }
        }
        if(items.length === 0) {
            alert("No items selected");
            return;
        }
        for(const i of items) {
            await fetch(`/api/orders/${order_id}/items`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(i)
            })
        }
        window.location.reload()

    }
}
