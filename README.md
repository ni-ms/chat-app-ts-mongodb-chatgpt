# Real-Time Chat Application

This is a real-time chat application built with a front-end and back-end architecture.

## Project Structure

The project is divided into two main folders:

1. **front_end**: Contains the front-end code.
2. **back_end**: Contains the back-end code.



### Prerequisites

Make sure you have node js version 20 and npm version 16 or above. The code has been tested in ubuntu 20 lts

### Installation

#### 1. Clone the Repository

```
git clone https://github.com/ni-ms/realtime-chat.git
cd realtime-chat-app
```


#### 2. Navigate to each folder and run ```npm i```
```
cd front_end
npm install
```
```
cd back_end
npm install
```


#### 2. Run ```npm run dev``` in each folder
By default, the back_end runs at localhost 3000 and the front end at http://localhost:5173/
If the chat api doesnt work, go to https://cors-anywhere.herokuapp.com/corsdemo and click on the "request temporary access to demo server" button and try again.

The api routes for the app are:
## API Routes

### `/auth/register` [POST]
- Description: Register a new user.
- Request Body: 
  - `email`: User's email.
  - `password`: User's password.
- Response: A message indicating successful registration.

### `/auth/login` [POST]
- Description: Login an existing user.
- Request Body: 
  - `email`: User's email.
  - `password`: User's password.
- Response: A JWT token for the authenticated user.

### `/auth/profile` [GET]
- Description: Get the profile of the authenticated user.
- Authentication: JWT token required.
- Response: The authenticated user's profile.

### `/auth/users` [GET]
- Description: Get a list of all users.
- Authentication: JWT token required.
- Response: A list of all users with their emails.
