const supabaseUrl = 'https://gyytgmnfnjjywwzjokir.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXRnbW5mbmpqeXd3empva2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjU4MjgsImV4cCI6MjA5NjQ0MTgyOH0.p3smuHmPt3nowXEPeejjx5MCyJWufLyiM4G7fSeDhes';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

let currentProjects = [];
let currentAgents = [];
let currentServices = [];
let currentMedia = [];
let currentLeads = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Tabs Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Fetch initial basic data
    await loadSettings();
    await loadCollections();
    await loadAnalytics();
    await loadLeads();

    // Setup forms
    setupSettingsForms();
    setupCollectionForms();
});

// Settings Handlers
async function loadSettings() {
    const { data: heroData } = await supabaseClient.from('hero_settings').select('*').eq('id', 1).single();
    if (heroData) {
        document.getElementById('hero-title').value = heroData.title;
        document.getElementById('hero-subtitle').value = heroData.subtitle;
        document.getElementById('hero-cta').value = heroData.cta;
    }
    const { data: aboutData } = await supabaseClient.from('about_settings').select('*').eq('id', 1).single();
    if (aboutData) {
        document.getElementById('about-vision').value = aboutData.vision;
        document.getElementById('about-mission').value = aboutData.mission;
    }
}

function setupSettingsForms() {
    document.getElementById('hero-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.textContent = "Saving...";
        await supabaseClient.from('hero_settings').upsert({ id: 1, title: document.getElementById('hero-title').value, subtitle: document.getElementById('hero-subtitle').value, cta: document.getElementById('hero-cta').value });
        btn.textContent = "Save Changes"; showToast();
    });
    document.getElementById('about-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.textContent = "Saving...";
        await supabaseClient.from('about_settings').upsert({ id: 1, vision: document.getElementById('about-vision').value, mission: document.getElementById('about-mission').value });
        btn.textContent = "Save Changes"; showToast();
    });
}

// Collection Loaders
async function loadCollections() {
    // Projects
    const { data: projData } = await supabaseClient.from('projects').select('*').order('id', { ascending: true });
    currentProjects = projData || [];
    renderProjects();
    document.getElementById('stat-projects').textContent = currentProjects.length;

    // Agents
    const { data: agentData } = await supabaseClient.from('agents').select('*').order('id', { ascending: true });
    currentAgents = agentData || [];
    renderAgents();
    document.getElementById('stat-agents').textContent = currentAgents.length;

    // Services
    const { data: servData } = await supabaseClient.from('services').select('*').order('id', { ascending: true });
    currentServices = servData || [];
    renderServices();

    // Media
    const { data: medData } = await supabaseClient.from('media_posts').select('*').order('id', { ascending: true });
    currentMedia = medData || [];
    renderMedia();
    document.getElementById('stat-media').textContent = currentMedia.length;
}

// Render Functions
function renderProjects() {
    const tbody = document.getElementById('projects-table-body');
    tbody.innerHTML = currentProjects.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>${p.category}</td>
            <td>${p.price}</td>
            <td>
                <button class="btn-text" onclick="editProject(${p.id})">Edit</button>
                <button class="btn-text text-danger" style="margin-left:10px;color:#ef4444;" onclick="deleteProject(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderAgents() {
    const tbody = document.getElementById('agents-table-body');
    tbody.innerHTML = currentAgents.map(a => `
        <tr>
            <td>${a.id}</td>
            <td>${a.name}</td>
            <td>${a.role}</td>
            <td>${a.client_rating}</td>
            <td>
                <button class="btn-text" onclick="editAgent(${a.id})">Edit</button>
                <button class="btn-text" style="margin-left:10px;color:#ef4444;" onclick="deleteAgent(${a.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderServices() {
    const tbody = document.getElementById('services-table-body');
    tbody.innerHTML = currentServices.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.title}</td>
            <td>
                <button class="btn-text" onclick="editService(${s.id})">Edit</button>
                <button class="btn-text" style="margin-left:10px;color:#ef4444;" onclick="deleteService(${s.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderMedia() {
    const tbody = document.getElementById('media-table-body');
    tbody.innerHTML = currentMedia.map(m => `
        <tr>
            <td>${m.id}</td>
            <td><span class="badge" style="background:rgba(255,255,255,0.1);color:#fff;">${m.type}</span></td>
            <td>${m.title}</td>
            <td>${m.date}</td>
            <td>
                <button class="btn-text" onclick="editMedia(${m.id})">Edit</button>
                <button class="btn-text" style="margin-left:10px;color:#ef4444;" onclick="deleteMedia(${m.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Edit Triggers (Populates Modal)
window.editProject = (id) => {
    const p = currentProjects.find(x => x.id === id);
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-title').value = p.title;
    document.getElementById('p-desc').value = p.description;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-cat').value = p.category;
    document.getElementById('p-city').value = p.city;
    document.getElementById('p-date').value = p.date;
    document.getElementById('p-img').value = p.img;
    openModal('projectModal');
};

window.editAgent = (id) => {
    const a = currentAgents.find(x => x.id === id);
    document.getElementById('a-id').value = a.id;
    document.getElementById('a-name').value = a.name;
    document.getElementById('a-role').value = a.role;
    document.getElementById('a-bio').value = a.bio;
    document.getElementById('a-img').value = a.image;
    openModal('agentModal');
};

window.editService = (id) => {
    const s = currentServices.find(x => x.id === id);
    document.getElementById('s-id').value = s.id;
    document.getElementById('s-title').value = s.title;
    document.getElementById('s-desc').value = s.description;
    document.getElementById('s-icon').value = s.icon_svg;
    openModal('serviceModal');
};

window.editMedia = (id) => {
    const m = currentMedia.find(x => x.id === id);
    document.getElementById('m-id').value = m.id;
    document.getElementById('m-type').value = m.type;
    document.getElementById('m-title').value = m.title;
    document.getElementById('m-desc').value = m.description;
    document.getElementById('m-content').value = m.content;
    document.getElementById('m-img').value = m.img;
    openModal('mediaModal');
};

// Delete Handlers
window.deleteProject = async (id) => { if(confirm('Delete project?')) { await supabaseClient.from('projects').delete().eq('id', id); loadCollections(); } };
window.deleteAgent = async (id) => { if(confirm('Delete agent?')) { await supabaseClient.from('agents').delete().eq('id', id); loadCollections(); } };
window.deleteService = async (id) => { if(confirm('Delete service?')) { await supabaseClient.from('services').delete().eq('id', id); loadCollections(); } };
window.deleteMedia = async (id) => { if(confirm('Delete post?')) { await supabaseClient.from('media_posts').delete().eq('id', id); loadCollections(); } };

// Form Submissions
function setupCollectionForms() {
    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('p-id').value;
        const payload = {
            title: document.getElementById('p-title').value,
            description: document.getElementById('p-desc').value,
            price: document.getElementById('p-price').value,
            category: document.getElementById('p-cat').value,
            city: document.getElementById('p-city').value,
            date: document.getElementById('p-date').value,
            img: document.getElementById('p-img').value,
        };
        if(id) { await supabaseClient.from('projects').update(payload).eq('id', id); } 
        else { await supabaseClient.from('projects').insert([payload]); }
        closeModal('projectModal'); loadCollections(); showToast();
    });

    document.getElementById('agent-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('a-id').value;
        const payload = {
            name: document.getElementById('a-name').value,
            role: document.getElementById('a-role').value,
            bio: document.getElementById('a-bio').value,
            image: document.getElementById('a-img').value,
        };
        if(id) { await supabaseClient.from('agents').update(payload).eq('id', id); } 
        else { await supabaseClient.from('agents').insert([payload]); }
        closeModal('agentModal'); loadCollections(); showToast();
    });

    document.getElementById('service-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('s-id').value;
        const payload = {
            title: document.getElementById('s-title').value,
            description: document.getElementById('s-desc').value,
            icon_svg: document.getElementById('s-icon').value,
        };
        if(id) { await supabaseClient.from('services').update(payload).eq('id', id); } 
        else { await supabaseClient.from('services').insert([payload]); }
        closeModal('serviceModal'); loadCollections(); showToast();
    });

    document.getElementById('media-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('m-id').value;
        const payload = {
            type: document.getElementById('m-type').value,
            title: document.getElementById('m-title').value,
            description: document.getElementById('m-desc').value,
            content: document.getElementById('m-content').value,
            img: document.getElementById('m-img').value,
            date: id ? undefined : new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
            read_time: '5 min read' // default placeholder
        };
        if(id) { await supabaseClient.from('media_posts').update(payload).eq('id', id); } 
        else { await supabaseClient.from('media_posts').insert([payload]); }
        closeModal('mediaModal'); loadCollections(); showToast();
    });
}

// Modal and Toast Utilities
window.openModal = (id) => {
    document.querySelectorAll('.admin-form').forEach(f => f.reset());
    document.querySelectorAll('input[type="hidden"]').forEach(i => i.value = ''); // clear IDs for New insertions
    document.getElementById(id).style.display = 'block';
};
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Analytics Logic
async function loadAnalytics() {
    const { data: events, error } = await supabaseClient.from('analytics_events').select('*').order('created_at', { ascending: true });
    if (!events || events.length === 0) return;

    // 1. Total Unique Users
    const uniqueUsers = new Set(events.map(e => e.visitor_id)).size;
    document.getElementById('analytics-users').textContent = uniqueUsers;

    // 2. Total Views
    document.getElementById('analytics-views').textContent = events.length;

    // 3. Top Pages
    const pageCounts = {};
    events.forEach(e => { pageCounts[e.path] = (pageCounts[e.path] || 0) + 1; });
    const sortedPages = Object.entries(pageCounts).sort((a,b) => b[1] - a[1]);
    document.getElementById('analytics-top-page').textContent = sortedPages.length > 0 ? sortedPages[0][0] : '-';

    document.getElementById('analytics-pages-body').innerHTML = sortedPages.slice(0, 5).map(p => `
        <tr><td>${p[0]}</td><td>${p[1]}</td></tr>
    `).join('');

    // 4. Top Referrers
    const refCounts = {};
    events.forEach(e => { refCounts[e.referrer] = (refCounts[e.referrer] || 0) + 1; });
    const sortedRefs = Object.entries(refCounts).sort((a,b) => b[1] - a[1]);
    document.getElementById('analytics-referrers-body').innerHTML = sortedRefs.slice(0, 5).map(r => `
        <tr><td><span style="max-width: 200px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r[0] || 'Direct'}</span></td><td>${r[1]}</td></tr>
    `).join('');

    // 5. Chart.js (Views per day)
    const days = {};
    events.forEach(e => {
        const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days[date] = (days[date] || 0) + 1;
    });

    // Check if chart exists to destroy before re-rendering
    if (window.analyticsChart) window.analyticsChart.destroy();

    const ctx = document.getElementById('viewsChart').getContext('2d');
    window.analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(days),
            datasets: [{
                label: 'Page Views',
                data: Object.values(days),
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#60a5fa',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', precision: 0 } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
            }
        }
    });
}

// Leads Logic
async function loadLeads() {
    const { data: leadsData } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
    currentLeads = leadsData || [];
    document.getElementById('stat-leads').textContent = currentLeads.length;

    const tbody = document.getElementById('leads-table-body');
    tbody.innerHTML = currentLeads.map(l => {
        const date = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const badgeColor = l.status === 'New' ? '#3b82f6' : l.status === 'Contacted' ? '#f59e0b' : '#10b981';
        return `
        <tr>
            <td>${date}</td>
            <td style="font-weight: 600;">${l.name}</td>
            <td>
                <div>${l.email}</div>
                <div style="color:#aaa;font-size:0.85rem;">${l.phone || 'N/A'}</div>
            </td>
            <td><div style="max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${l.message}">${l.message}</div></td>
            <td><span class="badge" style="background:rgba(255,255,255,0.1);color:${badgeColor}; border:1px solid ${badgeColor};">${l.status}</span></td>
            <td>
                <select onchange="updateLeadStatus(${l.id}, this.value)" style="background:rgba(0,0,0,0.3);color:#fff;border:1px solid rgba(255,255,255,0.1);padding:0.3rem;border-radius:4px;margin-right:0.5rem;">
                    <option value="New" ${l.status === 'New' ? 'selected' : ''}>New</option>
                    <option value="Contacted" ${l.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="Resolved" ${l.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                </select>
                <button class="btn-text text-danger" style="color:#ef4444;" onclick="deleteLead(${l.id})">Delete</button>
            </td>
        </tr>
    `}).join('');
}

window.updateLeadStatus = async (id, newStatus) => {
    await supabaseClient.from('leads').update({ status: newStatus }).eq('id', id);
    loadLeads();
    showToast();
};

window.deleteLead = async (id) => {
    if(confirm('Delete lead?')) {
        await supabaseClient.from('leads').delete().eq('id', id);
        loadLeads();
    }
};
