# ⚡ EV-NEXUS — EV Charging Management System

**EV-NEXUS** is a smart and user-friendly **Electric Vehicle (EV) Charging Management System** designed to simplify the process of finding, monitoring, booking, and managing EV charging stations.

The system provides a centralized dashboard for viewing charger availability, station information, charging sessions, estimated costs, and smart charging recommendations.

## 🌐 Live Demo

🚀 **Live Application:**
https://ev-charging-manageme-h4g7.bolt.host

---

## 📌 Project Overview

The rapid growth of electric vehicles has created a need for efficient and intelligent charging infrastructure management.

EV charging operators need a centralized system to manage:

* Charging stations
* Charger availability
* Charging sessions
* Customer bookings
* Charging costs
* Energy consumption
* Station utilization
* Smart charging recommendations

**EV-NEXUS** addresses these requirements through an interactive web-based charging management platform.

The system helps EV users identify available chargers, select suitable charging time slots, estimate charging costs, and make smarter charging decisions.

---

## 🎯 Objectives

The main objectives of EV-NEXUS are:

1. To provide a centralized platform for EV charging station management.
2. To display real-time-style charger availability.
3. To allow users to find and book available chargers.
4. To recommend suitable charging time slots.
5. To provide estimated charging costs.
6. To reduce waiting time at charging stations.
7. To encourage charging during lower-demand periods.
8. To provide useful charging network analytics.
9. To create a simple and user-friendly interface for EV users and operators.

---

## ✨ Key Features

### ⚡ 1. Live Charging Network Overview

The dashboard provides an overview of the charging network, including:

* Total charging stations
* Total chargers
* Available chargers
* Network utilization
* Station status

Example dashboard information:

| Metric              | Example |
| ------------------- | ------: |
| Total Stations      |       6 |
| Total Chargers      |      33 |
| Available Now       |      15 |
| Network Utilization |     55% |

> The displayed values are sample/simulated values used for the project demonstration.

---

### 📍 2. Charging Station Monitoring

Users can view charging stations and their current availability.

Station information can include:

* Station name
* Location
* Total chargers
* Available chargers
* Charging price
* Station status

Example:

**T Nagar, Chennai**

* 5 / 6 chargers available
* ₹12.5 / unit

---

### 🔎 3. Find & Book a Charger

Users can select a charging station and book an available charger.

The booking process includes:

1. Select a station.
2. Check charger availability.
3. Select a suitable time slot.
4. Enter/select the user name.
5. Select charging duration.
6. Confirm the booking.
7. Generate booking details.
8. Display estimated charging cost.

---

### 🤖 4. Smart Charging Recommendation

One of the major features of EV-NEXUS is the **Smart Recommendation System**.

Instead of simply showing available chargers, the system recommends better charging time slots by considering factors such as:

* Charger availability
* Expected waiting time
* Simulated grid load
* Charging price
* Time of charging

The system can recommend lower-demand time periods where users may experience:

* Lower waiting time
* Better charging availability
* Lower estimated charging cost

This makes the platform more intelligent than a basic charger-booking system.

---

### 🕐 5. Smart Time Slot Suggestions

The system provides recommended charging slots.

Example:

| Time Slot     | Price / Unit | Grid Load Change | Estimated Wait |
| ------------- | -----------: | ---------------: | -------------: |
| 00:00 – 01:00 |       ₹10.90 |           -12.8% |         ~6 min |
| 23:00 – 00:00 |       ₹11.04 |           -11.7% |         ~7 min |
| 22:00 – 23:00 |       ₹11.19 |           -10.5% |         ~8 min |

These values are **simulated project values** used to demonstrate the smart recommendation concept.

---

### 💳 6. Booking & Payment Simulation

After selecting a charging slot, the system provides a booking confirmation.

The demonstration includes:

* Booking ID
* Transaction ID
* Estimated charging cost
* Savings information
* Payment status

Example:

**Booking Confirmed**

* Booking ID: #5
* Transaction ID: TXN655460
* Estimated Cost: ₹17.98
* Estimated Savings: ₹24.00
* Payment Status: Mock Payment Successful

> Payment functionality in the current project is a simulation and does not represent a real financial transaction.

---

### 📊 7. Charging Network Analytics

The dashboard provides an overview of network performance through metrics such as:

* Charger utilization
* Charger availability
* Station distribution
* Charging demand
* Energy-related information

Analytics can help charging operators understand network performance and identify areas requiring improvement.

---

## 🧠 Smart Recommendation Logic

EV-NEXUS uses a **rule-based smart recommendation approach** for the current prototype.

The recommendation considers multiple factors:

```text
Charger Availability
        +
Expected Waiting Time
        +
Grid Load
        +
Charging Price
        ↓
Smart Recommendation
        ↓
Best Charging Time Slot
```

A simplified recommendation score can be represented as:

```text
Recommendation Score =
Availability Score
+ Low Waiting Time Score
+ Low Grid Load Score
+ Price Advantage Score
```

The system then ranks the available time slots and presents the most suitable options to the user.

### Why this is useful

A normal charging application may only answer:

> "Which charger is available?"

EV-NEXUS goes one step further by attempting to answer:

> "Which charging time is better for me based on availability, waiting time, grid load and estimated cost?"

---

## 🔄 System Workflow

```text
                    ┌─────────────────────┐
                    │      EV User        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  EV-NEXUS Dashboard │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       View Stations      Check Chargers    View Analytics
              │                │
              └────────┬───────┘
                       ▼
              Smart Recommendation
                       │
                       ▼
                Select Time Slot
                       │
                       ▼
                 Book Charger
                       │
                       ▼
              Payment Simulation
                       │
                       ▼
              Booking Confirmation
```

---

## 🏗️ System Architecture

The project follows a web-based application architecture.

```text
┌──────────────────────────────────────────────┐
│                  User                        │
│             Web Browser                     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              EV-NEXUS UI                    │
│       Dashboard / Booking / Analytics        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│           Application Logic                  │
│   Availability / Booking / Recommendation   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Charging Data                   │
│ Stations / Chargers / Sessions / Pricing    │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Technologies Used

### Frontend / User Interface

* Python
* Streamlit
* HTML/CSS components
* Interactive Streamlit widgets

### Data & Application Logic

* Python
* Data processing
* Rule-based recommendation logic
* Session/state handling

### Development Tools

* VS Code
* Git
* GitHub
* Bolt

### Deployment

* Bolt-hosted web application

Streamlit applications are interactive and respond to user widget interactions through the application runtime.

---

## 📂 Project Structure

A typical project structure can be organized as:

```text
EV-NEXUS/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── assets/
│   ├── images/
│   └── icons/
│
├── data/
│   └── charging_data.csv
│
└── screenshots/
    ├── dashboard.png
    ├── booking.png
    └── analytics.png
```

> File names may differ depending on the final project files downloaded from Bolt.

---

## 🚀 How to Run the Project Locally

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/EV-NEXUS.git
```

### Step 2 — Open the Project

```bash
cd EV-NEXUS
```

### Step 3 — Create a Virtual Environment

```bash
python -m venv venv
```

### Step 4 — Activate the Environment

For Windows:

```bash
venv\Scripts\activate
```

### Step 5 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 6 — Run the Application

```bash
streamlit run app.py
```

The application will then open in the browser.

> If your main Python file has a different name, replace `app.py` with that filename.

---

## 📦 Example `requirements.txt`

Depending on the final implementation, the project may require packages such as:

```text
streamlit
pandas
numpy
plotly
```

Use the actual `requirements.txt` generated by your project as the source of truth.

---

## 🧪 Project Demonstration

The application demonstrates the following user journey:

### Step 1 — Open Dashboard

The user opens EV-NEXUS and views the charging network overview.

### Step 2 — Check Availability

The user checks available chargers at different stations.

### Step 3 — Select Station

The user chooses a suitable charging station.

### Step 4 — Get Smart Recommendation

The system provides recommended charging time slots.

### Step 5 — Select Charging Duration

The user selects the required charging duration.

### Step 6 — Confirm Booking

The user confirms the selected charging slot.

### Step 7 — Payment Simulation

The system displays a mock successful payment.

### Step 8 — Booking Confirmation

The system generates booking and transaction information.

---

## 🌟 What Makes EV-NEXUS Different?

Traditional charging applications generally focus on:

```text
Find Charger → Book Charger → Charge
```

EV-NEXUS aims to provide a more intelligent workflow:

```text
Monitor Network
      ↓
Check Availability
      ↓
Analyze Charging Conditions
      ↓
Recommend Better Time
      ↓
Book Charger
      ↓
Estimate Cost
      ↓
Confirm Booking
```

The main innovation of the prototype is the **combination of charger availability, booking, estimated pricing, waiting-time information and smart time-slot recommendations in one platform**.

---

## 🎯 Benefits

### For EV Users

* Easy charger discovery
* Reduced waiting time
* Better charging-time selection
* Estimated charging cost
* Simple booking process

### For Charging Operators

* Centralized monitoring
* Charger utilization visibility
* Station-level insights
* Charging demand analysis
* Better resource management

### For the Energy Ecosystem

* Encourages charging during lower-demand periods
* Can support better load management
* Helps reduce unnecessary peak-time charging
* Provides a foundation for future smart-grid integration

---

## 🔮 Future Enhancements

The current project is a prototype and can be extended with several advanced features.

### 1. Real-Time IoT Integration

Connect actual charging stations and receive live charger status.

### 2. OCPP Integration

Integrate **Open Charge Point Protocol (OCPP)** to communicate with compatible charging stations.

### 3. Real Payment Gateway

Replace mock payment with secure payment gateway integration.

### 4. GPS & Navigation

Add maps and route navigation to the selected charging station.

### 5. AI-Based Demand Prediction

Use machine learning to predict:

* Charging demand
* Peak hours
* Station congestion
* Future charger availability

### 6. Dynamic Pricing

Automatically adjust charging prices according to:

* Demand
* Grid load
* Time of day
* Station utilization

### 7. Renewable Energy Integration

Integrate solar and other renewable-energy information to recommend greener charging periods.

### 8. User Authentication

Add secure:

* User registration
* Login
* Role-based access
* Profile management

### 9. Admin Dashboard

Provide administrators with:

* Station management
* Charger management
* User management
* Revenue analytics
* Energy analytics

### 10. Predictive Maintenance

Use charger usage and fault information to predict possible equipment failures.

---

## 🔐 Security Considerations

For a production version, sensitive information such as:

* API keys
* Database passwords
* Authentication secrets
* Payment credentials

should **not** be committed directly to GitHub.

Environment variables or secure secret-management systems should be used instead. Streamlit also recommends keeping secrets outside the repository.

Example:

```text
.env
.streamlit/secrets.toml
```

These files should be added to `.gitignore` when they contain sensitive credentials.

---

## 📸 Screenshots

Add screenshots of your application here.

Example:

```markdown
## 📸 Screenshots

### Dashboard
![EV-NEXUS Dashboard](screenshots/dashboard.png)

### Smart Recommendation
![Smart Recommendation](screenshots/recommendation.png)

### Booking
![Booking](screenshots/booking.png)
```

Replace the image filenames with your actual screenshot filenames.

---

## 📈 Project Outcomes

EV-NEXUS successfully demonstrates a centralized concept for EV charging management.

The prototype provides:

* Charging network monitoring
* Charger availability
* Station information
* Smart charging recommendations
* Time-slot selection
* Booking management
* Cost estimation
* Mock payment confirmation
* Network analytics

The project demonstrates how software intelligence can be used to improve the EV charging experience for both users and charging operators.

---

## 👩‍💻 Project Information

**Project Name:** EV-NEXUS — EV Charging Management System

**Domain:** Electric Vehicle Infrastructure / Smart Charging

**Project Type:** Web Application / Prototype

**Development Tools:** VS Code, Git, GitHub, Bolt

**Deployment:** Bolt

**Live Demo:**
https://ev-charging-manageme-h4g7.bolt.host

---

## 📜 Disclaimer

This project is developed as an educational/prototype project.

The charger availability, pricing, grid-load values, payment transactions and other operational values shown in the demonstration may be simulated and are not necessarily connected to physical charging infrastructure or real financial transactions.

---

## ⭐ Conclusion

**EV-NEXUS** provides a centralized and intelligent approach to EV charging management by combining charger monitoring, availability checking, booking, cost estimation and smart charging-time recommendations.

The project provides a foundation that can be further developed into a production-ready EV Charging Management System by integrating real-time IoT devices, OCPP, payment gateways, GPS services, machine-learning models, databases and renewable-energy systems.

---

## 🔗 Live Project

⚡ **EV-NEXUS:**
https://ev-charging-manageme-h4g7.bolt.host

---

## 🙌 Acknowledgement

This project was developed as part of an academic/project learning initiative to explore the application of software development, data processing and intelligent recommendation techniques in the field of electric vehicle charging infrastructure.

---
