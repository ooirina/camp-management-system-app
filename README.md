# CampCore — Aplicație Web pentru Gestiunea Taberelor

Platformă web full-stack destinată digitalizării procesului de organizare a taberelor, acoperind întreg fluxul operațional: de la înscrierea participanților și procesarea plăților, până la logistica internă, comunicarea echipei și rapoarte financiare.

---

## Tehnologii Utilizate

**Frontend**
- React 18 (Single Page Application)
- Axios — comunicare HTTP cu backend-ul
- Leaflet + OpenStreetMap — hartă interactivă cu locații și trasee
- html5-qrcode — scanare cod QR pentru check-in
- react-qr-code — generare cod QR la înscriere
- Bootstrap 5 — stilizare interfață
- Stripe.js — procesare plăți online

**Backend**
- Spring Boot 3 (Java)
- Spring Security — autentificare și autorizare bazată pe roluri
- JWT (JSON Web Tokens) — sesiuni stateless
- OAuth2 / Google — autentificare socială
- Spring Data JPA / Hibernate — acces bază de date
- JavaMailSender — trimitere emailuri automate
- Stripe Java SDK — integrare plăți

**Bază de Date**
- MySQL 8

---

## Funcționalități Principale

**Utilizator Client (Părinte / Participant)**
- Autentificare clasică (email + parolă) sau prin Google OAuth2
- Înscriere automatizată prin secțiunea „Familia mea" — refolosire date participanți fără reintroducere manuală
- Plată online prin Stripe cu generare factură PDF
- Cod QR generat la înscriere pentru check-in rapid
- Listă de așteptare automată când tabăra este plină
- Istoric complet al înscrierilor cu statusuri detaliate
- Comparare simultană a până la 3 tabere
- Hartă interactivă cu locații tabere și trasee montane

**Coordonator**
Platforma diferențiază între Coordonator simplu (operațional) și Coordonator Principal (decizional și administrativ).
- Gestionare și aprobare/respingere înscrieri
- Check-in/Check-out prin tabel digital sau scanare QR
- Management cazare cu filtru gen/vârstă și capacitate maximă
- Panou medical centralizat cu raport porții bucătărie
- Monitorizare prezență la activități
- Avizier intern pentru echipă și email broadcast către participanți
- Rapoarte în 6 tipuri: înscrieri, financiar, medical, check-in, participanți, personalizat

**Administrator**
- Gestiune completă utilizatori și tabere
- Buget agregat per tabără (încasări, rambursări, sold net)
- Acces la toate funcționalitățile coordonatorului

---

## Cum Rulezi Local

**Cerințe**
- Java 17+
- Node.js 18+
- MySQL 8
- Maven

**Backend (Spring Boot)**

```bash
# Clonează repository-ul
git clone https://github.com/username/campcore.git

# Configurează baza de date în application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/campcore
spring.datasource.username=root
spring.datasource.password=parola_ta

# Rulează backend-ul
cd licenta-tabere
.\mvnw spring-boot:run
```

**Frontend (React)**

```bash
cd frontend
npm install
npm start
```

Aplicația va fi disponibilă la `http://localhost:3000`.

---

## Structura Proiectului

```
campcore/
├── licenta-tabere/               # Backend Spring Boot
│   ├── src/main/java/
│   │   └── ro/licenta/taberemanager/
│   │       ├── controller/       # 17 controllere REST
│   │       ├── service/          # Logica de business
│   │       ├── repository/       # Acces baza de date (JPA)
│   │       ├── model/            # Entități JPA
│   │       ├── dto/              # Data Transfer Objects
│   │       ├── security/         # JWT + OAuth2
│   │       └── config/           # Spring Security config
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                     # Frontend React
    └── src/
        ├── components/           # Componente React
        ├── services/             # Axios API calls
        └── App.js                # Rute principale
```

---

## Variabile de Configurare

Creează un fișier `application.properties` cu valorile tale:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campcore
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

jwt.secret=YOUR_JWT_SECRET

stripe.secret.key=YOUR_STRIPE_SECRET_KEY

spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_APP_PASSWORD
```

Notă: fișierul application.properties cu datele reale nu este inclus în repository din motive de securitate. Creează-l local pe baza exemplului de mai sus.

---

## Autor

Olaru Irina — Lucrare de licență, Universitatea Babeș-Bolyai Cluj-Napoca
Facultatea de Științe Economice și Gestiunea Afacerilor — Informatică Economică, 2026
