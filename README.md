# 📱 WhatsApp Reminder Web App

A full-stack web application to schedule and automatically send WhatsApp messages using the Meta WhatsApp Cloud API.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## ✨ Features

- ✅ Add reminders with person name, phone number, message, date/time
- ✅ Repeat types: One-time, Daily, 10 Days, Monthly
- ✅ Automatic WhatsApp message sending when reminder time arrives
- ✅ Auto-rescheduling for recurring reminders
- ✅ Dashboard with stats (Total, Pending, Sent, Failed)
- ✅ Edit and delete reminders
- ✅ Status badges (Pending, Sent, Failed)
- ✅ Modern WhatsApp-inspired UI
- ✅ Fully responsive design
- ✅ Toast notifications for success/failure

---

## 🏗️ Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app with CORS & lifespan
│   │   ├── database.py      # SQLAlchemy + SQLite setup
│   │   ├── models.py        # Reminder ORM model
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── routes.py        # REST API endpoints
│   │   ├── scheduler.py     # APScheduler reminder checker
│   │   └── whatsapp.py      # Meta WhatsApp Cloud API service
│   ├── .env.example          # Environment variables template
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/api.js   # Axios API client
│   │   ├── App.jsx           # Main application
│   │   └── index.css         # Tailwind + custom styles
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **Meta WhatsApp Cloud API** credentials (optional for testing)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env
# Then edit .env with your WhatsApp API credentials

# Start the server
python run.py
```

The backend will start at **http://localhost:8000**
- API docs: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will start at **http://localhost:5173**

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
WHATSAPP_TOKEN=your_meta_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
```

### How to get WhatsApp Cloud API credentials:

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → Select "Business" type
3. Add "WhatsApp" product to your app
4. Go to WhatsApp → API Setup
5. Copy your **Temporary Access Token** and **Phone Number ID**
6. Add a test phone number to send messages to

> **Note:** Without valid credentials, the app will still work — reminders will just show as "Failed" status instead of "Sent".

---

## 📡 API Endpoints

| Method   | Endpoint              | Description          |
| -------- | --------------------- | -------------------- |
| `GET`    | `/api/reminders`      | List all reminders   |
| `GET`    | `/api/reminders/{id}` | Get single reminder  |
| `POST`   | `/api/reminders`      | Create reminder      |
| `PUT`    | `/api/reminders/{id}` | Update reminder      |
| `DELETE` | `/api/reminders/{id}` | Delete reminder      |
| `GET`    | `/api/dashboard/stats`| Dashboard statistics |

---

## 📋 Database Schema

| Column             | Type     | Description                    |
| ------------------ | -------- | ------------------------------ |
| `id`               | Integer  | Primary key (auto-increment)   |
| `name`             | String   | Person's name                  |
| `phone`            | String   | Phone with country code        |
| `message`          | Text     | Reminder message body          |
| `reminder_datetime`| DateTime | When to send                   |
| `repeat_type`      | String   | one-time/daily/10-days/monthly |
| `status`           | String   | pending/sent/failed            |
| `created_at`       | DateTime | Auto-set on creation           |
| `last_sent_at`     | DateTime | Last successful send time      |

---

## ⚙️ How the Scheduler Works

1. APScheduler runs a background job every **30 seconds**
2. It queries all reminders where `status = pending` AND `reminder_datetime <= now`
3. For each due reminder:
   - Sends WhatsApp message via Meta Cloud API
   - **Success** → marks as "sent" (one-time) or reschedules (recurring)
   - **Failure** → marks as "failed"
4. Recurring reminders auto-calculate their next send time

---

## 🛠️ Tech Stack

| Component  | Technology           |
| ---------- | -------------------- |
| Frontend   | React.js + Tailwind CSS v3 |
| Backend    | FastAPI (Python)     |
| Database   | SQLite + SQLAlchemy  |
| Scheduler  | APScheduler          |
| WhatsApp   | Meta Cloud API       |
| HTTP Client| Axios (FE) + httpx (BE) |
| Icons      | Lucide React         |
| Toasts     | React Hot Toast      |

---

## 📄 License

MIT License — feel free to use and modify!
