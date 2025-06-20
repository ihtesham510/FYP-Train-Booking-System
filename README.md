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

```bash
pnpm dev

```

# Set Environment Variables

Run the following commands in the terminal

```

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
