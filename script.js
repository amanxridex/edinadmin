const supabaseUrl = 'https://gyytgmnfnjjywwzjokir.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXRnbW5mbmpqeXd3empva2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjU4MjgsImV4cCI6MjA5NjQ0MTgyOH0.p3smuHmPt3nowXEPeejjx5MCyJWufLyiM4G7fSeDhes';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

let currentProjects = [];
let currentAgents = [];
let currentServices = [];
let currentMedia = [];
let currentLeads = [];
let currentTestimonials = [];

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

    // Check session on load
    if (sessionStorage.getItem('jaadugar_auth') === 'true') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-container').style.display = 'flex';
        initDashboard();
        setupSettingsForms();
        setupCollectionForms();
    }

    // Login Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;
            if (user === 'JAADUGAR' && pass === 'EDINFRATECH1') {
                sessionStorage.setItem('jaadugar_auth', 'true');
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('admin-container').style.display = 'flex';
                await initDashboard();
                setupSettingsForms();
                setupCollectionForms();
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        });
    }
});

window.logout = () => {
    sessionStorage.removeItem('jaadugar_auth');
    location.reload();
};

async function initDashboard() {
    loadCollections();
    loadSettings();
    loadSiteContent();
    loadTestimonials();
    loadLeads();
    loadAnalytics();
}

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
                <button class="btn-text text-danger" style="margin-left:10px;color:#ef4444;" onclick="deleteItem('projects', ${p.id})">Delete</button>
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
                <button class="btn-text" style="margin-left:10px;color:#ef4444;" onclick="deleteItem('agents', ${a.id})">Delete</button>
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
                <button class="btn-text" style="margin-left:10px;color:#ef4444;" onclick="deleteItem('services', ${s.id})">Delete</button>
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
                <button class="btn-text" style="margin-left:10px;color:#ef4444;" onclick="deleteItem('media_posts', ${m.id})">Delete</button>
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
    const preview = document.getElementById('p-img-preview');
    if(p.img) { preview.src = p.img; preview.style.display = 'block'; } else { preview.style.display = 'none'; }
    document.getElementById('p-img-file').value = '';
    openModal('projectModal');
};

window.editAgent = (id) => {
    const a = currentAgents.find(x => x.id === id);
    document.getElementById('a-id').value = a.id;
    document.getElementById('a-name').value = a.name;
    document.getElementById('a-role').value = a.role;
    document.getElementById('a-bio').value = a.bio;
    document.getElementById('a-img').value = a.image;
    const preview = document.getElementById('a-img-preview');
    if(a.image) { preview.src = a.image; preview.style.display = 'block'; } else { preview.style.display = 'none'; }
    document.getElementById('a-img-file').value = '';
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
    const preview = document.getElementById('m-img-preview');
    if(m.img) { preview.src = m.img; preview.style.display = 'block'; } else { preview.style.display = 'none'; }
    document.getElementById('m-img-file').value = '';
    openModal('mediaModal');
};

// Delete Handlers
async function deleteItem(table, id) {
    if(confirm('Delete item?')) {
        await supabaseClient.from(table).delete().eq('id', id);
        if(table === 'leads') loadLeads();
        else if(table === 'testimonials') loadTestimonials();
        else loadCollections();
    }
}

// Storage Uploader
async function uploadImage(fileElement) {
    const file = fileElement.files[0];
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabaseClient.storage
        .from('IMG-AG')
        .upload(fileName, file);
        
    if (uploadError) {
        console.error('Upload Error:', uploadError);
        alert('Image upload failed! Ensure bucket "IMG-AG" exists and is public.');
        return null;
    }
    
    const { data } = supabaseClient.storage.from('IMG-AG').getPublicUrl(fileName);
    return data.publicUrl;
}

// Form Submissions
function setupCollectionForms() {
    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.textContent = 'Saving...';
        
        let imgUrl = document.getElementById('p-img').value;
        const newImgUrl = await uploadImage(document.getElementById('p-img-file'));
        if (newImgUrl) imgUrl = newImgUrl;

        const id = document.getElementById('p-id').value;
        const payload = {
            title: document.getElementById('p-title').value,
            description: document.getElementById('p-desc').value,
            price: document.getElementById('p-price').value,
            category: document.getElementById('p-cat').value,
            city: document.getElementById('p-city').value,
            date: document.getElementById('p-date').value,
            img: imgUrl,
        };
        if(id) { await supabaseClient.from('projects').update(payload).eq('id', id); } 
        else { await supabaseClient.from('projects').insert([payload]); }
        closeModal('projectModal'); loadCollections(); showToast();
        btn.textContent = 'Save Project';
    });

    document.getElementById('agent-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.textContent = 'Saving...';

        let imgUrl = document.getElementById('a-img').value;
        const newImgUrl = await uploadImage(document.getElementById('a-img-file'));
        if (newImgUrl) imgUrl = newImgUrl;

        const id = document.getElementById('a-id').value;
        const payload = {
            name: document.getElementById('a-name').value,
            role: document.getElementById('a-role').value,
            bio: document.getElementById('a-bio').value,
            image: imgUrl,
        };
        if(id) { await supabaseClient.from('agents').update(payload).eq('id', id); } 
        else { await supabaseClient.from('agents').insert([payload]); }
        closeModal('agentModal'); loadCollections(); showToast();
        btn.textContent = 'Save Agent';
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
        const btn = e.target.querySelector('button'); btn.textContent = 'Saving...';

        let imgUrl = document.getElementById('m-img').value;
        const newImgUrl = await uploadImage(document.getElementById('m-img-file'));
        if (newImgUrl) imgUrl = newImgUrl;

        const id = document.getElementById('m-id').value;
        const payload = {
            type: document.getElementById('m-type').value,
            title: document.getElementById('m-title').value,
            description: document.getElementById('m-desc').value,
            content: document.getElementById('m-content').value,
            img: imgUrl,
            date: id ? undefined : new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
            read_time: '5 min read' 
        };
        if(id) { await supabaseClient.from('media_posts').update(payload).eq('id', id); } 
        else { await supabaseClient.from('media_posts').insert([payload]); }
        closeModal('mediaModal'); loadCollections(); showToast();
        btn.textContent = 'Save Post';
    });
}

// Modal and Toast Utilities
window.openModal = (id) => {
    document.querySelectorAll('.admin-form').forEach(f => f.reset());
    document.querySelectorAll('input[type="hidden"]').forEach(i => i.value = ''); 
    document.querySelectorAll('img[id$="-preview"]').forEach(img => { img.style.display = 'none'; img.src = ''; }); 
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

    const uniqueUsers = new Set(events.map(e => e.visitor_id)).size;
    document.getElementById('stat-users').textContent = uniqueUsers;
    document.getElementById('stat-views').textContent = events.length;

    const pageCounts = {};
    events.forEach(e => { pageCounts[e.path] = (pageCounts[e.path] || 0) + 1; });
    const sortedPages = Object.entries(pageCounts).sort((a,b) => b[1] - a[1]);
    document.getElementById('stat-top').textContent = sortedPages.length > 0 ? sortedPages[0][0] : '-';

    document.getElementById('top-pages-tbody').innerHTML = sortedPages.slice(0, 5).map(p => `
        <tr style="transition: background 0.2s;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.03)'" onmouseout="this.style.backgroundColor='transparent'">
            <td style="padding: 1rem 0.75rem; color: #d1d5db; border-bottom: 1px solid rgba(255,255,255,0.05);">${p[0]}</td>
            <td style="padding: 1rem 0.75rem; color: #fff; text-align: right; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05);">${p[1]}</td>
        </tr>
    `).join('');

    const refCounts = {};
    events.forEach(e => { refCounts[e.referrer] = (refCounts[e.referrer] || 0) + 1; });
    const sortedRefs = Object.entries(refCounts).sort((a,b) => b[1] - a[1]);
    document.getElementById('referrers-tbody').innerHTML = sortedRefs.slice(0, 5).map(r => `
        <tr style="transition: background 0.2s;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.03)'" onmouseout="this.style.backgroundColor='transparent'">
            <td style="padding: 1rem 0.75rem; color: #d1d5db; border-bottom: 1px solid rgba(255,255,255,0.05);"><span style="max-width: 200px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r[0] || 'Direct'}</span></td>
            <td style="padding: 1rem 0.75rem; color: #fff; text-align: right; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05);">${r[1]}</td>
        </tr>
    `).join('');

    const today = new Date();
    const daysArr = [];
    for(let i=29; i>=0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        daysArr.push(d.toISOString().split('T')[0]);
    }
    const viewsPerDay = daysArr.map(d => events.filter(e => e.created_at.startsWith(d)).length);
    if (window.analyticsChart) window.analyticsChart.destroy();
    const ctx = document.getElementById('viewsChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
    window.analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: daysArr.map(d => d.substring(5)),
            datasets: [{
                label: 'Page Views',
                data: viewsPerDay,
                borderColor: '#8b5cf6',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#111827',
                pointBorderColor: '#8b5cf6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#a0a0a0',
                    bodyColor: '#fff',
                    bodyFont: { size: 14, weight: 'bold' },
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) { return context.parsed.y + ' Views'; }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, 
                    border: { display: false },
                    ticks: { color: '#6b7280', precision: 0, padding: 10 } 
                },
                x: { 
                    grid: { display: false, drawBorder: false }, 
                    border: { display: false },
                    ticks: { color: '#6b7280', maxTicksLimit: 10, padding: 10 } 
                }
            }
        }
    });
}

// Leads Logic
async function loadLeads() {
    const { data: leadsData } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
    currentLeads = leadsData || [];
    document.getElementById('stat-leads').textContent = currentLeads.length;

    const countBadge = document.getElementById('leads-count-badge');
    if (countBadge) countBadge.textContent = currentLeads.length;

    const grid = document.getElementById('leads-grid');
    if (!grid) return;

    if (currentLeads.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1); color: #9ca3af;">No incoming leads yet.</div>`;
        return;
    }

    grid.innerHTML = currentLeads.map(l => {
        const date = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        let badgeColor = l.status === 'New' ? '#3b82f6' : l.status === 'Contacted' ? '#f59e0b' : '#10b981';
        let badgeBg = l.status === 'New' ? 'rgba(59, 130, 246, 0.1)' : l.status === 'Contacted' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        
        return `
        <div style="background: linear-gradient(145deg, rgba(30,40,60,0.4), rgba(15,20,30,0.6)); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; position: relative; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s, box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0 0 0.2rem 0; color: #fff; font-size: 1.2rem; font-weight: 600;">${l.name}</h3>
                    <div style="color: #9ca3af; font-size: 0.85rem;">${date}</div>
                </div>
                <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${l.status}</span>
            </div>

            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.02);">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: #d1d5db; font-size: 0.9rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <a href="mailto:${l.email}" style="color: #60a5fa; text-decoration: none;">${l.email}</a>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #d1d5db; font-size: 0.9rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span>${l.phone || 'No phone provided'}</span>
                </div>
            </div>

            <div style="flex: 1; margin-bottom: 1.5rem;">
                <p style="margin: 0; color: #e5e7eb; font-size: 0.95rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" title="${l.message}">
                    "${l.message}"
                </p>
            </div>

            <div style="display: flex; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; align-items: center;">
                <select onchange="updateLeadStatus(${l.id}, this.value)" style="flex: 1; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px; outline: none; cursor: pointer;">
                    <option value="New" ${l.status === 'New' ? 'selected' : ''}>Mark as New</option>
                    <option value="Contacted" ${l.status === 'Contacted' ? 'selected' : ''}>Mark Contacted</option>
                    <option value="Resolved" ${l.status === 'Resolved' ? 'selected' : ''}>Mark Resolved</option>
                </select>
                <button onclick="if(confirm('Delete lead?')) deleteItem('leads', ${l.id})" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)';" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)';">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
        `
    }).join('');
}

window.updateLeadStatus = async (id, newStatus) => {
    await supabaseClient.from('leads').update({ status: newStatus }).eq('id', id);
    loadLeads();
    showToast();
};

// Testimonials Logic
async function loadTestimonials() {
    const { data: tests } = await supabaseClient.from('testimonials').select('*').order('id', { ascending: true });
    currentTestimonials = tests || [];
    const grid = document.getElementById('testimonials-grid');
    if(!grid) return;
    grid.innerHTML = currentTestimonials.map(t => `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden; transition: transform 0.3s ease, border-color 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='rgba(74, 139, 250, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.05)';">
            
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; padding: 0.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    <img src="${t.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.company)}&background=random`}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.company)}&background=random';" />
                </div>
                <div>
                    <h4 style="margin: 0; color: #fff; font-size: 1.1rem; font-weight: 600;">${t.company}</h4>
                    <span style="color: ${t.box_color || '#4a8bfa'}; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${t.subtitle}</span>
                </div>
            </div>

            <div style="flex: 1; margin-top: 0.5rem;">
                <p style="margin: 0; color: #a0a0a0; font-size: 0.95rem; line-height: 1.6; font-style: italic;">"${t.review_text}"</p>
            </div>

            <div style="display: flex; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; margin-top: auto;">
                <button onclick="openModal('testimonials', ${t.id})" style="flex: 1; background: rgba(74, 139, 250, 0.1); color: #4a8bfa; border: 1px solid rgba(74, 139, 250, 0.2); padding: 0.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='rgba(74, 139, 250, 0.2)';" onmouseout="this.style.background='rgba(74, 139, 250, 0.1)';">Edit</button>
                <button onclick="if(confirm('Delete testimonial?')) deleteItem('testimonials', ${t.id})" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)';" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)';">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            
        </div>
    `).join('');
}

// Site Content Logic
async function loadSiteContent() {
    const { data: site } = await supabaseClient.from('site_settings').select('*').single();
    if (site) {
        if(document.getElementById('site-email')) document.getElementById('site-email').value = site.contact_email;
        if(document.getElementById('site-phone')) document.getElementById('site-phone').value = site.contact_phone;
        if(document.getElementById('site-address')) document.getElementById('site-address').value = site.contact_address;
    }

    const { data: meth } = await supabaseClient.from('methodology_settings').select('*').single();
    if (meth) {
        if(document.getElementById('meth-heading')) document.getElementById('meth-heading').value = meth.heading;
        if(document.getElementById('meth-sub')) document.getElementById('meth-sub').value = meth.subheading;
        if(document.getElementById('meth-c1-title')) document.getElementById('meth-c1-title').value = meth.circle1_title;
        if(document.getElementById('meth-c1-desc')) document.getElementById('meth-c1-desc').value = meth.circle1_desc;
        if(document.getElementById('meth-c2-title')) document.getElementById('meth-c2-title').value = meth.circle2_title;
        if(document.getElementById('meth-c2-desc')) document.getElementById('meth-c2-desc').value = meth.circle2_desc;
        if(document.getElementById('meth-c3-title')) document.getElementById('meth-c3-title').value = meth.circle3_title;
        if(document.getElementById('meth-c3-desc')) document.getElementById('meth-c3-desc').value = meth.circle3_desc;
    }

    const { data: co } = await supabaseClient.from('company_overview_settings').select('*').single();
    if (co) {
        if(document.getElementById('co-heading')) document.getElementById('co-heading').value = co.heading;
        if(document.getElementById('co-sub')) document.getElementById('co-sub').value = co.subheading;
        if(document.getElementById('co-stats')) document.getElementById('co-stats').value = typeof co.stats_json === 'string' ? co.stats_json : JSON.stringify(co.stats_json, null, 2);
        if(document.getElementById('co-values')) document.getElementById('co-values').value = typeof co.values_json === 'string' ? co.values_json : JSON.stringify(co.values_json, null, 2);
    }
}

window.saveSiteContent = async () => {
    try {
        await supabaseClient.from('site_settings').upsert({
            id: 1,
            contact_email: document.getElementById('site-email').value,
            contact_phone: document.getElementById('site-phone').value,
            contact_address: document.getElementById('site-address').value
        });

        await supabaseClient.from('methodology_settings').upsert({
            id: 1,
            heading: document.getElementById('meth-heading').value,
            subheading: document.getElementById('meth-sub').value,
            circle1_title: document.getElementById('meth-c1-title').value,
            circle1_desc: document.getElementById('meth-c1-desc').value,
            circle2_title: document.getElementById('meth-c2-title').value,
            circle2_desc: document.getElementById('meth-c2-desc').value,
            circle3_title: document.getElementById('meth-c3-title').value,
            circle3_desc: document.getElementById('meth-c3-desc').value
        });

        const statsJsonStr = document.getElementById('co-stats').value;
        const valuesJsonStr = document.getElementById('co-values').value;
        
        let stats_json;
        let values_json;
        try {
            stats_json = JSON.parse(statsJsonStr);
            values_json = JSON.parse(valuesJsonStr);
        } catch (e) {
            alert('Invalid JSON in Stats or Values field. Please correct it before saving.');
            return;
        }

        await supabaseClient.from('company_overview_settings').upsert({
            id: 1,
            heading: document.getElementById('co-heading').value,
            subheading: document.getElementById('co-sub').value,
            stats_json: stats_json,
            values_json: values_json
        });

        showToast();
    } catch (e) {
        console.error(e);
        alert('Failed to save configuration');
    }
}
