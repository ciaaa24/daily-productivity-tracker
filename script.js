// 1. Ambil elemen dari HTML
const inputTugas = document.getElementById('input-tugas');
const inputKategori = document.getElementById('input-kategori');
const listContainer = document.getElementById('list-aktivitas');
const infoTotal = document.getElementById('info-total');

// 2. Load data dari LocalStorage saat web dibuka pertama kali
// Format data di otak kita: Array of Objects [{id: 1, text: "Tugas", category: "kuliah", done: false}]
let dataAktivitas = JSON.parse(localStorage.getItem('productivityData')) || [];

// Render awal
renderList();

// --- FUNGSI UTAMA ---

function tambahAktivitas() {
    const teks = inputTugas.value;
    const kategori = inputKategori.value;

    if (teks === '') {
        alert("Tulis dulu tugasnya, Pak Engineer!");
        return;
    }

    // Buat objek data baru
    const aktivitasBaru = {
        id: Date.now(), // Pakai waktu sekarang sebagai ID unik
        text: teks,
        category: kategori,
        done: false
    };

    // Masukkan ke array
    dataAktivitas.push(aktivitasBaru);
    
    // Simpan & Render
    simpanData();
    renderList();
    
    // Reset input
    inputTugas.value = '';
}

function toggleSelesai(id) {
    // Cari index tugas berdasarkan ID
    const index = dataAktivitas.findIndex(item => item.id === id);
    
    // Balik status done (true jadi false, false jadi true)
    if (index !== -1) {
        dataAktivitas[index].done = !dataAktivitas[index].done;
        simpanData();
        renderList();
    }
}

function hapusAktivitas(id) {
    // Filter array, buang yang ID-nya sama dengan yang mau dihapus
    dataAktivitas = dataAktivitas.filter(item => item.id !== id);
    simpanData();
    renderList();
}

// --- FUNGSI PEMBANTU (HELPER) ---

function simpanData() {
    // LocalStorage hanya bisa simpan TEXT, jadi array object harus di-JSON-kan
    localStorage.setItem('productivityData', JSON.stringify(dataAktivitas));
}

function renderList() {
    listContainer.innerHTML = ''; // Bersihkan list visual

    // --- BAGIAN 1: ILUSTRASI KOSONG (EMPTY STATE) ---
    // Jika belum ada tugas sama sekali, tampilkan ilustrasi teks
    if (dataAktivitas.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.7;">✨</div>
                <p style="font-size: 1rem; font-style: italic;">
                    "Hari ini belum ada fokus.<br>Mau mulai dari satu hal kecil?"
                </p>
            </div>
        `;
    } else {
        // Jika ada tugas, render seperti biasa
        dataAktivitas.forEach(item => {
            const li = document.createElement('li');
            li.className = `kategori-${item.category} ${item.done ? 'selesai' : ''}`;
            
            li.innerHTML = `
                <span onclick="toggleSelesai(${item.id})" style="cursor:pointer; flex:1;">
                    ${item.text} <small>(${item.category})</small>
                </span>
                <button class="btn-hapus" onclick="hapusAktivitas(${item.id})">×</button>
            `;

            listContainer.appendChild(li);
        });
    }

    // --- BAGIAN 2: PESAN DINAMIS (STATUS BAR) ---
    const sisa = dataAktivitas.filter(item => !item.done).length;

    // Logika Percabangan Pesan
    if (dataAktivitas.length === 0) {
        infoTotal.innerText = "Siap memulai hari ini?";
    } 
    else if (sisa === 0) {
        infoTotal.innerText = "🎉 “Hari ini kamu hebat. Istirahatlah.”";
    } 
    else if (sisa === 1) {
        // Jika tinggal 1 tugas
        infoTotal.innerText = "Satu langkah terakhir! 🏁";
    } 
    else if (sisa <= 3) {
        // Jika sisa 2 atau 3 tugas
        infoTotal.innerText = `Sedikit lagi 🌱 (${sisa} tugas tersisa)`;
    } 
    else {
        // Jika sisa banyak (> 3)
        infoTotal.innerText = `Masih ada ${sisa} tugas tersisa.`;
    }

    // Jangan lupa panggil update progress bar
    updateProgress();
}
// --- FITUR BARU: SUMMARY CARD ---

// 1. Fungsi Tanggal
function updateTanggal() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSekarang = new Date().toLocaleDateString('id-ID', options);
    document.getElementById('tanggal-text').innerText = tanggalSekarang;
}

// 2. Fungsi Nama User
function cekNamaUser() {
    // Cek apakah nama sudah ada di memori?
    let nama = localStorage.getItem('namaUser');
    
    if (!nama) {
        // Jika belum ada, tanya user
        nama = prompt("Halo! Siapa nama panggilanmu?", "Engineer");
        if (!nama) nama = "Teman"; // Default jika user klik cancel
        localStorage.setItem('namaUser', nama);
    }
    
    document.getElementById('nama-user').innerText = nama;
}

// 3. Fungsi Hitung Progress
function updateProgress() {
    const totalTugas = dataAktivitas.length;
    const tugasSelesai = dataAktivitas.filter(item => item.done).length;
    
    const progressBar = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // 1. Hitung Persentase (Hanya untuk LEBAR garis visual)
    let persentase = 0;
    if (totalTugas > 0) {
        persentase = Math.round((tugasSelesai / totalTugas) * 100);
    }
    
    // Update lebar garis (CSS tetap butuh %)
    progressBar.style.width = `${persentase}%`;

    // 2. Update Teks (Menjadi Format: "3/5 Aktivitas Selesai")
    if (totalTugas === 0) {
        progressText.innerText = '0/0 Aktivitas Selesai';
    } else {
        progressText.innerText = `${tugasSelesai}/${totalTugas} Aktivitas Selesai`;
    }
}
// Jalankan fungsi saat web dibuka
updateTanggal();
cekNamaUser();

// --- FITUR IDENTITAS USER ---

function cekNamaUser() {
    // 1. Cek apakah nama sudah tersimpan di LocalStorage?
    let nama = localStorage.getItem('namaUser');
    
    // 2. Jika TIDAK ada (artinya pengguna baru/belum pernah isi)
    if (!nama) {
        // Tampilkan pertanyaan (Prompt)
        nama = prompt("Halo! Siapa nama panggilanmu?", "Teman");
        
        // Validasi: Jika user klik Cancel atau kosongkan, beri nama default
        if (!nama) {
            nama = "Teman"; 
        }
        
        // 3. Simpan ke LocalStorage (Kunci: 'namaUser')
        localStorage.setItem('namaUser', nama);
    }
    
    // 4. Tampilkan nama di HTML
    const elemenNama = document.getElementById('nama-user');
    if (elemenNama) {
        elemenNama.innerText = nama;
    }
}

// PENTING: Panggil fungsi ini agar langsung jalan saat web dibuka
cekNamaUser();

// --- FITUR DARK MODE ---

const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// 1. Cek LocalStorage saat web dibuka
// "Apakah user sebelumnya suka gelap?"
if (localStorage.getItem('theme') === 'dark') {
    enableDarkMode();
}

// 2. Event Listener Tombol
toggleBtn.addEventListener('click', () => {
    // Cek apakah sekarang sedang dark mode?
    const isDark = body.classList.contains('dark-mode');

    if (isDark) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

// Fungsi Mengaktifkan
function enableDarkMode() {
    body.classList.add('dark-mode');
    toggleBtn.innerText = '☀️'; // Ganti ikon jadi matahari
    localStorage.setItem('theme', 'dark'); // Simpan ke memori
}

// Fungsi Mematikan
function disableDarkMode() {
    body.classList.remove('dark-mode');
    toggleBtn.innerText = '🌙'; // Ganti ikon jadi bulan
    localStorage.setItem('theme', 'light');
}