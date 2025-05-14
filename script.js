const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'id-ID';
recognition.interimResults = false;
recognition.continuous = false;

let laguData = [];
let laguAktif = null;
let poin = 0;

// Ambil data lirik
fetch('lirik.json')
  .then(response => response.json())
  .then(data => {
    laguData = data;
    acakLagu();
  });

// Acak lagu dan tampilkan lirik
function acakLagu() {
  const randomIndex = Math.floor(Math.random() * laguData.length);
  laguAktif = laguData[randomIndex];
  document.getElementById('lirik').textContent = `"${laguAktif.lirik}"`;
}

// Bacakan lirik dengan TTS
function bacaLirik() {
  if (!laguAktif) return;
  const utterance = new SpeechSynthesisUtterance(laguAktif.lirik);
  utterance.lang = 'id-ID';
  speechSynthesis.cancel(); // pastikan TTS tidak bertumpuk
  speechSynthesis.speak(utterance);
}

// Fungsi untuk mulai rekognisi suara
function mulaiRekognisi() {
  if (!laguAktif) return;

  // Stop TTS jika masih bicara
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    setTimeout(mulaiRekognisi, 300);
    return;
  }

  // Jalankan STT
  try {
    recognition.start();
    console.log('🎤 Memulai rekognisi...');
    document.getElementById('jawaban').textContent = '🎤 Mendengarkan...';
  } catch (err) {
    console.warn('❗ Gagal memulai rekognisi:', err);
  }
}

// Ketika hasil suara didapat
recognition.onresult = function (event) {
  const hasil = event.results[0][0].transcript.toLowerCase().trim();
  console.log("📥 Input pengguna:", hasil);
  document.getElementById('jawaban').textContent = `Jawaban: ${hasil}`;
  periksaJawaban(hasil);
};

// Ketika rekognisi selesai (apapun hasilnya)
recognition.onend = () => {
  console.log("🔚 Rekognisi selesai.");
};

function tampilkanPopup(pesan) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = pesan;
    popup.style.display = 'flex';
  
    // Klik untuk menutup
    document.getElementById('popup-close').onclick = () => {
      popup.style.display = 'none';
    };
  
    // Klik luar area popup untuk menutup
    window.onclick = function(event) {
      if (event.target === popup) {
        popup.style.display = 'none';
      }
    };
  }
  

// Periksa jawaban pengguna
function periksaJawaban(jawaban) {
  const kunci = laguAktif.judul.toLowerCase().trim();
  const penyanyi = laguAktif.penyanyi;
  const judul = laguAktif.judul;

  let pesan = '';
  let benar = false;

  if (jawaban.includes(kunci)) {
    pesan = `Anda benar! Jawabannya adalah ${penyanyi} dengan judul ${judul}`;
    benar = true;
    poin += 10; // Tambah poin
    document.getElementById('poin').textContent = poin;
  } else {
    pesan = `Anda kurang tepat. Jawabannya adalah ${penyanyi} dengan judul ${judul}`;
  }

  // Tampilkan di tabel
  document.getElementById('kunci-jawaban').textContent = `${penyanyi} - ${judul}`;

  // Tampilkan popup
  tampilkanPopup(benar ? "✅ Benar!" : "❌ Salah!");

  // Bacakan jawaban dengan TTS
  const respon = new SpeechSynthesisUtterance(pesan);
  respon.lang = 'id-ID';
  speechSynthesis.speak(respon);

  respon.onend = () => {
    setTimeout(() => {
      acakLagu(); // Lagu baru
    }, 1000);
  };
}


