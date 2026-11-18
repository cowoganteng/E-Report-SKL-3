var namaDesa = "Desa Penari";
const STORAGE_KEY = "ereport_data_penduduk_v1";
const SESSION_KEY = "ereport_kunjungan";
const MIN_PANJANG_JUDUL = 5;
const MIN_PANJANG_DESKRIPSI = 10;
let layananAktif = true;
let laporanTerakhirDihapus = null;

const dataAwalDefault = [
  {
    id: "LPR-01",
    tanggal: "10/11/2026",
    pelapor: "Muhammad Fairuz",
    kategori: "Keamanan & Ketertiban",
    lokasi: "Rumah Pak Slamet",
    judul: "Kabel Fiber Internet Longgar",
    deskripsi: "Kabel longgar/menjuntai bikin orang celaka",
    status: "Diproses",
  },
];

//Array utama penampung data
let daftarLaporan = [];

// Mengambil element agar HTML bisa dikontrol Javascript
const elTotalCount = document.getElementById("totalCount");
const elWaitCount = document.getElementById("waitCount");
const elProcCount = document.getElementById("procCount");
const elDoneCount = document.getElementById("doneCount");
const elPercentDone = document.getElementById("percentDone");
const elNotifBox = document.getElementById("notifBox");
const elTableBody = document.getElementById("reportTableBody");
const elForm = document.querySelector("#reportForm");
const elSearchBox = document.querySelector("#searchBox");
const elStatusFilter = document.querySelector("#statusFilter");
const elGreetingTitle = document.querySelector("#greetingTitle");
const elSessionVisit = document.getElementById("sessionVisitText");
const elInfoRingkasMap = document.getElementById("infoRingkasMap");

// WEB STORAGE API (localstorage, sessionstorage)& JSON (Stringfy & Parse)
// Menyimpan dan membaca array laporan menggunakan  JSON (Stringfy & Parse)
// Mencatat jumlah kunjungan tab menggunakan session storage

function muatDataDariStorage() {
  try {
    const dataTersimpan = localStorage.getItem(STORAGE_KEY);
    if (dataTersimpan !== null) {
      // JSON.parse: Mengubah teks JSON dari localStorage kembali menjadi Array JS
      daftarLaporan = JSON.parse(dataTersimpan);
    } else {
      // Salin dari dataAwaldefault jika belum ada di localstorage
      daftarLaporan = JSON.parse(JSON.stringify(dataAwalDefault));
      simpanDataKeStorage();
    }
  } catch (err) {
    daftarLaporan = dataAwalDefault.slice();
  }
}

function simpanDataKeStorage() {
  try {
    //JSON.stringfy: Mengubah Array Object menjadi string JSON untuk disimpan
    const jsonString = JSON.stringify(daftarLaporan);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (err) {
    // Abaikan jika mode privat memblokir storage
  }
}

function catatSesiKunjungan() {
  try {
    let hitunganSesi = sessionStorage.getItem(SESSION_KEY);
    if (hitunganSesi === null) {
      hitunganSesi = 1;
    } else {
      // Oprator Aritmatika penambahan (+)
      hitunganSesi = parseInt(hitunganSesi, 10) + 1;
    }
    sessionStorage.setItem(SESSION_KEY, String(hitunganSesi));
    elSessionVisit.textContent =
      "Sesi Buka Halaman (sessionStorage): " + hitunganSesi + "x";
  } catch (err) {
    elSessionVisit.textContent = "Sesi Kunjungan : Aktif";
  }
}

// SWITCH CASE DAN FUNGSI PARAMETER
// Fungsi menerima parameter status dan mengembalikan Object berisi class badge
// serta ikon teks menggunakan struktur "switch case"

function dapatkanInfoBadgeStatus(status) {
  let badgeInfo = {
    kelasCss: "badge-menunggu",
    labelTeks: "Menunggu",
  };

  switch (status) {
    case "Menunggu":
      badgeInfo.kelasCss = "badge-menunggu";
      badgeInfo.labelTeks = "Menunggu";
      break;
    case "Diproses":
      badgeInfo.kelasCss = "badge-diproses";
      badgeInfo.labelTeks = "Diproses";
      break;
    case "Selesai":
      badgeInfo.kelasCss = "badge-selesai";
      badgeInfo.labelTeks = "Selesai";
      break;
    default:
      badgeInfo.kelasCss = "badge-menunggu";
      badgeInfo.labelTeks = status;
  }
  return badgeInfo;
}

// DOM MANIPULASI ELEMEN (textConten, innerHTML, style)
// Fungsi dengan 2 parameter (pesan, tipewarna) untuk mengubah
// tampilan kotak notifikasi secara dinamis menggunakan
// properti '.style' dan '.textContent'

function tampilkanNotifikasi(pesan, tipe) {
  elNotifBox.textContent = pesan;
  elNotifBox.style.display = "block";

  if (tipe === "error") {
    elNotifBox.style.backgroundColor = "#fee2e2";
    elNotifBox.style.color = "#dc2626";
    elNotifBox.style.borderColor = "#fca5a5";
  } else if (tipe === "warning") {
    elNotifBox.style.backgroundColor = "#fef3c7";
    elNotifBox.style.color = "#d97706";
    elNotifBox.style.borderColor = "#fde68a";
  } else {
    elNotifBox.style.backgroundColor = "#dcfce7";
    elNotifBox.style.color = "#16a34a";
    elNotifBox.style.borderColor = "#86efac";
  }

  setTimeout(function () {
    elNotifBox.style.display = "none";
  }, 3500);
}

// 1. Perulangan WHILE: Menghitung jumlah laporan berdasarkan status tertentu.
// 2. Perulangan DO-WHILE: Membuat ID Laporan unik (misal LPR-105).
// 3. Perulangan FOR: Menampilkan daftar di halaman kedua.

function hitungStatusDenganWhile(statusDicari) {
  let jumlah = 0;
  let i = 0;

  while (i < daftarLaporan.length) {
    if (daftarLaporan[i].status === statusDicari) {
      jumlah = jumlah + 1;
    }
    i++;
  }
  return jumlah;
}

function buatIdLaporanUnikDoWhile() {
  let nomorUrut = 1 + daftarLaporan.length;
  let kandidatId = "";
  let sudahAda = false;

  do {
    kandidatId = "LPR-0" + nomorUrut;
    sudahAda = false;

    for (let i = 0; i < daftarLaporan.length; i++) {
      if (daftarLaporan[i].id === kandidatId) {
        sudahAda = true;
        nomorUrut++; // Operator Increment
      }
    }
  } while (sudahAda === true);

  return kandidatId;
}

// OPERATOR (ARITMATIKA, PERBANDINGAN, LOGIKA)
// ARRAY METHOD (.filter, .map, .push, .pop)

function renderTabelStatistik() {
  const total = daftarLaporan.length;
  const menunggu = hitungStatusDenganWhile("Menunggu");
  const diproses = hitungStatusDenganWhile("Diproses");
  const selesai = hitungStatusDenganWhile("Selesai");

  // Operator Aritmatika (*, /) & Perbandingan (>) untuk menghitung
  // persentase selesai

  let persentaseSelesai = 0;
  if (total > 0) {
    persentaseSelesai = Math.round((selesai / total) * 100);
  }

  // Manipulasi DOM textContent
  elTotalCount.textContent = total;
  elWaitCount.textContent = menunggu;
  elProcCount.textContent = diproses;
  elDoneCount.textContent = selesai;
  elPercentDone.textContent = persentaseSelesai + "%";

  const kataKunci = elSearchBox.value.toLowerCase().trim();
  const statusPilihan = elStatusFilter.value;

  // Method Array .filter () + Operator Logika (&&, ||) dan Perbandingan

  const laporanTersaring = daftarLaporan.filter(function (item) {
    const cocokStatus =
      statusPilihan === "SEMUA" || item.status === statusPilihan;
    const cocokKata =
      item.judul.toLowerCase().includes(kataKunci) ||
      item.lokasi.toLowerCase().includes(kataKunci) ||
      item.pelapor.toLowerCase().includes(kataKunci) ||
      item.id.toLowerCase().includes(kataKunci);

    return cocokStatus && cocokKata;
  });

  // Method Array .map() untuk mengambil daftar ID Singkat
  const daftarIdSaja = laporanTersaring.map(function (item) {
    return item.id;
  });

  elInfoRingkasMap.textContent =
    "Menampilkan" + daftarIdSaja.length + " dari " + total + "laporan";

  if (laporanTersaring.length === 0) {
    elTableBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; color:#64748b; padding: 20px;">Tidak ada laporan yang ditemukan.</td></tr>';
    return;
  }

  // Menggunakan .map() untuk mengubah setiap Object laporan menjadi baris HTML <tr>
  const barisHTMLArray = laporanTersaring.map (function(item){
    const infoBadge = dapatkanInfoBadgeStatus(item.status);
    return `
          <tr>
            <td>
              <strong>${item.id}</strong><br>
              <span style="font-size:11px; color:#64748b;">${item.tanggal}</span>
            </td>
            <td>
              <strong style="color:#1e293b;">${item.judul}</strong>
              <div style="font-size:12px; color:#2563eb; margin: 2px 0;">${item.kategori} • Lokasi: ${item.lokasi}</div>
              <div style="font-size:12px; color:#64748b;">${item.deskripsi}</div>
            </td>
            <td>${item.pelapor}</td>
            <td><span class="badge ${infoBadge.kelasCss}">${infoBadge.labelTeks}</span></td>
            <td>
              <button type="button" class="action-btn" data-toggle="${item.id}">Ubah Status</button>
              <button type="button" class="action-btn delete" data-delete="${item.id}">Hapus</button>
            </td>
          </tr>
        `;
  });
 // Manipulasi DOM innerHTML
 elTableBody.innerHTML = barisHTMLArray.join("");
}

 // Form Handilng dan Validasi Sederhana
 // Memeriksa kelengkapan input menggunakan if -else if - else
// dan Operator Logika (&&, ||) serta Perbandingan (===, !==)

 elForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Mencegah form submit default (refresh halaman)

  const inputPelapor = document.getElementById("pelapor").value.trim();
  const inputKategori = document.getElementById("kategori").value.trim();
  const inputLokasi = document.getElementById("lokasi").value.trim();
  const inputJudul = document.getElementById("judul").value.trim();
  const inputDeskripsi = document.getElementById("deskripsi").value.trim();

  // Validasi Sederhana dengan if - else if - else & Operator Logika
  if ( inputPelapor === "" || inputLokasi === "" || inputKategori === "" || inputJudul === "" || inputDeskripsi === "") {
    tampilkanNotifikasi("Valdasi Gagal: Semua kolom harus diisi.", "error");
    return;
  } else if (inputJudul.length < MIN_PANJANG_JUDUL) {
    tampilkanNotifikasi("Validasi Gagal: Judul minimal " + MIN_PANJANG_JUDUL + "karakter", "warning");
    return;
  } else if (inputDeskripsi.length < MIN_PANJANG_DESKRIPSI) {
    tampilkanNotifikasi("Validasi Gagal: Deskripsi minimal " + MIN_PANJANG_DESKRIPSI + " karakter", "warning");
    return;
  } else if (!layananAktif) {
    tampilkanNotifikasi("Layanan sedang tidak aktif. Silakan coba lagi nanti.", "error");
    return;
  } else {
    // Jika validasi lolos, buat laporan baru
    const laporanBaru = {
      id: buatIdLaporanUnikDoWhile(),
      tanggal: new Date().toLocaleDateString(),
      pelapor: inputPelapor,
      kategori: inputKategori,
      lokasi: inputLokasi,
      judul: inputJudul,
      deskripsi: inputDeskripsi,
      status: "Menunggu",
    };

    // Method Array .push() untuk menambahkan elemen ke dalam Array
    daftarLaporan.push(laporanBaru);

    // Simpan ke localStorage & perbarui tampilan tabel
    simpanDataKeStorage();
    elForm.reset(); // Reset form input
    renderTabelStatistik();
    tampilkanNotifikasi("Laporan berhasill" + laporanBaru.id + "ditambahkan.", "success");
  }

 })

 // Method Array .pop() (Dipanggil melalui event onclick di Tombol HTML)
 // Menghapus laporan terakhir yang ditambahkan
  function hapusLaporanTerakhir() {
    if (daftarLaporan.length === 0) {
      tampilkanNotifikasi("Tidak ada laporan untuk dihapus.", "warning");
      return;
    }
    // .pop() mengambil dan menghapus elemen terakhir dari Array
    laporanTerakhirDihapus = daftarLaporan.pop();
    simpanDataKeStorage();
    renderTabelStatistik();
    tampilkanNotifikasi("Laporan terakhir (" + laporanTerakhirDihapus.id + ") telah dihapus.", "success");
  }

  // DOM EVENT HANDLING (addEventListener, onclick)
  // Menangani klik tombol "Ubah Status" dan "Hapus" pada tabel laporan serta Navigasi Menu
  elTableBody.addEventListener("click", function (e) {
    const btnUbah = e.target.closest("[data-toggle]");
    const btnHapus = e.target.closest("[data-delete]");

    if (btnUbah) {
      const idTarget = btnUbah.getAttribute("data-toggle");
      // Perulangan FOR untuk mencari objek laporan yang diklik
      for (let i = 0; i < daftarLaporan.length; i++) {
        if (daftarLaporan[i].id === idTarget) {
          // Percabangan IF untuk mengubah status secara berurutan
          if (daftarLaporan[i].status === "Menunggu") {
            daftarLaporan[i].status = "Diproses";
          } else if (daftarLaporan[i].status === "Diproses") {
            daftarLaporan[i].status = "Selesai";
          } else {
            daftarLaporan[i].status = "Menunggu";
          }
          break; // Keluar dari perulangan setelah ditemukan
        }
      }
      simpanDataKeStorage();
      renderTabelStatistik();
      tampilkanNotifikasi("Status laporan " + idTarget + " telah diperbarui.", "success");
    }
    if (btnHapus) {
      const idHapus = btnHapus.getAttribute("data-delete");
      daftarLaporan = daftarLaporan.filter(function (item) {
        return item.id !== idHapus;
      });
      simpanDataKeStorage();
      renderTabelStatistik();
      tampilkanNotifikasi("Laporan " + idHapus + " telah dihapus.", "success");
    }
  });

  elSearchBox.addEventListener("input", renderTableStatistik);
  elStatusFilter.addEventListener("change", renderTableStatistik);

  // Event Navigasi Antar Halaman
  const btnHome = document.getElementById("btnNavHome");
  const btnGuide = document.getElementById("btnNavGuide");
  const pageHome = document.getElementById("pageHome");
  const pageGuide = document.getElementById("pageGuide");

  btnHome.addEventListener("click", function(){
    btnHome.classList.add("active");
    btnGuide.classList.remove("active");
    pageHome.classList.add("active");
    pageGuide.classList.remove("active");
  });

  btnGuide.addEventListener("click", function(){
    btnGuide.classList.add("active");
    btnHome.classList.remove("active");
    pageGuide.classList.add("active");
    pageHome.classList.remove("active");
  });

  // Mengisi Pilihan Kategori Form dengan Perulangan FOR

  function isiPilihanKategori() {
    const daftarKategori = [
      "Fasilitas & Lingkungan",
      "Kebersihan & Taman",
      "Keamanan & Ketertiban",
    ];

    const selectKategori = document.getElementById("kategori");
    let opsiHTML = "";
    // Perulangan FOR untuk membuat <option> secara dinamis
    for (let i = 0 ; i < daftarKategori.length; i++) {
      opsiHTML += '<option value="' + daftarKategori[i] + '">' + daftarKategori[i] + '</option>';
    }
    selectKategori.innerHTML = opsiHTML;
    elGreetingTitle.textContent = "Selamat Datang di " + namaDesa;
  }

  // Insialisasi Aplikasi: Memuat data, mencatat sesi kunjungan, mengisi pilihan kategori, 
  // dan menampilkan tabel statistik
  muatDataDariStorage();
  catatSesiKunjungan();
  isiPilihanKategori();
  renderTabelStatistik();