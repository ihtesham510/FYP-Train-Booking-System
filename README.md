# Train Booking Management System

- User Auth
  - [x] User Can Sign in with Email and password
  - [x] User Can Sign in with Phone_no and password
  - [x] User Can Sign in with Username and password
  - [x] User Encrypted `_id` will be stored in the localstorage of browser, so that when the user refreshes the page it will look up for the user in database using the encrypted `_id`
  - [x] User password will be encrypted and stored in the database.
  - [x] While Signing in and Signing up the Username , Phone_no and Email will be checked weather the user is authenticated or not.
  - [x] Validation for email , password , Phone_no, Username while signing in and signing up is enabled
- Train
  - [x] The User can search For train using the source , destination and date of journey of the train.
  - [x] Even If the user is not searching for the train the user should see all the lists of trains.
  - [x] When the User Searches for the train the user should be able to click on the train from the list and add a booking.
  - [ ] When the user books a seat on a train the trains seats avaliablity should change.
  - [ ] When the user cancelled a booking the trains seats should update.

# How to dev

install the pnpm

```bash
npm i -g pnpm
```

Install dependencies

```bash
pnpm install

```

---

Make sure you have a Github Account and you are logged-in in convex

first run

```bash
pnpm run convex # for connecting to the database

```

```bash
pnpm dev # for running the development environment

```

# Set Environment Variables

Run the following commands in the terminal

```bash

pnpm dlx conver env set CRYPTO_SECRET_KEY <add_your_Secret_key_here>

```

# Add Data

Add data by making a `data.jsonl` file then ask Chat-GPT to do the following

```txt
Generate about 30 dummy train  data in jsonl format use pakistan's cities
the following is the schema for the train

name: v.string(),
dateOfJourney: v.string(),
trainNumber: v.string(),
source: v.string(),
destination: v.string(),
arrivalTime: v.string(),
departureTime: v.string(),
distance: v.number(),
seats: v.array(
  v.object({
    class: v.string(),
    seats: v.number(),
    price: v.number(),
  }),
),

```

then paste the data in the `data.jsonl` file then run the following command

```bash
npx convex import --table trains data.jsonl
```

# How to Deploy

Make sure a vercel account.

Create a new project.

Go to your convex project dashboard head to Project-setting>URL & Deploy Keys and hit generate Deployment deploy key.

![image info](src/assets/Screenshot_1.png)

Copy the key generated.

Head to your environment variables and paste the following environment variable.

![image info](src/assets/Screenshot_2.png)

Override the build command

![image info](src/assets/Screenshot_3.png)

---

### ✅ **1. Project Overview & Motivation**

This is a full-stack **Train Booking System** designed to allow users to book, manage, and cancel train tickets online. It solves the problem of long queues and lack of real-time seat availability by digitizing the process.

---

### ✅ **2. Functional & Non-Functional Requirements**

**Functional Requirements:**

- User authentication (Email, Phone, Username)
- Train search and booking
- Seat availability updates
- Booking cancellation
- Encrypted user session tracking
- Form validation for signup/signin

**Non-Functional Requirements:**

- Security (password hashing, session encryption)
- Real-time seat consistency
- High usability (simple UI/UX)
- Scalability and performance
- Data integrity and validation

---

### ✅ **3. Technologies & Architecture**

**Technologies Used:**

- **Frontend:** React.js (for dynamic UI)
- **Backend:** Hono (small, fast backend framework)
- **Database:** Convex (real-time database)
- **State Management:** Context API or Zustand
- **Auth & Crypto:** bcrypt for password hashing, encryption libraries for `_id`
- **Package Manager:** `pnpm`

**Architecture:**
Modular, component-based frontend with API-driven backend and real-time database syncing. Clean separation of concerns and reactive data flows.

---

### ✅ **4. Database Design**

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  user: defineTable({
    first_name: v.string(), // first name of the user
    last_name: v.string(), // last name of the user
    user_name: v.string(), // username of the user
    gender: v.union(v.literal('male'), v.literal('female')), // gender
    email: v.string(), // email
    image_url: v.optional(
      v.object({ url: v.string(), storageId: v.id('_storage') }),
    ), // image url for profile picture
    phone: v.string(), // phone number of the user
    password: v.string(), // password of the user (that will be encryped and store)
  }),
  train: defineTable({
    name: v.string(), // train name
    dateOfJourney: v.string(), // train journey date
    trainNumber: v.string(), // train number
    source: v.string(), // from station
    destination: v.string(), // to station
    arrivalTime: v.string(),
    departureTime: v.string(),
    distance: v.number(),
    seats: v.array(
      v.object({
        class: v.string(),
        seats: v.number(),
        price: v.number(),
      }),
    ),
  }),
  pnr: defineTable({
    bookingId: v.id('booking'), // relation to booking
    trainId: v.id('train'), // relation to train
    userId: v.id('user'), // relation to user
    status: v.union(
      v.literal('pending'),
      v.literal('cancelled'),
      v.literal('departed'),
    ),
    last_updated: v.number(),
  }),
  booking: defineTable({
    /* booking details */
    userId: v.id('user'),
    trainId: v.id('train'),
    name: v.string(),
    source: v.string(),
    destination: v.string(),
    arrivalTime: v.string(),
    departureTime: v.string(),
    distance: v.number(),
    email: v.string(),
    phone: v.string(),
    class: v.string(),
    seats: v.number(),
    farePaid: v.union(v.number(), v.null()),
    fare: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('cancelled'),
      v.literal('departed'),
    ),
  }),
})
```

- Users, Trains, and Bookings are stored in separate tables.
- **Relations:**

  - Each **Booking** stores a reference to `userId` and `trainId`.
  - Train schema includes a list of `seats` objects with `class`, `availableSeats`, and `price`.
  - Convex allows referencing other documents via `v.id()` and querying via indexes.

- Designed this way to allow efficient querying and real-time updates without joins.

---

### ✅ **5. Booking & Concurrency Handling**

- When a user books a seat, a function checks seat availability in real-time.
- If available, it decrements the seat count in the train document and creates a booking.
- Convex ensures atomic updates using transactions and optimistic concurrency control.
- When a booking is canceled, seat count is incremented back.

---

### ✅ **6. Main Core Features**

- Sign in using Email / Phone / Username
- Encrypted `_id` stored in local storage for session management
- Train search by source, destination, and date
- Book/cancel seats with real-time availability updates
- View booking history

---

### ✅ **7. Additional Features**

- Validation for email, password, phone, and username
- Password hashing with bcrypt
- Auth checks during signup and login
- Session persistence with encrypted user ID
- All trains visible by default, even without search

---

### ✅ **8. Security & Validation**

- **Password Hashing:** bcrypt used to hash passwords before saving to DB
- **Session Handling:** Encrypted user `_id` stored in browser local storage
- **Auth Validation:** During signup/signin, system checks for duplicate usernames, phone numbers, and emails
- **Form Validation:** Email format, strong passwords, phone number validation implemented on both client and server

---

### ✅ **9. Use Cases & UML (Example Explanation)**

**Use Case: User Booking Flow**

1. **User logs in** → Auth checked (username/email/phone + password)
2. **Search train** by source, destination, date
3. **Click train**, view seats
4. **Book a seat** → updates train seat count and creates booking entry
5. **Cancel booking** → deletes booking and updates seat count

**Other Use Cases:**

- User Registration
- View Train List
- View Booking History
- Session Restoration via Encrypted `_id`
