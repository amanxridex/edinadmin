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

    // Login Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;
            if (user === 'JAADUGAR' && pass === 'EDINFRATECH1') {
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('admin-container').style.display = 'flex';
                // Fetch initial basic data
                await initDashboard();
                // Setup forms
                setupSettingsForms();
                setupCollectionForms();
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        });
    }
});

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
                <button class="btn-text text-danger" style="color:#ef4444;" onclick="deleteItem('leads', ${l.id})">Delete</button>
            </td>
        </tr>
    `}).join('');
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
    const tbody = document.getElementById('testimonials-table-body');
    if(!tbody) return;
    tbody.innerHTML = currentTestimonials.map(t => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${t.logo ? `<img src="${t.logo}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: contain; background: #fff;" />` : ''}
                    ${t.company}
                </div>
            </td>
            <td>${t.subtitle}</td>
            <td><div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.review_text}">${t.review_text}</div></td>
            <td>
                <button class="btn-text" onclick="openModal('testimonials', ${t.id})">Edit</button>
                <button class="btn-text text-danger" style="margin-left:10px;color:#ef4444;" onclick="deleteItem('testimonials', ${t.id})">Delete</button>
            </td>
        </tr>
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
