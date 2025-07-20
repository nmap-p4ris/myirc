# My_IRC

My_IRC is a modern IRC-style chat application inspired by xat.com, built with a Node.js/Express backend, React frontend, and packaged as a desktop app using Electron. It offers real-time messaging, channel management, private messages, IRC commands, emoji support, and a nostalgic design with grey tabs and a `background2.gif` backdrop. Data is stored in memory, and the backend runs separately from the frontend and Electron app.

## Features

- **Authentication**: Users set a username and receive a random emoji (e.g., 😺).
- **Channels**: Create (`/create`), join (`/join`), leave (`/leave`), and delete (`/delete`) channels, with auto-deletion of inactive channels after 5 minutes.
- **Messaging**: Send public messages in channels and private messages (`/msg`) to specific users.
- **IRC Commands**: Supports `/nick`, `/list`, `/users`, `/msg` for user and channel management.
- **Notifications**: Red asterisk (*) on tabs indicates unread messages.
- **Design**: xat.com-inspired UI with grey tabs, white messages on `background2.gif`, and an emoji picker.
- **Desktop App**: Electron integration for a cross-platform desktop experience (Windows, macOS, Linux).

## Project Structure

```
my_irc/
├── index.js              # Backend (Node.js, Express, Socket.IO)
├── main.js               # Electron configuration
├── package.json          # Backend and Electron dependencies
├── client/
│   ├── src/
│   │   ├── App.js        # React frontend
│   │   ├── App.css       # xat.com-inspired styles
│   ├── public/
│   │   ├── background2.gif # Background image
│   ├── package.json      # Frontend dependencies
```

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- A modern web browser for testing the web version
- Windows, macOS, or Linux for the desktop app

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/my_irc.git
   cd my_irc
   ```

2. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd client
   npm install
   ```

4. **Verify Assets**:
   - Ensure `background2.gif` is in `client/public/`.
   - Optionally, add a `favicon.ico` in `client/public/` for the Electron app icon.

## Running the Application

Run the backend, frontend, and Electron app in separate terminals.

1. **Start the Backend** (runs on `http://localhost:3001`):
   ```bash
   cd my_irc
   npm start
   ```

2. **Start the Frontend** (runs on `http://localhost:3000`):
   ```bash
   cd my_irc/client
   npm start
   ```

3. **Start the Electron App**:
   ```bash
   cd my_irc
   npm run electron
   ```

## Building the Desktop App

1. **Build the Frontend** (optional, for static build):
   ```bash
   cd my_irc/client
   npm run build
   ```
   - Update `main.js` to load the static build:
     ```javascript
     win.loadFile(path.join(__dirname, "client/build/index.html"));
     ```

2. **Package the App**:
   ```bash
   cd my_irc
   npm run dist
   ```
   - Generates executables in `my_irc/dist/` (e.g., `My_IRC.exe` for Windows).

3. **Run the Executable**:
   - Start the backend (`npm start`).
   - Run the generated executable (e.g., `dist/My_IRC.exe`).

## Usage

- **Sign In**: Enter a username to join the default channel (`General`) with a random emoji.
- **Channels**: Use `/create <channel>`, `/join <channel>`, `/leave <channel>`, or `/delete <channel>` to manage channels, or use the UI (dropdown, buttons, tab close).
- **Messaging**: Send public messages in channels or private messages via `/msg <username> <message>` or the private message section.
- **Notifications**: Tabs with unread messages show a red asterisk (*).
- **Emojis**: Use the emoji picker (😊 button) to add emojis to messages.
- **Commands**: Try `/nick <newname>`, `/list`, `/users <channel>` for additional functionality.

## Troubleshooting

- **Electron Window Blank**:
  - Ensure the frontend is running (`localhost:3000`).
  - Check the console: `npm run electron -- --enable-logging`.
- **Socket.IO Connection Issues**:
  - Verify the backend is running (`localhost:3001`).
- **Background Image**:
  - Confirm `background2.gif` is in `client/public/` or `client/build/static/media` (for static build).
- **Packaging Issues**:
  - Ensure `client/build` exists for static builds.
  - Verify `electron-builder` is installed (`npm install electron-builder --save-dev`).

## Future Improvements

- Add desktop notifications for new messages.
- Implement password-based authentication.
- Customize the Electron window (e.g., remove menu bar, add custom icon).
- Bundle the backend into the Electron app for a standalone experience.

## Author

Paduraru Stefan-Paris
