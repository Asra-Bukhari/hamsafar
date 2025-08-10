
# 🚗 HamSafar – Carpool Web Platform

HamSafar is a **full-stack web application** that makes commuting easier, more affordable, and more sustainable by enabling users to **offer rides, join rides, and form regular carpool groups**.

Initially inspired by the transportation challenges faced by university students with varying schedules, HamSafar can serves **anyone** seeking flexible, cost-effective travel solutions.

---

## 🌟 Features

| Category                      | Details                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Roles**                | 🚘 **Driver** – Offer rides by scheduling trips.<br>🧍 **Passenger** – Search and join rides based on preferences.                                            |
| **Ride Management**           | Schedule one-time or recurring rides.<br>View trip details including **route, distance, and estimated time**.<br>Join trips instantly if seats are available. |
| **Interactive Maps**          | Powered by **Mapbox API** & **OpenStreetMap**.<br>Live route display with pickup & drop-off points.                                                           |
| **Friends Group Carpool**     | Create or join **Friends Groups** for regular commutes.<br>Add or remove group members easily.                                                                |
| **Ratings & Reviews**         | Rate trips and leave driver reviews.<br>View your trip rating history.                                                                                        |
| **Real-Time Notifications**   | Live updates for trip requests, acceptances, and group invites via **Axios** polling.                                                                         |
| **Profile & Settings**        | Edit profile info.<br>Change password and update preferences.<br>Toggle **Dark Theme**.<br>Delete or deactivate account.                                      |
| **Admin Actions**             | Approve or reject trips.<br>Manage reported users and flagged trips.                                                                                          |
| **Authentication & Security** | **JWT-based Authentication** for secure sessions.                                                                                                             |
| **Payment System**            | Manual payments (will move to online gateway integration in future).                                                                                          |


---

## 🛠 Tech Stack

### **Frontend**

- React.js
- Tailwind CSS
- Axios
- 
### **Backend**

- Node.js + Express.js
- JWT Authentication
  
### **Database**

- Microsoft SQL Server (MS SQL)
- Fully normalized schema
- Stored Procedures
- Triggers
  
### **Maps & Geolocation**

- Mapbox API
- OpenStreetMap

---


```plaintext
📂 Project Structure
HamSafar/
├── backend/
│   ├── controllers/       # Business logic
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── db.js              # DB connection
│   ├── server.js          # Backend entry
│   └── .env               # Environment variables
│
├── frontend/
│   ├── public/
│   │   ├── assets/        # Logos & static assets
│   │   ├── images/        # App images
│   ├── src/
│   │   ├── components/    # Pages & UI components
│   │   ├── App.js         # App shell & routing
│   │   └── index.js
│
├── screenshots/           # App screenshots
└── README.md
```


## ⚙️ Environment Variables


```env
DB_USER
DB_PASSWORD
DB_SERVER
DB_DATABASE
DB_ENCRYPT
DB_TRUST_CERT
````

---

## 🚀 Getting Started

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/Asra-Bukhari/hamsafar.git
cd hamsafar
```

### **2️⃣ Backend Setup**

```bash
cd backend
npm install
```

- Create `.env` file (see above)
- Start the server:

```bash
npm start
```

### **3️⃣ Frontend Setup**

```bash
cd frontend
npm install
npm start
```

---

## 📸 Visuals

| Logo Page                          | signup Page                            | Driver Reg                                    |
| ---------------------------------- | -------------------------------------- | --------------------------------------------- |
| ![Logo Page](screenshots/logo.jpg) | ![Signup Page](screenshots/signup.jpg) | ![Driver Reg](screenshots/registerdriver.jpg) |

| Login Page                           | Home Page                          | Schedule Trip                              |
| ------------------------------------ | ---------------------------------- | ------------------------------------------ |
| ![Login Page](screenshots/login.jpg) | ![Home Page](screenshots/home.jpg) | ![Schedule Trip](screenshots/schedule.jpg) |

| Join Trip                          | Friends Group                                  | Profile Page                             |
| ---------------------------------- | ---------------------------------------------- | ---------------------------------------- |
| ![Join Trip](screenshots/join.jpg) | ![Friends Group](screenshots/friendsgroup.jpg) | ![Profile Page](screenshots/profile.jpg) |

| Accept Requests                                    | Ratings                             | Notifications                                   |
| -------------------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| ![Accept Requests](screenshots/acceptrequests.jpg) | ![Ratings](screenshots/ratings.jpg) | ![Notifications](screenshots/notifications.jpg) |

## 💡 Future Improvements

- Online payment integration (Stripe/PayPal)
- AI-based ride matching

---

## 👩‍💻 Authors

**Asra Bukhari**
**Shizza Razzaq**
**Muhammad Harmain**
