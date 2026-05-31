# Laporan Implementasi Pertemuan 11: Penggunaan useEffect & Dynamic Route
## Sistem Informasi Manajemen Data Tenaga Kerja (SIMANDAT DISNAKER)

Laporan ini mendokumentasikan perubahan dan penambahan kode yang dilakukan pada aplikasi SIMANDAT DISNAKER dalam rangka memenuhi tugas **Pertemuan 11** mengenai implementasi React Hooks `useEffect` (data fetching dan debounce search) serta *Dynamic Routing* (`useParams`).

Implementasi ini diselaraskan dengan kebutuhan fungsional dalam dokumen **SKPL DISNAKER**, khususnya pengelolaan data Pelatihan Kerja (**F03**) dan pemantauan status alumni pasca-pelatihan (**F09 - Tracer Study**).

---

## 📂 Berkas yang Ditambahkan / Diubah

Penerapan ini melibatkan berkas-berkas berikut di dalam proyek:

```text
├── public/
│   └── data/
│       └── pelatihan-data.json       🆕 BARU (Database simulasi program pelatihan)
├── src/
│   ├── App.jsx                       🔄 DIPERBARUI (Pendaftaran rute dinamis /pelatihan/:id)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx           🔄 DIPERBARUI (Pembersihan item non-DISNAKER)
│   │   └── pages/
│   │       ├── PelatihanPage.jsx     🔄 DIPERBARUI (useEffect, Debounce Search, Tabel Kelas)
│   │       └── PelatihanDetailPage.jsx 🆕 BARU (useParams, detail LPK & tabel Tracer Study)
```

---

## 💡 Konsep React & Rincian Implementasi Kode

### 1️⃣ Pemanggilan API / Data Menggunakan `useEffect`
Dalam modul diajarkan bahwa melakukan pemanggilan API langsung di badan komponen akan memicu *infinite loop* (re-render terus-menerus) jika di dalamnya terdapat pembaruan state. 
Di aplikasi SIMANDAT, pemanggilan data daftar pelatihan dibungkus di dalam `useEffect` agar hanya dijalankan sekali ketika halaman pertama kali dimuat atau ketika query pencarian berubah.

**Lokasi berkas**: `src/components/pages/PelatihanPage.jsx`
```jsx
useEffect(() => {
  setLoading(true);
  setError(null);

  // Mengambil data dari server simulasi menggunakan Axios
  axios
    .get("/data/pelatihan-data.json")
    .then((response) => {
      // Menyimpan data ke state
      setPelatihan(response.data);
    })
    .catch((err) => {
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
}, []); // Menggunakan array kosong agar hanya berjalan sekali saat mount
```

---

### 2️⃣ Optimasi Pencarian dengan Debounce Search (500ms)
Untuk mencegah aplikasi memanggil API pada setiap ketikan tombol keyboard (yang dapat membebani server), kita menerapkan mekanisme **debounce** menggunakan kombinasi `setTimeout` dan **cleanup function** (`clearTimeout`) di dalam `useEffect` yang mengamati perubahan state `query`.

**Lokasi berkas**: `src/components/pages/PelatihanPage.jsx`
```jsx
const [query, setQuery] = useState("");

useEffect(() => {
  setLoading(true);
  
  // Menunda eksekusi Axios selama 500ms setelah user selesai mengetik
  const timeout = setTimeout(() => {
    axios
      .get("/data/pelatihan-data.json")
      .then((response) => {
        const rawData = response.data || [];
        // Memfilter data berdasarkan input user
        const filtered = rawData.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.lpk.toLowerCase().includes(query.toLowerCase())
        );
        setPelatihan(filtered);
      });
  }, 500);

  // Cleanup: Membersihkan timeout sebelumnya jika user mengetik lagi sebelum 500ms
  return () => clearTimeout(timeout);
}, [query]); // useEffect dipicu kembali setiap kali state `query` berubah
```

---

### 3️⃣ Rute Dinamis (Dynamic Route) dengan `:id` & Lazy Loading
Kita mendaftarkan alamat URL dinamis `/pelatihan/:id` yang dapat menerima ID kelas secara fleksibel (contoh: `/pelatihan/1`, `/pelatihan/2`). Komponen halaman detail di-load menggunakan `React.lazy` untuk performa *code-splitting* yang optimal.

**Lokasi berkas**: `src/App.jsx`
```jsx
// 1. Lazy loading komponen halaman detail
const PelatihanDetailPage = lazy(() => import('./components/pages/PelatihanDetailPage'));

// 2. Judul TopBar dinamis untuk detail pelatihan
if (location.pathname.startsWith('/pelatihan/')) {
  pageTitle = 'Detail Pelatihan';
}

// 3. Pendaftaran rute dengan parameter :id di dalam router
<Route path="/pelatihan/:id" element={<PelatihanDetailPage />} />
```

---

### 4️⃣ Membaca Parameter URL Menggunakan `useParams()`
Saat halaman detail diakses, kita perlu mengetahui ID pelatihan mana yang dibuka agar dapat memuat data yang sesuai dari server/berkas JSON. Parameter `:id` dibaca menggunakan hook `useParams()`.

**Lokasi berkas**: `src/components/pages/PelatihanDetailPage.jsx`
```jsx
import { useParams } from "react-router-dom";

export default function PelatihanDetailPage() {
  const { id } = useParams(); // Menangkap ID dari URL dinamis (misal: "1")
  const [program, setProgram] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/data/pelatihan-data.json")
      .then((response) => {
        // Mencari objek pelatihan yang memiliki ID sesuai dengan parameter URL
        const selected = response.data.find((item) => item.id === parseInt(id));
        setProgram(selected);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]); // Pemuatan ulang dipicu jika parameter ID berubah
```

---

### 5️⃣ Menghubungkan Daftar ke Halaman Detail dengan `<Link>`
Setiap baris data nama pelatihan di halaman tabel diubah menjadi tautan aktif menggunakan `<Link>` dari `react-router-dom` agar dapat mengarahkan user ke halaman detail yang bersangkutan secara dinamis.

**Lokasi berkas**: `src/components/pages/PelatihanPage.jsx`
```jsx
import { Link } from "react-router-dom";

// Di dalam perulangan map tabel
<Link 
  to={`/pelatihan/${item.id}`} 
  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
>
  {item.title}
</Link>
```

---

## 🎯 Keselarasan dengan Kebutuhan SKPL DISNAKER

Implementasi ini tidak hanya memenuhi kriteria tugas praktikum tetapi juga secara fungsional memperkaya aplikasi utama:
* **F03 (Mengelola Data Pelatihan)**: Admin/Staf kini dapat melihat tabel visual yang berisi nama pelatihan, kejuruan, penyelenggara LPK, durasi JP, kapasitas kuota, dan status pelatihan. Pencarian program pelatihan terintegrasi langsung dengan API data.
* **F09 (Tracer Study)**: Pada halaman **Detail Pelatihan** (`/pelatihan/:id`), sistem menampilkan data profil lengkap program pelatihan beserta **Tabel Daftar Peserta** yang menampilkan status kebekerjaan alumni (Bekerja, Wirausaha, atau Belum Bekerja) hasil penelusuran tracer study.

---

## 💻 Cara Menjalankan & Menguji Halaman
1. Pastikan server dev berjalan dengan mengetik `npm run dev` pada terminal.
2. Masuk ke halaman aplikasi di browser (default: `http://localhost:5173`).
3. Login menggunakan akun demo (`demo@example.com` / `password123`).
4. Klik menu **Pelatihan** pada sidebar sebelah kiri.
5. Coba ketikkan kata kunci pencarian seperti **"Las"** atau **"Komputer"** pada kolom input pencarian dan perhatikan jeda *loading* 500ms sebagai efek dari *debounce* yang meminimalkan beban request server.
6. Klik salah satu nama program pelatihan di tabel, dan Anda akan diarahkan ke halaman detail (seperti `/pelatihan/1`) yang menampilkan informasi lengkap dan daftar peserta.
