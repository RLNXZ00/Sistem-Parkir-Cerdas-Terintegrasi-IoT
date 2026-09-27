## 8. UI Generation Directives (AI Prompts)
Bab ini berisi instruksi terstruktur (*prompts*) yang digunakan untuk menghasilkan *mockup* antarmuka (UI) menggunakan perangkat lunak *generative design* (seperti Stitch). Instruksi ini memadukan seluruh spesifikasi fitur menjadi sebuah komposisi visual yang konkret.

### 8.0 Prompt: Secure Authentication Screen
*Prompt ini digunakan untuk mendesain gerbang masuk utama sistem.*

**Text Prompt:**
> "Design a high-fidelity, professional Login Page for the 'Smart Parking & Green Earth System'. 
> 
> **Visual Style:** Deep dark theme (#121212 background) with a subtle blurred background image of a modern smart building. Use a centered Glassmorphism card for the login form. 
> 
> **Components:** 
> * A clean logo placeholder at the top of the card.
> * Minimalist input fields for 'Username' and 'Password' with Nature Green (#2E8B57) focus outlines.
> * A styled dropdown for 'Access Role' (Management / Field Staff).
> * A large 'Sign In' button in solid Nature Green with white bold text.
> * A 'Forgot Password?' link in Electric Blue (#00BFFF) at the bottom.
> 
> Ensure the design feels secure, high-tech, and follows the establish design system."

### 8.1 Prompt: Live Dashboard & Gate OCR (Master View)
*Prompt* ini digunakan untuk men-generate tampilan utama yang menggabungkan pemantauan *basement* dan *gateway* dalam satu layar padat ala *Command Center*.

**Text Prompt:**
> "Design a high-fidelity web dashboard for a 'Smart Parking & Green Earth System'. Adopt a clean, highly structured aesthetic reminiscent of professional modern IDEs like PyCharm, utilizing a deep dark background (#1E1E1E or similar) with crisp typography, subtle borders, and high-contrast semantic accent colors to highlight critical data without visual clutter.
> 
> **Dashboard Components:**
> * **Sidebar:** Minimalist navigation icons for 'Live Dashboard', 'Gate OCR Feed', 'Anomaly Logs', and 'Reports'.
> * **Header:** Breadcrumb navigation, Real-time clock server sync status (Green dot for 'IoT Connected'), and User Profile dropdown (Admin).
> * **Main Content (Grid Layout):**
>     * **Center/Left:** A large 2D Grid Map of the parking basement. Slots are styled cleanly. Empty slots are dark gray outlines, legally occupied slots are solid 'Eco Green', reserved slots are 'Warning Yellow', and anomalous slots are glowing/pulsing 'Alert Red'.
>     * **Top Right (Analytics):** Clean metric cards showing 'Today's Revenue' and an 'Environmental Impact' circular progress bar for 'CO2 Prevented'.
>     * **Bottom Right (Live OCR & Gateway):** A multi-pane card showing four small camera feed frames (Entry-Car, Entry-Motor, Exit-Car, Exit-Motor). Each frame has a dynamic text overlay for the detected license plate and a status badge for payment confirmation.
> 
> **Interaction & Style:** Use a flat, sophisticated Glassmorphism style for modal popups. Focus on data density, scannability, and a developer-friendly layout."

### 8.2 Prompt: Role-Based View (Field Officer)
*Prompt* ini digunakan untuk menghasilkan variasi halaman *dashboard* bagi Petugas Lapangan. Sesuai dengan batasan hak akses (RBAC), data finansial dihilangkan agar petugas dapat berfokus penuh pada operasional fisik dan penanganan anomali.

**Text Prompt:**
> "Generate a second version of this dashboard specifically for the 'Field Officer' role. Follow the exact same visual style, dark theme, and grid layout from the previous prompt, but make the following functional changes:
> * Remove the 'Today's Revenue' and 'Financial Impact' cards entirely.
> * Maximize the 'Anomaly Map' to take up more screen space.
> * Expand the 'Alert Logs' section to prominently display real-time sensor errors or illegal parking alerts, complete with a prominent 'Acknowledge/Resolve' action button next to each log."

### 8.3 Prompt: Responsive View (Visitor Fallback)
*Prompt* ini digunakan untuk merancang antarmuka versi seluler (*mobile-first*) yang ditujukan bagi pengendara/pengunjung rumah sakit. Fitur ini sangat berguna jika pengunjung lupa posisi slot parkir mereka.

**Text Prompt:**
> "Design a mobile-first UI screen for a hospital visitor using the 'Smart Parking System'. Maintain the clean, modern aesthetic with the dark background (#1E1E1E), but optimize the layout for a smartphone screen.
> 
> **Key Elements:**
> * A simple, large, and user-friendly input field labeled 'Enter License Plate Number'.
> * A prominent, highly clickable 'Find My Car' button in 'Eco Green'.
> * Upon searching, the screen should display a zoomed-in, minimalist 2D map showing their reserved slot highlighted in glowing green, along with simple text directions (e.g., 'Your car is at Floor B1, Slot 42'). Keep the interface extremely simple and distraction-free."

---

## Tambahan Instruksi: Iterasi Visualisasi Lanjutan

Bagian ini berisi instruksi iteratif (bertahap) untuk diberikan kepada AI UI Generator (seperti Stitch) guna melengkapi halaman-halaman lain dengan tetap menjaga konsistensi arsitektur visual (IDE-like, Dark Mode) dari desain utama yang sudah terbentuk.

### Sesi 0: Revisi Tampilan Field Officer (Dark Mode Fix)
Instruksi ini digunakan untuk mengoreksi kesalahan AI (Stitch) jika sebelumnya ia menghasilkan tampilan *Field Officer* dalam mode terang (*light mode*), agar kembali selaras dengan desain utama yang menggunakan *dark mode*.

**Prompt untuk Stitch:**
> "Before we continue to new pages, I need you to fix the 'Field Officer' dashboard. You previously generated it using a light theme, which violates our design system. 
> 
> Please redraw the Field Officer dashboard using the exact same deep dark background (#1E1E1E), typography, and IDE-like aesthetic as the main 'Live Dashboard & Command Center' (image_0.png). 
> 
> Keep the functional layout for the Field Officer (No revenue cards, maximized Anomaly Map, and expanded Alert Logs), but strictly enforce the dark mode palette."

### Sesi 1: Visualisasi PG-002: Gate OCR Feed (Live Monitor)
Gunakan prompt ini untuk memaksa Stitch mengubah area konten utama menjadi pusat kendali video.

**Prompt untuk Stitch:**
> "Now, generate the UI for the 'Gate OCR Feed' (PG-002) menu. Maintain the exact same Sidebar, Header (with IoT connected status), deep dark background theme (#1E1E1E), and IDE-like structure from our established dashboard.
> 
> **Content Area Changes:**
> * Replace the map and top metrics with a focused center pane.
> * The center pane is a multi-camera quad-view monitor. Four small camera frames labeled: 'Entry-Mobil (A)', 'Entry-Motor (B)', 'Exit-Mobil', 'Exit-Motor'.
> * Each frame has a vibrant text overlay of the detected license plate (monospace Fira Code) and a semantic badge (e.g., 'E-Toll LUNAS' in Green, 'SALDO KURANG' in Red).
> * Keep the large 'Activity Stream' list at the bottom, showing the 5 most recent transactions with timestamps. Ensure the active sidebar icon is 'Gate Monitor'."

### Sesi 2: Visualisasi PG-003: Anomaly Logs (Operational Control)
Gunakan prompt ini untuk mendesain halaman penanganan anomali.

**Prompt untuk Stitch:**
> "Now, generate the UI for the 'Anomaly Logs' (PG-003) menu. Focus on a clean, dense data table interface within the established deep dark IDE theme (#1E1E1E). Set the active sidebar icon to 'Logs'.
> 
> **Content Area Specs:**
> * Top: A large header 'Anomaly Logs & Action Center'.
> * The main area is a technical data table. Columns are: Timestamp (mono), Slot ID, Anomaly Type (with color-coded tags: 'Salah Parkir' in glowing Red, 'Obstruksi' in Orange), Status ('Active', 'In-Progress').
> * Add an 'Action Center' column on the far right of the table. Include two stylized buttons in every row: 'Acknowledge' (Nature Green outline) and 'Dismiss False Alarm' (Alert Red outline). Include a modal popup prototype that appears when 'Acknowledge' is clicked."

### Sesi 3: Visualisasi PG-004: Operational Reports (Admin Panel)
Gunakan prompt ini untuk melengkapi halaman laporan yang sudah ada.

**Prompt untuk Stitch:**
> "Now, generate the UI for the 'Reports' menu (PG-004). Maintain the established deep dark background theme (#1E1E1E), cleanIDE visual style, Sidebar, and Header structure.
> 
> **Content Area Specs:**
> * Active Sidebar icon is 'Reports'.
> * Add a functional 'Report Generator Form' bar at the top. Include a date range picker (calender icon) and a 'Report Type' dropdown (containing 'Financial', 'Operational', 'Eco-Metrics'). Place a large, prominent 'Generate Report' button on the far right in solid Nature Green.
> * Below the form, display a clean, massive 'Data Preview Table' showing a preview of historical transaction records.
> * Include two prominent 'Export Documents' buttons on the top right of the table area: 'Unduh PDF' (PDF icon) and 'Export XLSX' (Excel icon)."

### Sesi 4: Visualisasi PG-005 (Visitor Terminal Display)
Kiosk terminal gerbang memiliki alur transisi. Oleh karena itu, *prompt* ini dibagi menjadi dua bagian untuk menggambarkan layar sebelum dan saat navigasi berjalan. Pastikan untuk men-generate ini satu per satu.

#### Sesi 4A: Layar Alokasi Slot (State 3)
*Prompt* ini untuk menampilkan momen pertama kali pengendara mendapatkan slot parkir dan ID tiketnya secara seketika.

**Prompt untuk Stitch:**
> "Design the first state of the 'Visitor Terminal Display' (PG-005). This is a vertical Kiosk UI (Portrait mode, meant for a physical parking gate monitor). 
> 
> **STRICT VISUAL RULE:** You MUST use the established deep dark background theme (#1E1E1E). No light themes.
> 
> **Layout & Elements:**
> * Center the content vertically and horizontally. Keep it distraction-free.
> * Top text: 'MENDAPATKAN SLOT...' in small, muted gray text.
> * Center piece: A massive, glowing text displaying 'SLOT PARKIR ANDA: B1-10' in solid Nature Green (#2E8B57).
> * Directly below that: 'ID Parkir: 021' in monospace font, colored Electric Blue (#00BFFF).
> * Bottom: A subtle loading animation or text saying 'Menyiapkan rute navigasi...'"

#### Sesi 4B: Layar Transisi Navigasi Peta (State 4)
Gunakan *prompt* ini HANYA setelah Sesi 4A berhasil dibuat. *Prompt* ini untuk menggambarkan layar sedetik setelah layar Sesi 4A, di mana teks menghilang dan digantikan oleh peta.

**Prompt untuk Stitch:**
> "Now, design the second state of the 'Visitor Terminal Display' (PG-005), immediately following the previous screen. Maintain the exact same vertical Kiosk UI format and deep dark background theme (#1E1E1E). 
> 
> **Content Area Changes (Navigation Mode):**
> * The giant text from the previous screen shrinks and moves to the top header as a smaller status bar: 'Tujuan Anda: Slot B1-10 | ID: 021'.
> * The entire main screen is now a 2D Dynamic Navigation Map (Dark Mode GMaps style). 
> * The map shows a minimalist top-down view of the parking layout.
> * Crucial element: Draw a bright, glowing Nature Green (#2E8B57) routing line starting from the 'Entrance Gate' point, weaving through the driveway, and ending at the highlighted slot 'B1-10'.
> * Add a prominent status badge at the bottom: 'PALANG DIBUKA - SILAKAN MASUK'."