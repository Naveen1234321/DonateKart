// public/js/my-requests.js

document.getElementById('requestorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const requestorName = e.target.requestorName.value.trim();
    const requestsList = document.getElementById('requestsList');
    const messageDiv = document.getElementById('message');
    if (!requestorName) {
        messageDiv.textContent = 'Please enter your name.';
        messageDiv.style.color = 'red';
        return;
    }
    messageDiv.textContent = '';
    requestsList.innerHTML = 'Loading...';
    try {
        const res = await fetch(`/api/my-requests/${encodeURIComponent(requestorName)}`);
        const requests = await res.json();
        if (!Array.isArray(requests) || requests.length === 0) {
            requestsList.innerHTML = '<p>No requests found for this name.</p>';
            return;
        }
        requestsList.innerHTML = '';
        requests.forEach(req => {
            const item = req.item || {};
            const div = document.createElement('div');
            div.className = 'request-card';
            div.innerHTML = `
                <h3>${item.name || 'Item not found'}</h3>
                <p>${item.description || ''}</p>
                <p><b>Category:</b> ${item.category || ''}</p>
                <p><b>Location:</b> ${item.location || ''}</p>
                <p><b>Status:</b> ${req.status}</p>
            `;
            div.style = 'border:1px solid #ccc;padding:12px;margin:12px 0;border-radius:8px;background:#fff;max-width:400px;';
            requestsList.appendChild(div);
        });
    } catch (err) {
        requestsList.innerHTML = '<p>Failed to load requests.</p>';
    }
}); 