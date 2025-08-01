// public/js/items.js

async function loadItems() {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = 'Loading...';
    try {
        const res = await fetch('/api/items');
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) {
            itemsList.innerHTML = '<p>No donation items available.</p>';
            return;
        }
        itemsList.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <img src="${item.imageUrl || 'images/no-image.png'}" alt="${item.name}" style="max-width:120px;max-height:120px;object-fit:cover;" />
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p><b>Category:</b> ${item.category}</p>
                <p><b>Donor:</b> ${item.donorName}</p>
                <p><b>Location:</b> ${item.location}</p>
                <p><b>Status:</b> ${item.status}</p>
                <a href="request.html?id=${item._id}" class="request-btn" ${item.status !== 'available' ? 'style="pointer-events:none;opacity:0.5;"' : ''}>Request Item</a>
            `;
            div.style = 'border:1px solid #ccc;padding:12px;margin:12px 0;border-radius:8px;background:#fff;max-width:400px;';
            itemsList.appendChild(div);
        });
    } catch (err) {
        itemsList.innerHTML = '<p>Failed to load items.</p>';
    }
}

window.onload = loadItems; 