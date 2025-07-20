const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};
const userEmojis = {};
let channels = ["Gaming", "Epitech", "Tek-2", "WAC-2"];
const channelActivity = {};
const channelCreators = {};

const emojiList = [
  "😀",
  "😎",
  "🤓",
  "😺",
  "🦁",
  "🐶",
  "🐻",
  "🦊",
  "🐼",
  "🐨",
  "😸",
  "😹",
  "🙀",
  "😽",
  "🐰",
  "🐸",
  "🦒",
  "🦝",
  "🐮",
  "🐷",
];

const INACTIVITY_TIMEOUT = 300000;

const assignEmoji = (username) => {
  if (!userEmojis[username]) {
    const randomIndex = Math.floor(Math.random() * emojiList.length);
    userEmojis[username] = emojiList[randomIndex];
  }
  return userEmojis[username];
};

const getUsersInChannel = (channel) => {
  const socketsInChannel = io.sockets.adapter.rooms.get(channel) || new Set();
  return Array.from(socketsInChannel)
    .map((socketId) => ({
      username: users[socketId],
      emoji: users[socketId] ? userEmojis[users[socketId]] : null,
    }))
    .filter((user) => user.username);
};

const checkInactiveChannels = () => {
  const now = Date.now();
  channels = channels.filter((channel) => {
    const socketsInChannel = io.sockets.adapter.rooms.get(channel) || new Set();
    if (
      socketsInChannel.size === 0 &&
      now - (channelActivity[channel] || 0) > INACTIVITY_TIMEOUT
    ) {
      console.log(
        `Le canal ${channel} a été supprimé en raison d'une période d'inactivité`
      );
      io.emit("channel list", channels);
      io.emit(
        "command response",
        `Le canal ${channel} a été supprimé en raison d'une période d'inactivité`
      );
      delete channelCreators[channel];
      return false;
    }
    return true;
  });
};

setInterval(checkInactiveChannels, 60000);

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté");

  socket.emit("channel list", channels);

  socket.on("set username", (username) => {
    if (username && !Object.values(users).includes(username)) {
      users[socket.id] = username;
      assignEmoji(username);
      console.log(`${username} s'est connecté`);
      socket.join(channels[0]);
      channelActivity[channels[0]] = Date.now();
      socket.emit("joined channel", channels[0]);
      io.to(channels[0]).emit(
        "user joined",
        `${username} a rejoint ${channels[0]}`
      );
      socket.emit(
        "command response",
        `Nom d'utilisateur changé en ${username}`
      );
      io.to(channels[0]).emit("user list", {
        channel: channels[0],
        users: getUsersInChannel(channels[0]),
      });
    } else {
      socket.emit(
        "command error",
        `Nom d'utilisateur ${username} est déjà pris ou invalide`
      );
    }
  });

  socket.on("nick", (newUsername) => {
    if (newUsername && !Object.values(users).includes(newUsername)) {
      const oldUsername = users[socket.id];
      users[socket.id] = newUsername;
      userEmojis[newUsername] = userEmojis[oldUsername];
      delete userEmojis[oldUsername];
      socket.rooms.forEach((ch) => {
        if (ch !== socket.id) {
          io.to(ch).emit(
            "user joined",
            `${newUsername} (anciennement ${oldUsername}) a rejoint ${ch}`
          );
          io.to(ch).emit("user list", {
            channel: ch,
            users: getUsersInChannel(ch),
          });
        }
      });
      socket.emit(
        "command response",
        `Nom d'utilisateur changé en ${newUsername}`
      );
    } else {
      socket.emit(
        "command error",
        `Nom d'utilisateur ${newUsername} est déjà pris ou invalide`
      );
    }
  });

  socket.on("list", () => {
    socket.emit(
      "command response",
      `Canaux disponibles : ${channels.join(", ") || "Aucun"}`
    );
  });

  socket.on("create channel", (channelName) => {
    if (channelName && !channels.includes(channelName)) {
      channels.push(channelName);
      channelActivity[channelName] = Date.now();
      channelCreators[channelName] = socket.id;
      io.emit("channel list", channels);
      console.log(`Le canal ${channelName} a été créé par ${users[socket.id]}`);
      socket.emit("command response", `Le canal ${channelName} a été créé`);
    } else {
      socket.emit(
        "command error",
        `Le canal ${channelName} existe déjà ou est invalide`
      );
    }
  });

  socket.on("delete channel", (channelName) => {
    if (channels.includes(channelName)) {
      if (channelCreators[channelName] === socket.id) {
        channels = channels.filter((ch) => ch !== channelName);
        delete channelActivity[channelName];
        delete channelCreators[channelName];
        io.emit("channel list", channels);
        io.to(channelName).emit("channel deleted", channelName);
        console.log(
          `Le canal ${channelName} a été supprimé par ${users[socket.id]}`
        );
        socket.emit(
          "command response",
          `Le canal ${channelName} a été supprimé`
        );
      } else {
        socket.emit(
          "command error",
          `Seul le créateur de ${channelName} peut le supprimer`
        );
      }
    } else {
      socket.emit("command error", `Le canal ${channelName} n'existe pas`);
    }
  });

  socket.on("join channel", (channel) => {
    if (channels.includes(channel)) {
      socket.join(channel);
      channelActivity[channel] = Date.now();
      socket.emit("joined channel", channel);
      io.to(channel).emit(
        "user joined",
        `${users[socket.id]} a rejoint ${channel}`
      );
      socket.emit("command response", `Rejoint le canal ${channel}`);
      io.to(channel).emit("user list", {
        channel,
        users: getUsersInChannel(channel),
      });
    } else {
      socket.emit("command error", `Le canal ${channel} n'existe pas`);
    }
  });

  socket.on("leave channel", (channel) => {
    if (channels.includes(channel) && socket.rooms.has(channel)) {
      socket.leave(channel);
      channelActivity[channel] = Date.now();
      io.to(channel).emit(
        "user left",
        `${users[socket.id]} a quitté ${channel}`
      );
      socket.emit("left channel", channel);
      socket.emit("command response", `A quitté le canal ${channel}`);
      io.to(channel).emit("user list", {
        channel,
        users: getUsersInChannel(channel),
      });
    } else {
      socket.emit("command error", `Vous n'êtes pas dans le canal ${channel}`);
    }
  });

  socket.on("list users", (channel) => {
    if (channels.includes(channel)) {
      socket.emit("user list", {
        channel,
        users: getUsersInChannel(channel),
      });
    } else {
      socket.emit("command error", `Le canal ${channel} n'existe pas`);
    }
  });

  socket.on("private message", ({ recipient, message }) => {
    if (users[socket.id]) {
      const sender = users[socket.id];
      const recipientSocketId = Object.keys(users).find(
        (socketId) => users[socketId] === recipient
      );
      if (recipientSocketId) {
        const formattedMessage = `[Privé] ${sender}: ${message}`;
        io.to(recipientSocketId).emit("private message", formattedMessage);
        socket.emit("private message", formattedMessage);
        socket.emit("command response", `Message envoyé à ${recipient}`);
      } else {
        socket.emit("command error", `Utilisateur ${recipient} non trouvé`);
      }
    }
  });

  socket.on("chat message", (data) => {
    if (users[socket.id] && channels.includes(data.channel)) {
      const formattedMessage = `${users[socket.id]} : ${data.message}`;
      io.to(data.channel).emit("chat message", {
        channel: data.channel,
        text: formattedMessage,
      });
      channelActivity[data.channel] = Date.now();
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id] || "Un utilisateur";
    socket.rooms.forEach((ch) => {
      if (ch !== socket.id) {
        io.to(ch).emit("user left", `${username} a quitté ${ch}`);
        channelActivity[ch] = Date.now();
        io.to(ch).emit("user list", {
          channel: ch,
          users: getUsersInChannel(ch),
        });
      }
    });
    console.log(`${username} disconnected`);
    delete users[socket.id];
    delete userEmojis[username];
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
