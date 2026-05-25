let editIndex = -1;
let editRow = null;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSAkIaNJxwx1lsid2q9PZkQ1uHRBrNpd16dp3L5OgG6FXYWWKXBEZC01A5b6T9DOWw/exec";

function ambilDataForm(){
  hitungSemua();

  return {
    // =====================
    // DATA PASIEN
    // =====================
    tanggal: document.getElementById("tanggal").value,
    kategori: document.getElementById("kategori").value,
    nama: document.getElementById("namaPasien").value,
    mr: document.getElementById("mrPasien").value,
    diagnosa: document.getElementById("diagnosaPasien").value,
    tindakan: document.getElementById("tindakan").value,
    usia: document.getElementById("usia").value,
    tb: document.getElementById("tb").value,
    bb: document.getElementById("bb").value,
    bsa: document.getElementById("hasilBSA").innerText,
    ebv: document.getElementById("hasilEBV").innerText,
    faktorEbv: document.getElementById("hasilFaktor").innerText,

    // =====================
    // FLOW
    // =====================
    flowTable: document.getElementById("flowTableBody").innerHTML,
    flowReduction: document.getElementById("flowReductionTable").innerHTML,

    // =====================
    // KANUL
    // =====================
    kanulAorta: document.getElementById("kanulAorta").innerText,
    kanulVena: document.getElementById("kanulVena").innerText,
    kanulLeftVent: document.getElementById("kanulLeftVent").innerText,
    kanulAntegrade: document.getElementById("kanulAntegrade").innerText,
    kanulRetrograde: document.getElementById("kanulRetrograde").innerText,

    // =====================
    // OKSIGENATOR
    // =====================
    oksigenator: document.getElementById("oksigenator").innerText,
    customPack: document.getElementById("customPack").innerText,
    tubingSize: document.getElementById("tubingSize").innerText,
    estimasiPriming: document.getElementById("estimasiPriming").innerText,

    // =====================
    // HB
    // =====================
    ebvAuto: document.getElementById("ebvAuto").value,
    priming: document.getElementById("priming").value,
    hbAwal: document.getElementById("hbAwal").value,
    hbPrediksi: document.getElementById("hasilHbPrediksi").innerText.replace("Prediksi Hb : ",""),

    // =====================
    // STRATEGI PRIMING
    // =====================
    jenisPriming: document.getElementById("jenisPriming").value,
    jumlahPRC: document.getElementById("jumlahPRC").value,
    primingTable: document.getElementById("primingTable").innerHTML,

    // =====================
    // OBAT
    // =====================
    tranex: document.getElementById("tranex").innerText,
    methyl: document.getElementById("methyl").innerText,

    // =====================
    // KARDIOPLEGIA
    // =====================
    jenisKardioplegia: document.getElementById("jenisKardioplegia").value,
    dosisInduksi: document.getElementById("dosisInduksiKardioplegia").innerText,
    dosisMaintenance: document.getElementById("dosisMaintenanceKardioplegia").innerText,
    flowCPG: document.getElementById("flowCPG").innerText
  };
}

function isiForm(data){
  // Mengisi form kembali saat tombol EDIT ditekan
  document.getElementById("tanggal").value = data.tanggal ? String(data.tanggal).split("T")[0] : "";
  document.getElementById("kategori").value = data.kategori || "Dewasa";
  document.getElementById("namaPasien").value = data.nama || "";
  document.getElementById("mrPasien").value = data.mr || "";
  document.getElementById("diagnosaPasien").value = data.diagnosa || "";
  document.getElementById("tindakan").value = data.tindakan || "";
  document.getElementById("usia").value = data.usia || "";
  document.getElementById("tb").value = data.tb || "";
  document.getElementById("bb").value = data.bb || "";

  // =====================
  // HB & STRATEGI
  // =====================
  document.getElementById("priming").value = data.priming || "";
  document.getElementById("hbAwal").value = data.hbAwal || "";
  document.getElementById("jenisPriming").value = data.jenisPriming || "Clear Priming";
  document.getElementById("jumlahPRC").value = data.jumlahPRC || "";
  document.getElementById("jenisKardioplegia").value = data.jenisKardioplegia || "Clear Cardioplegia";

  hitungSemua();
}

function simpanData(){
  let data = ambilDataForm();

  if(data.nama == ""){
    alert("Nama pasien belum diisi");
    return;
  }

  if(editRow){
    data.row = editRow;
    data.mode = "update";
  } else {
    data.mode = "tambah";
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(res => {
    alert(editRow ? "Data berhasil diupdate" : "Data berhasil disimpan");
    editRow = null;
    document.querySelector(".pdf-button").innerText = "Simpan Data";
    renderTable();
  });
}

function formatTanggal(tanggal){
  if(!tanggal) return "-";
  let tgl = new Date(tanggal);
  if(isNaN(tgl.getTime())) return tanggal; // jika format teks murni bawaan sheets

  return tgl.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function renderTable(){
  fetch(SCRIPT_URL)
  .then(res => res.json())
  .then(database => {
    // Menghapus baris pertama (Header Google Sheets) agar tidak ikut looping sebagai data pasien
    if(database.length > 0 && database[0][2] === "kategori") {
      database.shift(); 
    }

    let keyword = document.getElementById("cariData").value.toLowerCase();
    let tbody = "";

    // Sorting berdasarkan tanggal terbaru (Kolom B / indeks 1)
    database.sort((a, b) => {
      let tanggalA = new Date(a[1] || 0);
      let tanggalB = new Date(b[1] || 0);
      return tanggalB - tanggalA;
    });

    database.forEach((row, index) => {
      // Memetakan array baris Google Sheets menjadi objek agar aman dibaca HTML
      let item = {
        row: index + 2, // Menyimpan informasi baris asli untuk keperluan UPDATE (Baris 1 header + offset)
        tanggalInput: row[0],
        tanggal: row[1],
        kategori: row[2],
        nama: row[3],
        mr: row[4],
        diagnosa: row[5],
        tindakan: row[6],
        usia: row[7],
        tb: row[8],
        bb: row[9],
        bsa: row[10],
        ebv: row[11],
        priming: row[12],
        hbAwal: row[13],
        hbPrediksi: row[14],
        jenisPriming: row[15],
        estimasiPriming: row[16],
        jenisKardioplegia: row[17]
      };

      let gabung = ((item.nama || "") + (item.mr || "") + (item.diagnosa || "") + (item.tindakan || "")).toLowerCase();
      if(!gabung.includes(keyword)){
        return;
      }

      let tampilanBB = item.bb || "-";
      if (tampilanBB !== "-" && !isNaN(tampilanBB)) {
        tampilanBB = `${tampilanBB} KG`;
      }

      let tampilanHbAwal = item.hbAwal || "-";
      if (tampilanHbAwal !== "-" && !isNaN(tampilanHbAwal)) {
        tampilanHbAwal = `${tampilanHbAwal} g/dL`;
      }

      let tampilanBSA = (item.bsa || "-").replace("BSA : ", "").replace("(Dubois Formula)", "").trim();

      tbody += `
        <tr>
          <td>${index + 1}</td>
          <td>${formatTanggal(item.tanggal)}</td>
          <td>${item.nama || "-"}</td>
          <td>${item.mr || "-"}</td>
          <td>${item.usia || "-"}</td>
          <td>${tampilanBB}</td>
          <td>${item.tb || "-"}</td>
          <td>${tampilanBSA}</td>
          <td>${(item.ebv || "-").replace("EBV : ","")}</td>
          <td>${item.priming || "-"}</td>
          <td>${tampilanHbAwal}</td>
          <td>${(item.hbPrediksi || "-").replace("Prediksi Hb : ","")}</td>
          <td>${item.jenisPriming || "-"}</td>
          <td>${item.jenisKardioplegia || "-"}</td>
          <td>
            <div class="action-group">
              <button class="action-btn btn-edit" onclick='editData(${JSON.stringify(item)})'>Edit</button>
            </div>
          </td>
        </tr>
      `;
    });

    document.getElementById("databaseBody").innerHTML = tbody;
  });
}

function editData(data){
  isiForm(data);
  editRow = data.row; // Menyimpan baris rowTarget murni Google Sheets
  document.querySelector(".pdf-button").innerText = "Update Data";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hapusData(index){
  let konfirmasi = confirm("Yakin ingin menghapus data ini?");
  if(!konfirmasi) return;
  
  // Jika Anda ingin mengimplementasikan hapus silakan hubungkan ke SCRIPT_URL mode hapus
  alert("Fungsi hapus data cloud harus disesuaikan dengan Apps Script.");
}

window.onload = function(){
  renderTable();
}

function ubahTema(){
  let kategori = document.getElementById("kategori").value;
  if(kategori == "Pediatrik"){
    document.body.classList.add("pediatrik-theme");
  } else {
    document.body.classList.remove("pediatrik-theme");
  }
}

// ... [Fungsi HitungSemua, hitungHbPrediksi, hitungPriming, hitungKardioplegia, heparinKeCc tetap sama seperti kode Anda] ...

// =========================
// USER MANAGEMENTS (AUTH)
// =========================

function registerUser(){
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if(username == "" || password == ""){
    alert("Username dan password wajib diisi");
    return;
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ mode: "register", username: username, password: password })
  })
  .then(res => res.text())
  .then(res => { alert("Register berhasil"); });
}

function lupaSandi(){
  let username = document.getElementById("username").value.trim();
  if(username == "") username = prompt("Masukkan username yang terdaftar:");
  if(!username) return;

  fetch(SCRIPT_URL + "?login=1")
  .then(res => res.json())
  .then(data => {
    // Jika data berupa matriks data spreadsheet murni, hilangkan header
    if(data.length > 0 && data[0][1] === "username") data.shift();

    let ditemukan = data.find(x => x[1] == username || x.username == username);

    if(!ditemukan){
      alert("Username tidak ditemukan");
      return;
    }

    let uName = ditemukan.username || ditemukan[1];
    let pWord = ditemukan.password || ditemukan[2];

    document.getElementById("username").value = uName;
    document.getElementById("password").value = pWord;

    alert("Password untuk username " + uName + " adalah: " + pWord);
  })
  .catch(() => {
    alert("Koneksi gagal atau database kosong");
  });
}

function loginUser(){
  let btn = document.getElementById("loginBtn");
  if (!btn) return;

  btn.classList.add("login-loading");
  btn.innerHTML = 'Sedang Login...';
  btn.disabled = true;

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  fetch(SCRIPT_URL + "?login=1")
  .then(res => res.json())
  .then(data => {
    if(data.length > 0 && data[0][1] === "username") data.shift();

    let ditemukan = data.find(x => (x.username == username && x.password == password) || (x[1] == username && x[2] == password));

    if(ditemukan){
      btn.innerHTML = '✓ Login Berhasil';
      localStorage.setItem("loginUser", username);

      setTimeout(() => {
        document.getElementById("loginCard").style.display = "none";
        document.getElementById("mainApp").style.display = "grid";
        document.getElementById("headerApp").style.display = "block";
        document.getElementById("databaseCard").style.display = "block";
        document.getElementById("logoutBtn").style.display = "block";
        renderTable();
      }, 600);
    } else {
      alert("Username atau password salah!");
      btn.classList.remove("login-loading");
      btn.innerHTML = "Login";
      btn.disabled = false;
    }
  })
  .catch(() => {
    alert("Koneksi gagal");
    btn.classList.remove("login-loading");
    btn.innerHTML = "Login";
    btn.disabled = false;
  });
}
