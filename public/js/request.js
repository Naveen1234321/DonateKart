// public/js/request.js

// Helper to get query param
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

const itemId = getQueryParam('id');
const itemDetailsDiv = document.getElementById('itemDetails');
const requestForm = document.getElementById('requestForm');
const messageDiv = document.getElementById('message');

async function loadItem() {
    if (!itemId) {
        itemDetailsDiv.innerHTML = '<p>Invalid item ID.</p>';
        return;
    }
    try {
        const res = await fetch(`/api/items/${itemId}`);
        if (!res.ok) throw new Error('Not found');
        const item = await res.json();
        itemDetailsDiv.innerHTML = `
            <h3>${item.name}</h3>
            <img src="${item.imageUrl || 'images/no-image.png'}" alt="${item.name}" style="max-width:120px;max-height:120px;object-fit:cover;" />
            <p>${item.description}</p>
            <p><b>Category:</b> ${item.category}</p>
            <p><b>Donor:</b> ${item.donorName}</p>
            <p><b>Location:</b> ${item.location}</p>
            <p><b>Status:</b> ${item.status}</p>
        `;
        if (item.status === 'available') {
            requestForm.style.display = '';
        } else {
            requestForm.style.display = 'none';
            messageDiv.textContent = 'This item is not available for request.';
        }
    } catch (err) {
        itemDetailsDiv.innerHTML = '<p>Failed to load item details.</p>';
    }
}

requestForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        requestorName: requestForm.requestorName.value,
        requestorContact: requestForm.requestorContact.value
    };
    try {
        const res = await fetch(`/api/request/${itemId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            messageDiv.textContent = 'Request submitted successfully!';
            messageDiv.style.color = 'green';
            requestForm.reset();
            requestForm.style.display = 'none';
        } else {
            messageDiv.textContent = result.error || 'Failed to submit request.';
            messageDiv.style.color = 'red';
        }
    } catch (err) {
        messageDiv.textContent = 'Network error.';
        messageDiv.style.color = 'red';
    }
});

window.onload = loadItem; 