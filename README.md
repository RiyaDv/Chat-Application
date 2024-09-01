# **Chat Application**

### Overview
This is a modern, real-time chat application built with React, Node.js, Express, and Socket.io. The application allows users to join chat rooms, send and receive messages, upload files, and toggle between dark and light themes. The UI is styled with Material-UI (MUI) and has enhanced visual features for a modern user experience.

## Features
- Real-time messaging using Socket.io.
- Room-based chat system.
- User authentication and presence tracking.
- File sharing with support for images, videos, and documents.
- Dark and light mode theme toggling.
- Responsive design with Material-UI.

## Technologies Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Socket.io Client**: Enables real-time, bidirectional communication between the client and server.
- **Axios**: A promise-based HTTP client for making API requests.
- **Material-UI (MUI)**: A React component library that provides pre-built components with a modern design.
- **JavaScript (ES6+)**: Modern JavaScript features for clean and efficient code.
- **CSS**: Custom styling for additional UI enhancements.

### Backend
- **Node.js**: A JavaScript runtime environment for executing server-side code.
- **Express.js**: A minimal and flexible Node.js web application framework.
- **Socket.io**: Handles real-time, bidirectional communication between the client and server.
- **MongoDB**: A NoSQL database used to store user data and chat messages.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js.
- **Multer**: A middleware for handling `multipart/form-data`, used for file uploads.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v12+)
- MongoDB (local instance or MongoDB Atlas account)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/RiyaDv/Chat-Application.git
    cd Chat-Application
    ```

2. **Install dependencies for both frontend and backend:**
    ```bash
    cd client
    npm install
    cd ../Server
    npm install
    ```

3. **Set up environment variables:** *(Optional)*
   - Create a `.env` file in the `Server` directory with the following content:
     ```
     MONGODB_URI=your-mongodb-connection-string
     PORT=5000
     ```

4. **Start the backend server:**
    ```bash
    cd Server
    npm start
    ```

5. **Start the frontend development server:**
    ```bash
    cd client
    npm start
    ```

6. **Access the application:**
   - Open your browser and go to `http://localhost:3000`.

## Usage

1. **Register & Join a Chat Room:**
   - Enter a username and a room name.
   - Click "Join Room" to enter the chat room.

2. **Send Messages:**
   - Type a message and press "Enter" or click the "Send" button.

3. **Share Files:**
   - Click the "Attach File" icon to upload and share files (Image/Video) within the chat.

4. **Dark/Light Mode:**
   - Toggle between dark and light mode using the button at the top right corner.

## Project Structure

```bash
Chat-Application/
│
├── client/                     # Frontend code
│   ├── public/                 # Public assets
│   └── src/                    # React components and app logic
│       └── App.js              # Main app component
│
├── server/                     # Backend code
│   ├── uploads/                # Store uploaded Images and Videos
│   └── server.js               # Main server file
│
└── README.md                   # Project README file
```

## API Endpoints

### User Routes
- `POST /user`: Add or fetch user by username.

### Chat Routes
- `GET /messages/:room`: Fetch chat history for a specific room.
- `POST /upload`: Handle file uploads.

## Screenshots
<table align="center">
  <tr>
    <td align="center">
      <h3>Light Mode</h3>
      <img src="https://github.com/RiyaDv/Chat-Application/blob/main/client/public/assets/Light%20Theme.png?raw=true" alt="Light-Mode" width="400" height="600"/>
    </td>
    <td align="center">
      <h3>Dark Mode</h3>
      <img src="https://github.com/RiyaDv/Chat-Application/blob/main/client/public/assets/Dark%20Theme.png?raw=true" alt="Dark-Mode" width="400" height="600"/>
    </td>
  </tr>
</table>



---
