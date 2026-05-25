let editIndex = -1;
let editRow = null;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxLbMqJ7YlPUZuUrITm8eTSmMvU3g0zWkRv9iQ9lpXK3ZZIJBLGNeRptqlDnMayH1C/exec";

function ambilDataForm(){

  hitungSemua();

  return {

    // =====================
    // DATA PASIEN
    // =====================

    tanggal:
      document.getElementById("tanggal").value,

    kategori:
      document.getElementById("kategori").value,

    nama:
      document.getElementById("namaPasien").value,

    mr:
      document.getElementById("mrPasien").value,

    diagnosa:
      document.getElementById("diagnosaPasien").value,

    tindakan:
      document.getElementById("tindakan").value,

    usia:
      document.getElementById("usia").value,

    tb:
      document.getElementById("tb").value,

    bb:
      document.getElementById("bb").value,

    bsa:
      document.getElementById("hasilBSA").innerText,

    ebv:
      document.getElementById("hasilEBV").innerText,

    faktorEbv:
      document.getElementById("hasilFaktor").innerText,

    // =====================
    // FLOW
    // =====================

    flowTable:
      document.getElementById("flowTableBody").innerHTML,

    flowReduction:
      document.getElementById("flowReductionTable").innerHTML,

    // =====================
    // KANUL
    // =====================

    kanulAorta:
      document.getElementById("kanulAorta").innerText,

    kanulVena:
      document.getElementById("kanulVena").innerText,

    kanulLeftVent:
      document.getElementById("kanulLeftVent").innerText,

    kanulAntegrade:
      document.getElementById("kanulAntegrade").innerText,

    kanulRetrograde:
      document.getElementById("kanulRetrograde").innerText,

    // =====================
    // OKSIGENATOR
    // =====================

    oksigenator:
      document.getElementById("oksigenator").innerText,

    customPack:
      document.getElementById("customPack").innerText,

    tubingSize:
      document.getElementById("tubingSize").innerText,

    estimasiPriming:
      document.getElementById("estimasiPriming").innerText,

    // =====================
    // HB
    // =====================

    ebvAuto:
      document.getElementById("ebvAuto").value,

    priming:
      document.getElementById("priming").value,

    hbAwal:
      document.getElementById("hbAwal").value,

    hbPrediksi:
      document.getElementById("hasilHbPrediksi")
      .innerText
      .replace("Prediksi Hb : ",""),

    // =====================
    // STRATEGI PRIMING
    // =====================

    jenisPriming:
      document.getElementById("jenisPriming").value,

    jumlahPRC:
      document.getElementById("jumlahPRC").value,

    primingTable:
      document.getElementById("primingTable").innerHTML,

    // =====================
    // OBAT
    // =====================

    tranex:
      document.getElementById("tranex").innerText,

    methyl:
      document.getElementById("methyl").innerText,

    // =====================
    // KARDIOPLEGIA
    // =====================

    jenisKardioplegia:
      document.getElementById("jenisKardioplegia").value,

    dosisInduksi:
      document.getElementById("dosisInduksiKardioplegia").innerText,

    dosisMaintenance:
      document.getElementById("dosisMaintenanceKardioplegia").innerText,

    flowCPG:
      document.getElementById("flowCPG").innerText

  };

}

function isiForm(data){

  // =====================
  // DATA PASIEN
  // =====================

  document.getElementById("tanggal").value =
      data.tanggal
        ? String(data.tanggal).split("T")[0]
        : "";

  document.getElementById("kategori").value =
    data.kategori || "Dewasa";

  document.getElementById("namaPasien").value =
    data.nama || "";

  document.getElementById("mrPasien").value =
    data.mr || "";

  document.getElementById("diagnosaPasien").value =
    data.diagnosa || "";

  document.getElementById("tindakan").value =
    data.tindakan || "";

  document.getElementById("usia").value =
  data.usia || "";

  document.getElementById("tb").value =
    data.tb || "";

  document.getElementById("bb").value =
    data.bb || "";

  // =====================
  // HB
  // =====================

  document.getElementById("priming").value =
    data.priming || "";

  document.getElementById("hbAwal").value =
    data.hbAwal || "";

  // =====================
  // STRATEGI PRIMING
  // =====================

  document.getElementById("jenisPriming").value =
    data.jenisPriming || "Clear Priming";

  document.getElementById("jumlahPRC").value =
    data.jumlahPRC || "";

  // =====================
  // KARDIOPLEGIA
  // =====================

  document.getElementById("jenisKardioplegia").value =
    data.jenisKardioplegia || "Clear Cardioplegia";

  // =====================
  // HITUNG ULANG
  // =====================

  hitungSemua();

}

function simpanData(){

  let data = ambilDataForm();

  if(data.nama == ""){
    alert("Nama pasien belum diisi");
    return;
  }

  // MODE UPDATE
  if(editRow){

    data.row = editRow;
    data.mode = "update";

  }
  else{

    data.mode = "tambah";

  }

fetch(SCRIPT_URL,{

  method:"POST",

  body:JSON.stringify(data)

})

.then(res=>res.text())

.then(res=>{

  alert(
    editRow
    ? "Data berhasil diupdate"
    : "Data berhasil disimpan"
  );

  // reset mode edit
  editRow = null;

  document.querySelector(".pdf-button").innerText =
    "Simpan Data";

  renderTable();

});

}

function doGet(){

  const sheet =
    SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Sheet1");

  const data =
    sheet.getDataRange().getValues();

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}

function formatTanggal(tanggal){

  if(!tanggal) return "-";

  let tgl = new Date(tanggal);

  return tgl.toLocaleDateString("id-ID",{
    day:"2-digit",
    month:"2-digit",
    year:"numeric"
  });

}

function renderTable(){
  fetch(SCRIPT_URL)
  .then(res => res.json())
  .then(database => {
    
    console.log("Data dari Sheets:", database); // Untuk memantau data di inspect console

    // PENGAMAN 1: Jika database kosong atau hanya berisi baris header saja
    if (!database || database.length <= 1) {
      document.getElementById("databaseBody").innerHTML = `<tr><td colspan="15" style="text-align:center;">Belum ada data pasien di database.</td></tr>`;
      return;
    }

    // PENGAMAN 2: Potong baris pertama (Header) secara paksa demi keamanan data
    database.shift(); 

    let keyword = document.getElementById("cariData").value.toLowerCase();
    let tbody = "";

    // Sorting berdasarkan tanggal terbaru (Kolom B / indeks 1)
    database.sort((a, b) => {
      let tanggalA = new Date(a[1] || 0);
      let tanggalB = new Date(b[1] || 0);
      return tanggalB - tanggalA;
    });

   database.forEach((row, index) => {
      
      // ===================================================================
      // SILAKAN SESUAIKAN ANGKA INDEKS DI BAWAH INI DENGAN KOLOM GOOGLE SHEETS
      // (Kolom A = 0, Kolom B = 1, Kolom C = 2, Kolom D = 3, dst...)
      // ===================================================================
      let item = {
        row: index + 2,             // Biarkan ini untuk mendeteksi baris update
        tanggalInput: row[0],       // Kolom A (Waktu input sistem)
        tanggal: row[1],            // Kolom B (Tanggal dari form)
        kategori: row[2],           // Kolom C
        nama: row[3],               // Kolom D
        mr: row[4],                 // Kolom E
        diagnosa: row[5],           // Kolom F
        tindakan: row[6],           // Kolom G
        usia: row[7],               // Kolom H
        tb: row[8],                 // Kolom I
        bb: row[9],                 // Kolom J
        bsa: row[10],               // Kolom K
        ebv: row[11],               // Kolom L
        priming: row[12],           // Kolom M
        hbAwal: row[13],            // Kolom N
        hbPrediksi: row[14],        // Kolom O
        jenisPriming: row[15],      // Kolom P
        estimasiPriming: row[16],   // Kolom Q
        jenisKardioplegia: row[17]  // Kolom R
      };

      // Filter Pencarian Pasien
      let gabung = ((item.nama || "") + (item.mr || "") + (item.diagnosa || "") + (item.tindakan || "")).toLowerCase();
      if(!gabung.includes(keyword)){
        return;
      }

      // Format Tampilan Berat Badan
      let tampilanBB = item.bb || "-";
      if (tampilanBB !== "-" && !isNaN(tampilanBB)) {
        tampilanBB = `${tampilanBB} KG`;
      }

      // Format Tampilan Hb Awal
      let tampilanHbAwal = item.hbAwal || "-";
      if (tampilanHbAwal !== "-" && !isNaN(tampilanHbAwal)) {
        tampilanHbAwal = `${tampilanHbAwal} g/dL`;
      }

      // Format Tampilan BSA Bersih
      let tampilanBSA = (item.bsa || "-").toString().replace("BSA : ", "").replace("(Dubois Formula)", "").trim();

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
          <td>${(item.ebv || "-").toString().replace("EBV : ","")}</td>
          <td>${item.priming || "-"}</td>
          <td>${tampilanHbAwal}</td>
          <td>${(item.hbPrediksi || "-").toString().replace("Prediksi Hb : ","")}</td>
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
  })
  .catch(error => {
    console.error("Gagal memuat database:", error);
    document.getElementById("databaseBody").innerHTML = `<tr><td colspan="15" style="text-align:center; color:red;">Gagal memuat data dari server. Cek Inspect Console.</td></tr>`;
  });
}

function editData(data){

  isiForm(data);

  editRow = data.row;

  document.querySelector(".pdf-button").innerText =
    "Update Data";

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}

function hapusData(index){

  let konfirmasi = confirm("Yakin ingin menghapus data ini?");

  if(!konfirmasi){
    return;
  }

  let database =
    JSON.parse(localStorage.getItem("databasePerfusionist")) || [];

  database.splice(index,1);

  renderTable();

  alert("Data berhasil dihapus");

}

window.onload = function(){

  renderTable();

}

function ubahTema(){
  let kategori = document.getElementById("kategori").value;

  if(kategori == "Pediatrik"){
    document.body.classList.add("pediatrik-theme");
  }
  else{
    document.body.classList.remove("pediatrik-theme");
  }
}

function hitungSemua(){
  let tb = parseFloat(document.getElementById("tb").value);
  let bb = parseFloat(document.getElementById("bb").value);
  let kategori = document.getElementById("kategori").value;
    ubahTema();


  if(isNaN(tb) || isNaN(bb)){
    return;
  }

  // rumus BSA dubois
  let bsa = 0.007184 * Math.pow(tb, 0.725) * Math.pow(bb, 0.425);

  document.getElementById("hasilBSA").innerHTML = `
  BSA : ${bsa.toFixed(2)} m²
    <small style="
    color:rgba(79, 72, 72, 0.5);
    font-style:italic;
    letter-spacing:0.5px;
  ">
    (Dubois Formula)
  </small>
`;

  let faktorEBV = 0;

  if(bb < 10){
    faktorEBV = 80;
  }
  else if(bb < 21){
    faktorEBV = 75;
  }
  else if(bb < 31){
    faktorEBV = 70;
  }
  else if(bb < 41){
    faktorEBV = 65;
  }
  else{
    faktorEBV = 60;
  }

  let ebv = bb * faktorEBV;

  document.getElementById("hasilEBV").innerHTML =
    "EBV : " + ebv.toFixed(0) + " mL";

  document.getElementById("hasilFaktor").innerHTML =
    "Faktor EBV : " + faktorEBV + " mL/kg";

  document.getElementById("ebvAuto").value =
    ebv.toFixed(0);

  let flowIndex = [];

  if(kategori == "Pediatrik"){
    flowIndex = [3.2,3.0,2.8,2.4,2.2,2.0,1.8,1.5];
  }
  else{
    flowIndex = [3.0,2.8,2.4,2.2,2.0,1.8,1.5];
  }

  let tableBody = "";

 flowIndex.forEach(function(index){

  let flow = bsa * index;

  // =========================
  // HIGHLIGHT FLOW PENTING
  // =========================

  let highlightClass = "";

  if(kategori == "Pediatrik"){

    if(
      index == 3.2 ||
      index == 2.2 ||
      index == 1.5
    ){
      highlightClass = "flow-highlight";
    }

  }
  else{

    if(
      index == 3.0 ||
      index == 2.0 ||
      index == 1.5
    ){
      highlightClass = "flow-highlight";
    }

  }

  tableBody += `
    <tr class="${highlightClass}">
      <td>${index}</td>
      <td>${flow.toFixed(2)} L/min</td>
    </tr>
  `;

});



  document.getElementById("flowTableBody").innerHTML =
    tableBody;

// ======================
// TARGET MAP
// ======================

let mapBB = "-";
let mapUsia = "-";


// ======================
// TARGET MAP BERDASARKAN BB
// ======================

if(bb < 10){
  mapBB = "40 - 50 mmHg";
}
else if(bb <= 20){
  mapBB = "45 - 50 mmHg";
}
else if(bb <= 40){
  mapBB = "50 - 60 mmHg";
}
else{
  mapBB = "60 - 70 mmHg";
}


// ======================
// TARGET MAP BERDASARKAN USIA
// ======================

let usiaText =
  document.getElementById("usia")
  .value
  .toLowerCase();

if(
  usiaText.includes("bulan") ||
  usiaText.includes("month")
){

  let angkaUsia = parseFloat(usiaText);

  if(angkaUsia < 1){
    mapUsia = "30 - 45 mmHg";
  }
  else{
    mapUsia = "40 - 50 mmHg";
  }

}
else if(
  usiaText.includes("tahun") ||
  usiaText.includes("year")
){

  let angkaUsia = parseFloat(usiaText);

  if(angkaUsia <= 10){
    mapUsia = "45 - 60 mmHg";
  }
  else if(angkaUsia <= 16){
    mapUsia = "50 - 70 mmHg";
  }
  else{
    mapUsia = "60 - 90 mmHg";
  }

}


// ======================
// TAMPILAN TARGET MAP
// ======================

document.getElementById("flowReductionTable").innerHTML =
`
<tr>
  <td colspan="2"
      style="
      background:#eff6ff;
      font-weight:700;
      color:#1d4ed8;
      text-align:center;
      ">
      TARGET MAP
  </td>
</tr>

<tr>
  <td><b>Sesuai Berat Badan</b></td>
  <td>${mapBB}</td>
</tr>

<tr>
  <td><b>Sesuai Usia</b></td>
  <td>${mapUsia}</td>
</tr>
`;

  document.getElementById("kanulAorta").innerHTML =
    bb < 5 ? "10 Fr (Flow < 500 ml/min)" :
    bb <= 9 ? "12 Fr (Flow 500 - 800 ml/min)" :
    bb <= 15 ? "14 Fr (Flow 800 - 1150 ml/min)" :
    bb <= 31 ? "18 Fr (Flow 1700 - 2500 ml/min)" :
    bb <= 41 ? "22 Fr (Flow 2500 - 3300 ml/min)" :
    "24 Fr (Flow > 3300 ml/min)";
// ======================
// AORTA FEMORAL
// ======================

let aortaFemoral = "-";

if(bb < 5){

  aortaFemoral = "8 Fr (Flow 0 - 400 ml/min)";

}
else if(bb <= 9){

  aortaFemoral = "10 Fr (Flow 400 - 700 ml/min)";

}
else if(bb <= 15){

  aortaFemoral = "12 (Flow 700 - 1200 ml/min)"+ "<br>" + 
                  "14 Fr (Flow 1200 - 1700 ml/min)";

}
// else if(bb <= 21){

//   aortaFemoral = "12 (Flow 700 - 1200 ml/min)"+ "<br>" + 
//                   "14 Fr (Flow 1200 - 1700 ml/min)";

// }
else if(bb <= 31){

  aortaFemoral = "14 Fr (Flow 1200 - 1700 ml/min)"+ "<br>" + 
                  "15 Fr (Flow 1700 - 2000 ml/min)"+ "<br>" + 
                  "17 Fr (Flow 2000 - 2500 ml/min)";

}
else if(bb <= 41){

  aortaFemoral = "17 Fr (Flow 2000 - 2500 ml/min)"+ "<br>" +
                  "19 Fr (Flow 2500 - 3500 ml/min)";

}
else{

  aortaFemoral = "19 Fr (Flow 2500 - 3500 ml/min)" + "<br>" +
                  "21 Fr (> 3500 ml/min)"
  
}

document.getElementById("kanulAortaFemoral").innerHTML =
  aortaFemoral;

  document.getElementById("kanulVena").innerHTML =
    bb < 5 ? "12/16 Fr (Flow < 650 ml/min)" :
    bb < 12 ? "14/18 Fr (Flow 650 - 1000 ml/min)" :
    bb < 21 ? "16/20 Fr (Flow 1000 - 1400 ml/min)" :
    bb < 26 ? "18/22 Fr" :
    bb < 31 ? "20/24 Fr (Flow 2000 - 2250 ml/min)" :
    bb < 41 ? "24/28 Fr (Flow 3000 - 3200 ml/min)" :
    "28/31 Fr (Flow > 3200 ml/min)";

    // ======================
// Vena FEMORAL
// ======================

let venaFemoral = "-";
 document.getElementById("kanulVenaFemoral").innerHTML =
    bb < 5 ? "20 Fr (Flow < 450 ml/min)" :
    bb < 12 ? "22 Fr (Flow 550 - 900 ml/min)"+ "<br>"+
              " 24 Fr (Flow 700 - 900 ml/min) " :
    bb < 21 ? "26 Fr (Flow 900 - 1100 ml/min)"+ "<br>"+
              "28 Fr (Flow 1100 - 1300 ml/min)"+ "<br>"+
              "30 Fr (Flow 1300 - 1500 ml/min)" :
    bb < 26 ? "32 Fr (Flow 1500 - 2000 ml/min)"+ "<br>"+
              "34 Fr (Flow 2000 - 2700 ml/min)" :
    bb < 31 ? "34 Fr (Flow 2000 - 2700 ml/min)"+ "<br>"+
              "36 Fr (Flow 2700 - 3500 ml/min)" :
    bb < 41 ? "36 Fr (Flow 2700 - 3500 ml/min)" :
              "38 Fr (Flow > 3500 ml/min)";



  document.getElementById("kanulAntegrade").innerHTML =
    bb < 30 ? "Abocath 14 GA" : "ATC 12 GA";

  document.getElementById("kanulRetrograde").innerHTML =
    bb < 15 ? "RC 10 Fr" :
    bb <= 35 ? "RC 13 Fr" :
    "RC 14 Fr";

  document.getElementById("kanulLeftVent").innerHTML =
    bb < 15 ? "Left Vent Neonate 13 Fr" :
    bb <= 35 ? "16 Fr" :
    "20 Fr";

  let oksigenator = "";
  let customPack = "";
  let tubingSize = "";
  let estimasiPriming = "";

  let mitral = "-";
  let tricuspid = "-";
  let aortic = "-";
  let pulmonary = "-";
  let halfSize = "-";

  let flowMaksimal = "";

if(bb >= 2 && bb < 10){
    oksigenator = "Baby Rx/Fx / Pixie Neo (BB < 15 kg)";
    customPack = "Neonate";
    tubingSize = "Arteri 1/4, Vena 1/4, Pump Boot 1/4";
    estimasiPriming = "400 - 500 ml";

    flowMaksimal =
      "Baby RX/FX : 1.5 L/min\n" +
      "Pixie Neo : 2.0 L/min";
}
else if(bb < 21){
    oksigenator = "Pixie Infant / Capiox Fx 15 RW 30 / Thrilly Euroset";
    customPack = "Infant";
    tubingSize = "Arteri 1/4, Vena 3/8, Pump Boot 3/8";
    estimasiPriming = "600 - 800 ml";

    flowMaksimal =
      "Pixie Infant : 3.0 L/min\n" +
      "Capiox FX15 RW30 : 3.0 L/min\n" +
      "Thrilly Euroset : 3.5 L/min";
}
else if(bb < 41){
    oksigenator = "Capiox Fx 15 RW 30 / Thrilly Euroset (BB < 35 kg)";
    customPack = "Pediatric";
    tubingSize = "Arteri 3/8, Vena 3/8, Pump Boot 3/8";
    estimasiPriming = "800 - 1000 ml";

    flowMaksimal =
      "Capiox FX15 RW30 : 3.0 L/min\n" +
      "Thrilly Euroset : 3.5 L/min";
}
else{
    oksigenator = "Capiox Fx 15 RW 40 / Capiox Fx 25 / Fusion / Inspire 6F / Horizon / Affinity NT";
    customPack = "Adult";
    tubingSize = "Arteri 3/8, Vena 1/2, Pump Boot 1/2";
    estimasiPriming = "1 - 1.5 L";

    flowMaksimal =
      "Capiox FX15 RW40 : 4.0 L/min\n" +
      "Capiox FX25 : 7.0 L/min\n" +
      "Fusion : 7.0 L/min\n" +
      "Inspire 6F : 7.0 L/min\n" +
      "Horizon : 7.0 L/min\n" +
      "Affinity NT : 7.0 L/min";
}

  document.getElementById("oksigenator").innerHTML = oksigenator;
document.getElementById("customPack").innerHTML = customPack;
document.getElementById("tubingSize").innerHTML = tubingSize;
document.getElementById("estimasiPriming").innerHTML = estimasiPriming;

document.getElementById("flowMaksimal").innerHTML =
  flowMaksimal.replace(/\n/g,"<br>");

// =========================
// MEAN NORMAL VALVE RING
// =========================

if(bsa <= 0.25){

  mitral = "11.2 mm";
  tricuspid = "13.4 mm";
  aortic = "7.2 mm";
  pulmonary = "8.4 mm";

}
else if(bsa <= 0.30){

  mitral = "12.6 mm";
  tricuspid = "14.9 mm";
  aortic = "8.1 mm";
  pulmonary = "9.3 mm";

}
else if(bsa <= 0.35){

  mitral = "13.6 mm";
  tricuspid = "16.2 mm";
  aortic = "8.9 mm";
  pulmonary = "10.1 mm";

}
else if(bsa <= 0.40){

  mitral = "14.4 mm";
  tricuspid = "17.3 mm";
  aortic = "9.5 mm";
  pulmonary = "10.7 mm";

}
else if(bsa <= 0.45){

  mitral = "15.2 mm";
  tricuspid = "18.2 mm";
  aortic = "10.1 mm";
  pulmonary = "11.3 mm";

}
else if(bsa <= 0.50){

  mitral = "15.8 mm";
  tricuspid = "19.2 mm";
  aortic = "10.7 mm";
  pulmonary = "11.9 mm";

}
else if(bsa <= 0.60){

  mitral = "16.9 mm";
  tricuspid = "20.7 mm";
  aortic = "11.5 mm";
  pulmonary = "12.8 mm";

}
else if(bsa <= 0.70){

  mitral = "17.9 mm";
  tricuspid = "21.9 mm";
  aortic = "12.3 mm";
  pulmonary = "13.5 mm";

}
else if(bsa <= 0.80){

  mitral = "18.8 mm";
  tricuspid = "23.0 mm";
  aortic = "13.0 mm";
  pulmonary = "14.2 mm";

}
else if(bsa <= 0.90){

  mitral = "19.7 mm";
  tricuspid = "24.0 mm";
  aortic = "13.4 mm";
  pulmonary = "14.8 mm";

}
else if(bsa <= 1.0){

  mitral = "20.2 mm";
  tricuspid = "24.9 mm";
  aortic = "14.0 mm";
  pulmonary = "15.3 mm";

}
else if(bsa <= 1.2){

  mitral = "21.4 mm";
  tricuspid = "26.2 mm";
  aortic = "14.8 mm";
  pulmonary = "16.2 mm";

}
else if(bsa <= 1.4){

  mitral = "22.3 mm";
  tricuspid = "27.7 mm";
  aortic = "15.5 mm";
  pulmonary = "17.0 mm";

}
else if(bsa <= 1.6){

  mitral = "23.1 mm";
  tricuspid = "28.9 mm";
  aortic = "16.1 mm";
  pulmonary = "17.6 mm";

}
else if(bsa <= 1.8){

  mitral = "23.8 mm";
  tricuspid = "29.1 mm";
  aortic = "16.5 mm";
  pulmonary = "18.2 mm";

}
else{

  mitral = "24.2 mm";
  tricuspid = "30.0 mm";
  aortic = "17.2 mm";
  pulmonary = "18.0 mm";

}

// =========================
// HALF SIZE PULMONARY
// =========================

if(bb <= 3){

  halfSize = "4";

}
else if(bb <= 4){

  halfSize = "5";

}
else if(bb <= 5){

  halfSize = "5.5";

}
else if(bb <= 6){

  halfSize = "6";

}
else if(bb <= 8){

  halfSize = "6.5";

}
else if(bb <= 9){

  halfSize = "7";

}
else if(bb <= 10){

  halfSize = "7.5";

}
else if(bb <= 12){

  halfSize = "8.5";

}
else if(bb <= 14){

  halfSize = "9";

}
else if(bb <= 16){

  halfSize = "9.5";

}
else if(bb <= 18){

  halfSize = "10";

}
else if(bb <= 20){

  halfSize = "11";

}
else if(bb <= 25){

  halfSize = "12";

}
else if(bb <= 30){

  halfSize = "13";

}
else{

  halfSize = "14";

}

document.getElementById("mitral").innerHTML = mitral;
document.getElementById("tricuspid").innerHTML = tricuspid;
document.getElementById("aortic").innerHTML = aortic;
document.getElementById("pulmonary").innerHTML = pulmonary;
document.getElementById("halfSize").innerHTML = halfSize;


let tranex = 50 * bb;
  let methylLow = 20 * bb;
  let methylHigh = 30 * bb;

// Konsentrasi obat
// Asam tranexamat contoh umum: 500 mg / 5 mL = 100 mg/mL
let konsentrasiTranex = 100;

// Methylprednisolon contoh: 125 mg / 2 mL = 62.5 mg/mL
// Sesuaikan dengan sediaan di tempat kamu
let konsentrasiMethyl = 62.5;

let tranexCc = tranex / konsentrasiTranex;
let methylLowCc = methylLow / konsentrasiMethyl;
let methylHighCc = methylHigh / konsentrasiMethyl;

document.getElementById("tranex").innerHTML =
  tranex.toFixed(0) + " mg / " +
  tranexCc.toFixed(1) + " cc";

document.getElementById("methyl").innerHTML =
  methylLow.toFixed(0) + " - " +
  methylHigh.toFixed(0) + " mg / " +
  methylLowCc.toFixed(1) + " - " +
  methylHighCc.toFixed(1) + " cc";

  hitungPriming();
  hitungHbPrediksi();
  hitungKardioplegia();

}

function hitungHbPrediksi(){

  let ebv = parseFloat(
    document.getElementById("ebvAuto").value
  );

  let priming = parseFloat(
    document.getElementById("priming").value
  );

  let hbAwal = parseFloat(
    document.getElementById("hbAwal").value
  );

  let bb = parseFloat(
    document.getElementById("bb").value
  );

  let kategori =
    document.getElementById("kategori").value;

  if(
    isNaN(ebv) ||
    isNaN(priming) ||
    isNaN(hbAwal) ||
    isNaN(bb)
  ){
    return;
  }

  // =========================
  // HITUNG HB PREDIKSI
  // =========================

  let hbPrediksi =
    (ebv * hbAwal) / (ebv + priming);

  document.getElementById("hasilHbPrediksi").innerHTML =
    "Prediksi Hb : " +
    hbPrediksi.toFixed(1) +
    " g/dL";

  // =========================
  // TARGET BERDASARKAN KATEGORI
  // =========================

  let targetLow = 0;
  let targetHigh = 0;

  if(kategori == "Dewasa"){

    targetLow = 8;
    targetHigh = 9;

  }
  else{

    targetLow = 9;
    targetHigh = 10;

  }

  document.getElementById("targetHbInfo").innerHTML =
    "Target Hb : " +
    targetLow + " - " +
    targetHigh + " g/dL";

  // =========================
  // REKOMENDASI
  // =========================

  let rekomendasi = "-";

  // =========================
  // HB RENDAH
  // =========================

  if(hbPrediksi < targetLow){

    let kebutuhanLow =
      (targetLow - hbPrediksi) *
      5 *
      bb;

    let kebutuhanHigh =
      (targetHigh - hbPrediksi) *
      5 *
      bb;

    rekomendasi =
      "Penambahan PRC : " +
      kebutuhanLow.toFixed(0) +
      " - " +
      kebutuhanHigh.toFixed(0) +
      " mL";

  }

  // =========================
  // HB TINGGI
  // =========================

  else if(hbPrediksi > targetHigh){

    let penguranganLow =
      (hbPrediksi - targetHigh) *
      5 *
      bb;

    let penguranganHigh =
      (hbPrediksi - targetLow) *
      5 *
      bb;

    rekomendasi =
      "Hemodilusi / Phlebotomi : " +
      penguranganLow.toFixed(0) +
      " - " +
      penguranganHigh.toFixed(0) +
      " mL";

  }

  // =========================
  // DALAM TARGET
  // =========================

  else{

    rekomendasi =
      "Hb dalam target ideal";

  }

  document.getElementById("rekomendasiHb").innerHTML =
    "Rekomendasi : " + rekomendasi;

}

function hitungPriming(){
  let bb = parseFloat(document.getElementById("bb").value);
  let jenisPriming = document.getElementById("jenisPriming").value;
  let prc = parseFloat(document.getElementById("jumlahPRC").value);

  if(isNaN(bb)){
    return;
  }

  let manitol = (2.5 * bb).toFixed(0);
  let primingTable = "";

  if(jenisPriming == "Clear Priming"){
  document.getElementById("prcInputGroup").style.display = "none";

  if(bb < 10){
    primingTable = `
      <tr><td><b>Jenis</b></td><td>Clear Priming &lt;10 kg</td></tr>
      <tr><td><b>Kristaloid</b></td><td>Ringer Asetat / RL / RF</td></tr>
      <tr><td><b>Koloid</b></td><td>Gelofusin / Albumin</td></tr>
      <tr><td><b>Bicnat</b></td><td>5 - 10 meq</td></tr>
      <tr><td><b>Manitol</b></td><td>${manitol} ml</td></tr>
      <tr><td><b>Heparin</b></td><td>3500 - 4000 IU / ${heparinKeCc(3500)} - ${heparinKeCc(4000)} cc</td></tr>
    `;
  }

  else if(bb <= 20){
    primingTable = `
      <tr><td><b>Jenis</b></td><td>Clear Priming 10 - 20 kg</td></tr>
      <tr><td><b>Kristaloid</b></td><td>Ringer Asetat / RL / RF</td></tr>
      <tr><td><b>Koloid</b></td><td>Gelofusin / Albumin</td></tr>
      <tr><td><b>Bicnat</b></td><td>20 meq</td></tr>
      <tr><td><b>Manitol</b></td><td>${manitol} ml</td></tr>
      <tr><td><b>Heparin</b></td><td>4000 - 5000 IU / ${heparinKeCc(4000)} - ${heparinKeCc(5000)} cc</td></tr>
    `;
  }

  else{
    primingTable = `
      <tr><td><b>Jenis</b></td><td>Clear Priming &gt;20 kg</td></tr>
      <tr><td><b>Kristaloid</b></td><td>Ringer Asetat / RL / RF</td></tr>
      <tr><td><b>Koloid</b></td><td>Gelofusin / Albumin</td></tr>
      <tr><td><b>Bicnat</b></td><td>30 meq</td></tr>
      <tr><td><b>Manitol</b></td><td>${manitol} ml</td></tr>
      <tr><td><b>Heparin</b></td><td>5000 - 10000 IU / ${heparinKeCc(5000)} - ${heparinKeCc(10000)} cc</td></tr>
    `;
  }
}
  else{
    document.getElementById("prcInputGroup").style.display = "block";

    if(bb < 10){
      primingTable = `
        <tr><td><b>Jenis</b></td><td>Blood Priming &lt;10 kg</td></tr>
        <tr><td><b>Kristaloid</b></td><td>Ringer Asetat / RL / RF</td></tr>
        <tr><td><b>Koloid</b></td><td>Albumin 20% 50-100 ml</td></tr>
        <tr><td><b>Bicnat</b></td><td>5-10 meq</td></tr>
        <tr><td><b>Heparin</b></td><td>3500 - 4000 IU / ${heparinKeCc(3500)} - ${heparinKeCc(4000)} cc</td></tr>
        <tr><td><b>Manitol</b></td><td>${manitol} ml</td></tr>
        <tr><td><b>PRC</b></td><td>${isNaN(prc) ? 0 : prc} ml</td></tr>
        <tr><td><b>Kalsium</b></td><td>${isNaN(prc) ? 0 : prc} mg</td></tr>
      `;
    }
    else if(bb <= 20){
      primingTable = `
        <tr><td><b>Jenis</b></td><td>Blood Priming 10-20 kg</td></tr>
        <tr><td><b>Kristaloid</b></td><td>Ringer Asetat / RL / RF</td></tr>
        <tr><td><b>Koloid</b></td><td>Albumin 20% 100 ml</td></tr>
        <tr><td><b>Bicnat</b></td><td>20 meq</td></tr>
        <tr><td><b>Heparin</b></td><td>4000 - 5000 IU / ${heparinKeCc(4000)} - ${heparinKeCc(5000)} cc</td></tr>
        <tr><td><b>Manitol</b></td><td>${manitol} ml</td></tr>
        <tr><td><b>PRC</b></td><td>${isNaN(prc) ? 0 : prc} ml</td></tr>
        <tr><td><b>Kalsium</b></td><td>${isNaN(prc) ? 0 : prc} mg</td></tr>
      `;
    }
    else{
      primingTable = `
        <tr><td><b>Jenis</b></td><td>Blood Priming &gt;20 kg</td></tr>
        <tr><td><b>Kristaloid</b></td><td>Ringer Asetat / RL / RF</td></tr>
        <tr><td><b>Koloid</b></td><td>Gelofusin / Albumin 20 - 25% 100 ml</td></tr>
        <tr><td><b>Bicnat</b></td><td>30 meq</td></tr>
        <tr><td><b>Manitol</b></td><td>${manitol} ml</td></tr>
        <tr><td><b>Heparin</b></td><td>5000 - 10000 IU / ${heparinKeCc(5000)} - ${heparinKeCc(10000)} cc</td></tr>
        <tr><td><b>PRC</b></td><td>${isNaN(prc) ? 0 : prc} ml</td></tr>
        <tr><td><b>Kalsium</b></td><td>${isNaN(prc) ? 0 : prc} mg</td></tr>
      `;
    }
  }

  document.getElementById("primingTable").innerHTML = primingTable;
  }
  function hitungKardioplegia(){
  let tb = parseFloat(document.getElementById("tb").value);
  let bb = parseFloat(document.getElementById("bb").value);
  let kategori = document.getElementById("kategori").value;
  let jenisKardioplegia = document.getElementById("jenisKardioplegia").value;

  if(isNaN(tb) || isNaN(bb)){
    return;
  }

  let dosisInduksi = "-";
  let dosisMaintenance = "-";

  if(jenisKardioplegia == "Clear Cardioplegia"){
    dosisInduksi =
      (20 * bb).toFixed(0) + " - " +
      (30 * bb).toFixed(0) + " mL";

    dosisMaintenance =
      (10 * bb).toFixed(0) + " - " +
      (20 * bb).toFixed(0) + " mL";
  }

  else if(jenisKardioplegia == "Blood Cardioplegia"){
    dosisInduksi =
      (20 * bb).toFixed(0) + " - " +
      (30 * bb).toFixed(0) + " mL";

    dosisMaintenance =
      (10 * bb).toFixed(0) + " - " +
      (20 * bb).toFixed(0) + " mL";
  }

 else if(jenisKardioplegia == "HTK-Custadiol"){

  // Dosis induksi
  let induksiLow = 30 * bb;
  let induksiHigh = 50 * bb;

  // Maintenance = 30 - 50% dari dosis induksi
  let maintenanceLow = induksiLow * 0.30;
  let maintenanceHigh = induksiHigh * 0.50;

  dosisInduksi =
    induksiLow.toFixed(0) + " - " +
    induksiHigh.toFixed(0) + " mL";

  dosisMaintenance =
    maintenanceLow.toFixed(0) + " - " +
    maintenanceHigh.toFixed(0) + " mL";
}

  else if(jenisKardioplegia == "Del Nido"){
    dosisInduksi =
      (20 * bb).toFixed(0) + " - " +
      (30 * bb).toFixed(0) + " mL";

    dosisMaintenance =
      (10 * bb).toFixed(0) + " - " +
      (20 * bb).toFixed(0) + " mL";
  }

  document.getElementById("dosisInduksiKardioplegia").innerHTML =
    dosisInduksi;

  document.getElementById("dosisMaintenanceKardioplegia").innerHTML =
    dosisMaintenance;

  let flowCPG = "-";

if(kategori == "Dewasa"){
  flowCPG = "250 - 350 cc/menit";
}
else{
  let bsa = 0.007184 * Math.pow(tb, 0.725) * Math.pow(bb, 0.425);
  let flowIndex32 = bsa * 3.2;

  let flowLow = flowIndex32 * 5 / 100;
  let flowHigh = flowIndex32 * 8 / 100;

  flowCPG =
    flowLow.toFixed(2) + " - " +
    flowHigh.toFixed(2) + " L/menit";
}

document.getElementById("flowCPG").innerHTML =
  flowCPG;

}
// Konsentrasi Priming
// Heparin 1 cc = 5000 IU

function heparinKeCc(iu){
  return (iu / 5000).toFixed(1);
}
// =========================
// AUTO LOGIN
// =========================

window.addEventListener("load", function(){

  let user =
    localStorage.getItem("loginUser");

  if(user){

    document.getElementById("loginCard")
    .classList.remove("show-login");

// sembunyikan login
    document.getElementById("loginCard").style.display =
    "none";

    // tampilkan aplikasi
    document.getElementById("mainApp").style.display =
      "grid";

    // tampilkan header
    document.getElementById("headerApp").style.display =
      "block";

    // tampilkan database
    document.getElementById("databaseCard").style.display =
      "block";

    // tampilkan tombol logout
    document.getElementById("logoutBtn").style.display =
      "block";

    // load data database
    renderTable();

  }

});

// =========================
// REGISTER
// =========================

function registerUser(){

  let username =
    document.getElementById("username").value;

  let password =
    document.getElementById("password").value;

  if(username == "" || password == ""){
    alert("Username dan password wajib diisi");
    return;
  }

fetch(
SCRIPT_URL,
{
  method:"POST",

  body:JSON.stringify({
    mode:"register",
    username:username,
    password:password
  })
})

.then(res=>res.text())

.then(res=>{

  alert("Register berhasil");

});

}

// =========================
// LUPA SANDI
// =========================

function lupaSandi(){

  let username =
    document.getElementById("username").value.trim();

  if(username == ""){
    username = prompt("Masukkan username yang terdaftar:");
  }

  if(!username){
    return;
  }

  fetch(SCRIPT_URL + "?login=1")

  .then(res=>res.json())

  .then(data=>{

    let ditemukan = data.find(
      x => x.username == username
    );

    if(!ditemukan){
      alert("Username tidak ditemukan");
      return;
    }

    document.getElementById("username").value =
      ditemukan.username;

    document.getElementById("password").value =
      ditemukan.password;

    alert(
      "Password untuk username " +
      ditemukan.username +
      " adalah: " +
      ditemukan.password
    );

  })

  .catch(()=>{

  btn.classList.remove("login-loading");

  btn.innerHTML = "Login";

  btn.disabled = false;

  alert("Koneksi gagal");

});

}

// =========================
// LOGIN
// =========================
function loginUser(){

  let btn = document.getElementById("loginBtn");

  if (!btn) return; // Pengaman jika element tombol tidak ditemukan di HTML

  btn.classList.add("login-loading");
  btn.innerHTML = '<span class="loading-spinner"></span> Sedang Login...';
  btn.disabled = true;

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  // Lakukan fetch data login ke APPS SCRIPT
  fetch(SCRIPT_URL + "?login=1")
  .then(res => res.json())
  .then(data => {

    let ditemukan = data.find(x => x.username == username && x.password == password);

    if(ditemukan){
      // JIKA LOGIN BERHASIL, eksekusi kode ini di dalam sini
      btn.innerHTML = '✓ Login Berhasil';
      localStorage.setItem("loginUser", username);

      setTimeout(()=>{
        document.getElementById("loginCard").style.display = "none";
        document.getElementById("mainApp").style.display = "grid";
        document.getElementById("headerApp").style.display = "block";
        document.getElementById("databaseCard").style.display = "block";
        document.getElementById("logoutBtn").style.display = "block";
        
        renderTable(); // Muat data tabel setelah login
      }, 600);

    } else {
      alert("Username atau password salah!");
      btn.classList.remove("login-loading");
      btn.innerHTML = "Login";
      btn.disabled = false;
    }
  })
  .catch(()=>{
    alert("Koneksi gagal");
    btn.classList.remove("login-loading");
    btn.innerHTML = "Login";
    btn.disabled = false;
  });
}

// =========================
// LOGOUT
// =========================

function logoutUser(){

  let logoutBtn =
    document.getElementById("logoutBtn");

  // loading tombol logout
  logoutBtn.innerHTML =
    '<span class="loading-spinner"></span> Logout...';

  logoutBtn.disabled = true;

  // animasi fade aplikasi
  document.getElementById("mainApp").style.opacity =
    "0";

  document.getElementById("headerApp").style.opacity =
    "0";

  document.getElementById("databaseCard").style.opacity =
    "0";

  setTimeout(()=>{

    // hapus session login
    localStorage.removeItem("loginUser");

    // sembunyikan app
    document.getElementById("mainApp").style.display =
      "none";

    document.getElementById("headerApp").style.display =
      "none";

    document.getElementById("databaseCard").style.display =
      "none";

    // tampilkan login
document.getElementById("loginCard")
.classList.add("show-login");

let loginCard =
  document.getElementById("loginCard");

// RESET ANIMASI LOGIN
loginCard.style.transform =
  "scale(1) translateY(0px)";

loginCard.style.opacity =
  "1";

loginCard.style.transition =
  "all 0.5s ease";
    // =========================
    // RESET TOMBOL LOGIN
    // =========================

    let loginBtn =
      document.getElementById("loginBtn");

    loginBtn.classList.remove("login-loading");

    loginBtn.innerHTML = "Login";

    loginBtn.disabled = false;
    // reset opacity
    document.getElementById("mainApp").style.opacity =
      "1";

    document.getElementById("headerApp").style.opacity =
      "1";

    document.getElementById("databaseCard").style.opacity =
      "1";

    // reset tombol logout
    logoutBtn.innerHTML = "Logout";

    logoutBtn.disabled = false;

    // animasi login muncul
    document.getElementById("loginCard").style.opacity =
      "0";

    setTimeout(()=>{

      document.getElementById("loginCard").style.transition =
        "0.4s";

      document.getElementById("loginCard").style.opacity =
        "1";

    },50);

  },500);

}
