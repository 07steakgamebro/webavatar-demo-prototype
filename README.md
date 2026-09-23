# Botnoi WebAvatar Demo Portal & Interactive Sandbox---

> **Web Application ต้นแบบและศูนย์รวม Interactive Sandbox สำหรับทดสอบการเชื่อมต่อระบบ 3D Conversational AI (Botnoi WebAvatar)** เข้ากับเว็บแอปพลิเคชันจริง พร้อมจำลอง Use Cases ธุรกิจหลากหลายรูปแบบ

[![React](https://img.shields.io/badge/React-19.x-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Languages](https://img.shields.io/badge/Languages-7_Supported-green.svg)](#-ระบบหลายภาษา-multilingual-support-7-ภาษา)

---

## สารบัญ (Table of Contents)

1. [ภาพรวมโปรเจกต์ (Overview)](#-ภาพรวมโปรเจกต์-overview)
2. [ฟีเจอร์เด่น (Key Features)](#-ฟีเจอร์เด่น-key-features)
3. [รายการหน้า Demo ทั้งหมด (Demo Catalog)](#-รายการหน้า-demo-ทั้งหมด-demo-catalog)
4. [เทคโนโลยีที่ใช้ (Tech Stack)](#-เทคโนโลยีที่ใช้-tech-stack)
5. [การติดตั้งและรันโปรเจกต์ (Getting Started)](#-การติดตั้งและรันโปรเจกต์-getting-started)
6. [การเชื่อมต่อ Botnoi WebAvatar SDK (Integration Guide)](#-การเชื่อมต่อ-botnoi-webavatar-sdk-integration-guide)
7. [ระบบหลายภาษา (Multilingual Support 7 ภาษา)](#-ระบบหลายภาษา-multilingual-support-7-ภาษา)
8. [โครงสร้างไดเรกทอรี (Directory Structure)](#-โครงสร้างไดเรกทอรี-directory-structure)
9. [NPM Scripts](#-npm-scripts)

---

##  ภาพรวมโปรเจกต์ (Overview)

โปรเจกต์ **Botnoi WebAvatar Demo Portal** พัฒนาขึ้นเพื่อเป็น Sandbox และ Showcase มาตรฐานระดับ Enterprise ที่สาธิตศักยภาพของ **Botnoi WebAvatar** ในการโต้ตอบด้วยเสียง (Voice-to-Voice) ร่วมกับการควบคุมและนำทางหน้าเว็บแบบ Single Page Application (SPA) ได้แบบ Real-time 

ผู้ใช้สามารถคุยด้วยเสียงกับ 3D AI Avatar เพื่อสั่งการค้นหาเที่ยวบิน, สั่งอาหาร, เลือกซื้อสินค้าไอที, เปลี่ยนหน้าเว็บ, หรือสอบถามข้อมูลทั่วไปได้ทันที

```
┌─────────────────────────────────────────────────────────────┐
│                      User Voice Input                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ (WebSockets / WebRTC)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Botnoi WebAvatar Engine (3D VRM)               │
│      • Real-time Speech-to-Speech (STT → LLM → TTS)         │
│      • Lip-sync & Contextual Gesture Animations             │
│      • DOM Action & Page Navigation Dispatcher              │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Custom Event: webavatar-navigate)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              React SPA (Botnoi Demo Showcase)               │
│   • Flight Booking (One-Way, Round-Trip, Multi-City)        │
│   • Food Ordering & Online Cart                             │
│   • IT Store E-Commerce Catalog                             │
│   • Admin Dashboards (Flight, Food, IT Store)               │
└─────────────────────────────────────────────────────────────┘
```

---

## ฟีเจอร์เด่น (Key Features)

-  **Voice-to-Voice Real-time Interaction**: สนทนาเสียงโต้ตอบแบบธรรมชาติกับ 3D VRM Avatar พร้อมระบบจำลองการขยับปาก (Lip-sync) และท่าทางตามบริบท
-  **Intelligent SPA Web Navigation**: Avatar สามารถสั่งเปลี่ยนหน้า (Route) หรือเลื่อนไปยังตำแหน่งที่ต้องการผ่าน Event `webavatar-navigate`
-  **Flight Booking System (Botnoi Air)**:
  - ค้นหาเที่ยวบินทั้งแบบเที่ยวเดียว (One-Way), ไป-กลับ (Round-Trip) และหลายเมือง (Multi-City)
  - ผังเลือกที่นั่งบนเครื่องบินเสมือนจริง (Interactive 3D-Style Seat Map Modal)
  - คำนวณราคา, โปรโมชั่นโค้ดส่วนลด และออกบัตรที่นั่ง (Boarding Pass Ticket Modal)
  - หน้า **Flight Admin Dashboard** สำหรับล็อกที่นั่ง, ตรวจสอบรายชื่อผู้โดยสาร และจัดการเที่ยวบิน
-  **Food Ordering System (Botnoi Restaurant)**:
  - เมนูอาหารพร้อมตัวกรองหมวดหมู่, ปรับแต่งจำนวน, ระบบตะกร้าสินค้าแบบ Real-time และสรุปใบเสร็จ
  - หน้า **Restaurant Admin Dashboard** สำหรับจัดการสต็อกและรายการอาหาร
-  **IT Store E-Commerce (Botnoi IT Store)**:
  - แคตตาล็อกสินค้าอุปกรณ์ไอทีและแกดเจ็ต ค้นหาตามสเปก แบรนด์ และช่วงราคา
  - หน้า **IT Store Admin Dashboard** สำหรับจัดการคลังสินค้า
-  **Full 7-Language Localization**: รองรับภาษาไทย (TH), อังกฤษ (EN), จีน (ZH), ญี่ปุ่น (JA), เกาหลี (KO), สเปน (ES), ฝรั่งเศส (FR) ทั้งหน้าเว็บและข้อความทักทายของ Avatar
-  **Adaptive Design & Modern UX**:
  - สลับโหมด Dark / Light ได้อย่างสมบูรณ์แบบ
  - Responsive 100% ใช้งานลื่นไหลบนมือถือ แท็บเล็ต และคอมพิวเตอร์
  - เอฟเฟกต์ Transition นุ่มนวลด้วย Framer Motion (Page Curtain Wipe Transition)

---

##  รายการหน้า Demo ทั้งหมด (Demo Catalog)

| Route | หน้าเว็บ | ฟังก์ชันและความสามารถหลัก |
| :--- | :--- | :--- |
| `/` | **Home** | ภาพรวมระบบ, Hero Section, Interactive Bento Grid, System Telemetry, ปุ่มเชื่อมต่อ Avatar |
| `/flight-demo` | **Flight Booking** | ระบบค้นหาตั๋วเครื่องบิน, ผังที่นั่ง, โปรโมชั่น, ตั๋ว Boarding Pass |
| `/flight-demo/admin` | **Flight Admin** | แดชบอร์ดจัดการเที่ยวบิน, รายชื่อผู้โดยสาร, ล็อก/ปลดล็อกที่นั่ง |
| `/food-demo` | **Food Ordering** | สั่งอาหารออนไลน์, ตะกร้าสินค้า, ใบเสร็จชำระเงิน |
| `/food-demo/admin` | **Food Admin** | จัดการเมนูอาหาร, รายการสั่งซื้อ, สรุปยอดขาย |
| `/it-store-demo` | **IT Store** | แคตตาล็อกอุปกรณ์ไอที, ตัวกรองราคา/หมวดหมู่, สั่งซื้อสินค้า |
| `/it-store-demo/admin` | **IT Store Admin** | แดชบอร์ดจัดการสต็อกสินค้าไอที |
| `/all-demo` | **All Demos Showcase** | ศูนย์รวม 20+ Sandbox และผลงานต้นแบบของแต่ละทีม (TN01–TN20) พร้อมตัวกรองหมวดหมู่ |
| `/ai-sales` | **AI Sales Representative** | หน้าจำลองตัวแทนขายและที่ปรึกษาผลิตภัณฑ์ AI |
| `/nia-site-2026` / `/event` | **Techsauce / Event Showcase** | หน้านำเสนอโครงการนวัตกรรมและเทคโนโลยี NIA 2026 |
| `/about` | **About Us** | ข้อมูลบริษัท, ประวัติความเป็นมา, วิสัยทัศน์ และทีมงาน |
| `/contact` | **Contact & FAQ** | แบบฟอร์มติดต่อสอบถาม, ระบบตรวจทานข้อมูล และคำถามที่พบบ่อย |

---

##  เทคโนโลยีที่ใช้ (Tech Stack)

### Core Technologies
- **Frontend Framework**: [React 19](https://react.dev/)
- **Programming Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)

### Styling & UI Components
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Primitives**: [Radix UI Dialog](https://www.radix-ui.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### AI & 3D Interactive Engine
- **Conversational AI**: [Botnoi WebAvatar JSSDK](https://webavatar.didthat.cc/) (3D VRM rendering, Lip-sync, WebSockets)

---

##  การติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- **Node.js**: เวอร์ชัน `>= 18.0.0` ขึ้นไป
- **Package Manager**: npm, pnpm หรือ yarn

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. รันโปรเจกต์ในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

### 4. Build สำหรับ Production
```bash
npm run build
```
ไฟล์ Production Bundle จะถูกสร้างไว้ในโฟลเดอร์ `dist/`

### 5. ทดสอบรัน Production Preview
```bash
npm run preview
```

---

## 🔌 การเชื่อมต่อ Botnoi WebAvatar SDK (Integration Guide)

### 1. ติดตั้ง SDK และกำหนดค่าเริ่มต้น (`index.html`)

นำโค้ดด้านล่างไปใส่ในแท็ก `<head>` หรือส่วนท้ายของ `<body>` ในไฟล์ `index.html`:

```html
<script>
  window.ChatWidgetConfig = {
    mode: "realtime-widget",         // "realtime-widget" หรือ "realtime-fullscreen"
    widgetId: "Botnoi",
    avatarUrl: "Botnoi",
    greetingInstruction: "Greet the user in Thai with a friendly and polite tone.",
    enableBubble: "false",
    cameraOffset: "0,0,0.5",
    animationUrl: "Greeting",
    defaultAnimationUrl: "Idleloop, idle_breatheloop, Idle_Swayloop",
    randomGeneric: "false",
  };
</script>
<script id="webavatar-jssdk" src="https://webavatar.didthat.cc/chat-widget.js" async></script>
```

### 2. การดักจับ Event สั่งเปลี่ยนหน้าเว็บอัตโนมัติ (`SpaNavListener.tsx`)

เมื่อ Avatar แนะนำให้ผู้ใช้ไปยังหน้าอื่น ระบบจะส่ง Custom Event `webavatar-navigate` เพื่อให้ React Router เปลี่ยนหน้าโดยไม่ต้อง Reload:

```tsx
// src/components/SpaNavListener.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpaNavListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ target: string }>;
      const target = customEvent.detail?.target;
      if (!target) return;

      try {
        const url = new URL(target, window.location.origin);
        navigate(url.pathname + url.search + url.hash);
      } catch {
        navigate(target);
      }
    };

    document.addEventListener('webavatar-navigate', handleNav);
    return () => document.removeEventListener('webavatar-navigate', handleNav);
  }, [navigate]);

  return null;
}
```

### 3. การเรียกเปิดสายสนทนาด้วยโค้ด JavaScript (`webavatarService.ts`)

สามารถเรียกเปิดการสนทนาของ Avatar ผ่านปุ่มบนหน้าเว็บได้โดยตรง:

```typescript
// src/lib/webavatarService.ts
export function triggerWebAvatarCall(): boolean {
  try {
    const wa = (window as any).WebAvatar;
    if (wa && typeof wa.startCall === 'function') {
      wa.startCall();
      return true;
    }
    // Fallback: จำลองการคลิกที่ปุ่ม widget ของ Avatar
    const callButton = document.querySelector<HTMLElement>('#webavatar-call-btn, .webavatar-trigger-btn');
    if (callButton) {
      callButton.click();
      return true;
    }
  } catch (error) {
    console.warn('[WebAvatar] Call trigger error:', error);
  }
  return false;
}
```

---

## ระบบหลายภาษา (Multilingual Support 7 ภาษา)

โปรเจกต์รองรับการสลับภาษาได้แบบ Real-time ทั้งหมด **7 ภาษา**:

| รหัสภาษา | ภาษา | Native Name | Greeting Instruction to Avatar |
| :---: | :--- | :--- | :--- |
| `th` | ภาษาไทย | ไทย | `Greet the user politely in Thai.` |
| `en` | English | English | `Greet the user politely in English.` |
| `zh` | Chinese | 中文 | `Greet the user politely in Mandarin Chinese.` |
| `ja` | Japanese | 日本語 | `Greet the user politely in Japanese.` |
| `ko` | Korean | 한국어 | `Greet the user politely in Korean.` |
| `es` | Spanish | Español | `Greet the user politely in Spanish.` |
| `fr` | French | Français | `Greet the user politely in French.` |

เมื่อผู้ใช้เปลี่ยนภาษาจากแถบ Navbar ข้อความ Greeting Instruction และบริบทของ Avatar จะถูกอัปเดตไปยัง WebAvatar SDK โดยอัตโนมัติ

---

## โครงสร้างไดเรกทอรี (Directory Structure)

```text
webavatar-demo-prototype/
├── public/                     # Static assets, icons, manifest
├── src/
│   ├── assets/                 # ไฟล์รูปภาพ (air.png, logos, promos)
│   ├── components/             # Reusable UI & Layout Components
│   │   ├── AppNavbar.tsx       # Header, Menu และตัวสลับภาษา/ธีม
│   │   ├── AppFooter.tsx       # Footer หลักของเว็บไซต์
│   │   ├── SpaNavListener.tsx  # Event Listener สำหรับเปลี่ยนหน้าเว็บผ่าน Avatar
│   │   ├── PersistentBackground.tsx # พื้นหลัง Interactive Canvas
│   │   ├── ThemeToggle.tsx     # ปุ่มสลับ Dark / Light Mode
│   │   ├── motion-ui/          # Page Curtain Transitions
│   │   └── ui/                 # Dialog, Modal, Toaster primitives
│   ├── config/
│   │   └── pages.ts            # รายชื่อและสถานะของแต่ละหน้าเพจ
│   ├── lib/
│   │   ├── LanguageContext.tsx # Context จัดการภาษา (7 ภาษา)
│   │   ├── ThemeContext.tsx    # Context จัดการ Dark/Light Theme
│   │   ├── translations.ts     # พจนานุกรมคำแปลภาษา
│   │   └── webavatarService.ts # Service เชื่อมต่อ JavaScript SDK ของ Avatar
│   ├── pages/                  # หน้าเพจแต่ละ Demo
│   │   ├── Home.tsx            # หน้า Landing Page หลัก
│   │   ├── FlightDemo.tsx      # หน้าจองตั๋วเครื่องบิน Botnoi Air
│   │   ├── FlightAdmin.tsx     # แดชบอร์ดจัดการเที่ยวบิน
│   │   ├── FoodOrderDemo.tsx   # หน้าร้านอาหาร Botnoi Restaurant
│   │   ├── OrderAdmin.tsx      # แดชบอร์ดจัดการร้านอาหาร
│   │   ├── ITStoreDemo.tsx     # หน้าร้านค้าไอที Botnoi IT Store
│   │   ├── ITStoreAdmin.tsx    # แดชบอร์ดจัดการร้านไอที
│   │   ├── OrderDemo.tsx       # หน้ารวม All Demos (20+ Sandbox Projects)
│   │   ├── AISales.tsx         # หน้าเดโมตัวแทนขาย AI
│   │   ├── TechsauceEvent.tsx  # หน้านำเสนออีเวนต์และเทคโนโลยี NIA 2026
│   │   ├── About.tsx           # หน้าเกี่ยวกับเรา
│   │   └── Contact.tsx         # หน้าติดต่อสอบถาม & FAQ
│   ├── App.tsx                 # การกำหนด React Router & Transitions
│   ├── main.tsx                # จุดเริ่มต้นแอปพลิเคชัน (Entry Point)
│   └── App.css                 # สไตล์ CSS และ Variable หลัก
├── INTEGRATION_GUIDE_REALTIME.md # คู่มือเชิงลึกเรื่อง WebAvatar Events & Methods
├── package.json                # Project Dependencies & Scripts
├── tsconfig.json               # TypeScript Configuration
└── vite.config.ts              # Vite Configuration
```

---

## NPM Scripts

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `npm run dev` | เริ่มต้น Development Server บนพอร์ต `5173` |
| `npm run build` | ตรวจสอบ TypeScript Type และ Build ไฟล์สำหรับ Production |
| `npm run preview` | พรีวิวไฟล์ Production Build ก่อนขึ้นเซิร์ฟเวอร์จริง |
| `npm run lint` | ตรวจสอบ Code Quality ด้วย ESLint |

---

<div align="center">
  <sub>Developed by <strong>Botnoi Group</strong> · Powered by <strong>Botnoi WebAvatar Technology</strong></sub>
</div>
