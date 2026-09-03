const API_URL = "http://localhost:5000/api/ai/chat";

// DOM ELEMENT
const chatContainer = document.getElementById("chatContainer");
const historyList = document.getElementById("historyList");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const typing = document.getElementById("typing");
const clearBtn = document.getElementById("clearBtn");
const newChatBtn = document.getElementById("newChatBtn");
const voiceToggle = document.getElementById("voiceToggle");
const stopVoice = document.getElementById("stopVoice");
const themeBtn = document.getElementById("themeBtn");
const voiceStatus = document.getElementById("voiceStatus");

// VARIABLES

let voiceEnabled = true;
let recognition = null;
let isListening = false;
let currentChatId = null;


// LOAD CHAT SESSIONS
let chatSessions =
  JSON.parse(localStorage.getItem("aiChatSessions")) || [];


// CREATE NEW CHAT ID
function createChatId() {
  return Date.now().toString();
}


// CREATE NEW CHAT
function createNewChat() {
  currentChatId = createChatId();
  chatSessions.push({
    id: currentChatId,
    title: "New Chat",
    messages: [],


    createdAt: new Date().toISOString(),


    updatedAt: new Date().toISOString()
 });


  saveSessions();
  renderHistory();
  showWelcome();


}


// SAVE SESSIONS
function saveSessions() {

  localStorage.setItem(
    "aiChatSessions",
    JSON.stringify(chatSessions)
  );


}


// GET CURRENT CHAT
function getCurrentChat() {


  return chatSessions.find(
    chat => chat.id === currentChatId
  );
}




// LOAD INITIAL CHAT
function initializeChat() {
  if (chatSessions.length === 0) {
    createNewChat();
    
    return;
  }


  const latestChat =
    [...chatSessions]
      .sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      )[0];


  currentChatId = latestChat.id;
  renderCurrentChat();
  renderHistory();
}




// RENDER CURRENT CHAT
function renderCurrentChat() {
  chatContainer.innerHTML = "";
  const currentChat = getCurrentChat();

  if (
    !currentChat ||
    currentChat.messages.length === 0
  ) {

    showWelcome();
    return;
}


  currentChat.messages.forEach(message => {
    addMessageToUI(
      message.text,
      message.sender,
      false
    );


  });
}

// SHOW WELCOME

function showWelcome() {


  chatContainer.innerHTML = `


   <div class="welcome" id="welcome">


     <div class="welcome-icon">
       🤖
     </div>


     <h2>
       How can I help you today?
     </h2>


     <p>
       Ask me anything or use your microphone
       to talk with me.
     </p>


     <div class="suggestions">


       <button class="suggestion">
         🎓 Explain JavaScript promises
       </button>


       <button class="suggestion">
         💻 Help me fix my code
       </button>


       <button class="suggestion">
         📝 Summarize this topic
       </button>


       <button class="suggestion">
         ✍️ Write a professional email
       </button>


     </div>


   </div>


 `;

  addSuggestionEvents();
}

// ADD MESSAGE TO UI
function addMessageToUI(
  message,
  sender,
  save = true
) {


  document
    .getElementById("welcome")
    ?.remove();



  const wrapper =
    document.createElement("div");

  wrapper.className =
    `message ${sender === "user"
      ? "user"
      : "ai"
    }`;



  const content =
    document.createElement("div");

  content.className =
    "message-content";

  content.textContent =
    message;
  wrapper.appendChild(content);



  // AI actions
  if (sender === "ai") {


    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";


    // Copy button
    const copyButton =
      document.createElement("button");

    copyButton.textContent =
      "📋 Copy";



    copyButton.addEventListener(
      "click",
      async () => {


        try {


          await navigator.clipboard.writeText(
            message
          );


          copyButton.textContent =
            "✓ Copied";


          setTimeout(() => {


            copyButton.textContent =
              "📋 Copy";


          }, 1500);


        } catch (error) {


          console.error(
            "Copy error:",
            error
          );
          }


      }
    );


    // Speak button
    const speakButton =
      document.createElement("button");
    speakButton.textContent =
      "🔊 Speak";

    speakButton.addEventListener(
      "click",
      () => {

        speak(message);


      }
    );

    actions.appendChild(copyButton);
    actions.appendChild(speakButton);
    content.appendChild(actions);


  }
  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop =
    chatContainer.scrollHeight;


  // Save message
  if (save) {
    saveMessage(
      message,
      sender
    );


  }
}


// SAVE MESSAGE
function saveMessage(
  message,
  sender
) {


  let currentChat =
    getCurrentChat();


  if (!currentChat) {
    createNewChat();
    currentChat =
      getCurrentChat();

  }


  currentChat.messages.push({
    text: message,
    sender: sender,
    time: new Date().toISOString()


  });


  // First user message becomes title
  if (
    sender === "user" &&
    currentChat.title === "New Chat"
  ) {
    currentChat.title =
    createChatTitle(message);


  }


  currentChat.updatedAt =
    new Date().toISOString();


  saveSessions();
  renderHistory();
}


// CREATE CHAT TITLE
function createChatTitle(message) {


  const cleanMessage =
    message
      .replace(/\s+/g, " ")
      .trim();


  if (cleanMessage.length <= 30) {
     return cleanMessage;

  }


  return (
    cleanMessage.substring(0, 30) +
    "..."
  );

}


// RENDER HISTORY
function renderHistory() {
  historyList.innerHTML = "";


  if (chatSessions.length === 0) {
    historyList.innerHTML = `
     <div class="no-history">
       No recent chats
     </div>
   `;

    return;
  }


  const sortedChats =
    [...chatSessions].sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
    );


  sortedChats.forEach(chat => {

    const item =
      document.createElement("div");

    item.className =
      "history-item";


    if (chat.id === currentChatId) {
      item.classList.add("active");
    }


    // Icon
    const icon =
      document.createElement("span");

    icon.className =
      "history-icon";
    icon.textContent =
      "💬";


    // Title
    const title =
      document.createElement("span");

    title.className =
      "history-name";

    title.textContent =
      chat.title || "New Chat"

    title.title =
      chat.title || "New Chat";




    // Delete
    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "history-delete";

    deleteButton.textContent =
      "×";

    deleteButton.title =
      "Delete chat";


    deleteButton.addEventListener(
      "click",
      event => {
        event.stopPropagation();
        deleteChat(chat.id);


      }
    );


    item.appendChild(icon);
    item.appendChild(title);
    item.appendChild(deleteButton);


    // Open chat
    item.addEventListener(
      "click",
      () => {


        openChat(chat.id);


      }
    );

    historyList.appendChild(item);

  });
}



// OPEN CHAT
function openChat(chatId) {

  const chat =
    chatSessions.find(
      item => item.id === chatId
    );


  if (!chat) {
    return;
  }


  currentChatId =
    chatId;

  renderCurrentChat();
  renderHistory();

}



// DELETE CHAT

function deleteChat(chatId) {


  const confirmed =
    confirm(
      "Delete this chat?"
    );

  if (!confirmed) {
    return;
  }

  chatSessions =
    chatSessions.filter(
      chat => chat.id !== chatId
    );



  // If current chat deleted

  if (currentChatId === chatId) {


    if (chatSessions.length === 0) {


      createNewChat();


      return;


    }

    const latestChat =
      [...chatSessions].sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      )[0];

    currentChatId =
      latestChat.id;


  }


  saveSessions();
  renderCurrentChat();
  renderHistory();


}


// SEND MESSAGE

async function sendMessage() {


  const message =
    messageInput.value.trim();

  if (!message) {
    return;
  }


  // Disable send button
  sendBtn.disabled = true;


  // Show user message
  addMessageToUI(
    message,
    "user"
  );

  // Clear input
  messageInput.value = "";
  messageInput.style.height =
    "auto";


  // Show typing
  typing.style.display =
    "flex";
  try {
    const response =
      await fetch(
        API_URL,
        {

          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            message: message
          })


        }
      );


    const data =
      await response.json();

  if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Something went wrong."
      );
    }


    // AI response
    addMessageToUI(
      data.reply,
      "ai"
    );

    // Voice output
    if (voiceEnabled) {
      speak(data.reply);

    }

  } catch (error) {
    console.error(
      "Chat error:",
      error
    );

    addMessageToUI(
      `Sorry, I couldn't answer right now.\n\n${error.message}`,
      "ai"
    );


  } finally {


    typing.style.display =
      "none";


    sendBtn.disabled =
      false;
  }

}


// SEND BUTTON
sendBtn.addEventListener(
  "click",
  sendMessage
);


// ENTER KEY
messageInput.addEventListener(
  "keydown",
  event => {


    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }


  }
);



// TEXTAREA AUTO RESIZE
messageInput.addEventListener(
  "input",
  () => {

    messageInput.style.height =
      "auto";

    messageInput.style.height =
      `${Math.min(
        messageInput.scrollHeight,
        150
      )}px`;


  }
);




// TEXT TO SPEECH
function speak(text) {


  if (
    !("speechSynthesis" in window)
  ) {


    alert(
      "Your browser does not support voice output."
    );


    return;
}


  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = "en-US";
  window.speechSynthesis.speak(
    utterance
  );


}

// STOP SPEAKING

stopVoice.addEventListener(
  "click",
  () => {
    window.speechSynthesis.cancel();


  }
);


// VOICE ON / OFF

voiceToggle.addEventListener(
  "click",
  () => {
    
    voiceEnabled =
      !voiceEnabled;


    if (voiceEnabled) {
      voiceToggle.textContent =
        "🔊";
    } else {
      voiceToggle.textContent =
        "🔇";

      window.speechSynthesis.cancel();

    }
  }
);


// SPEECH RECOGNITION

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;



if (SpeechRecognition) {


  recognition =
    new SpeechRecognition();
  recognition.continuous =
    false;

  recognition.interimResults =
    false;

  recognition.lang =
    "en-US";

  recognition.onstart =
    () => {


      isListening = true;


      micBtn.classList.add(
        "listening"
      );

      micBtn.textContent =
        "🔴";

      voiceStatus.textContent =
        "Listening...";
    };



  recognition.onresult =
    event => {


      const transcript =
        event
          .results[0][0]
          .transcript;


      messageInput.value =
        transcript;

      messageInput.style.height =
        "auto";

      messageInput.style.height =
        `${Math.min(
          messageInput.scrollHeight,
          150
        )}px`;


    };




  recognition.onerror =
    event => {


      console.error(
        "Speech recognition error:",
        event.error
      );

      voiceStatus.textContent =
        "Voice error";
    };




  recognition.onend =
    () => {
     
      isListening = false;

      micBtn.classList.remove(
        "listening"
      );

      micBtn.textContent =
        "🎤"
      voiceStatus.textContent =
      "Voice ready";

    };



  micBtn.addEventListener(
    "click",
    () => {
      if (isListening) {
        recognition.stop();
      } else {


        try {


          recognition.start();


        } catch (error) {


          console.error(
            error
          );
        }
     }
    }
  );


} else {


  micBtn.disabled = true;
  voiceStatus.textContent =
    "Voice not supported";
}


// NEW CHAT

newChatBtn.addEventListener(
  "click",
  () => {

    createNewChat();
    messageInput.focus();
  }
);


// CLEAR CURRENT CHAT

clearBtn.addEventListener(
  "click",
  () => {


    const currentChat =
      getCurrentChat();


    if (!currentChat) {
      return;
    }

    const confirmed =
      confirm(
        "Clear messages from this chat?"
      );


    if (!confirmed) {
      return;
    }



    currentChat.messages = [];


    currentChat.title =
      "New Chat";

    currentChat.updatedAt =
      new Date().toISOString();




    saveSessions();
    renderCurrentChat();
    renderHistory();


  }
);


// SUGGESTION BUTTONS

function addSuggestionEvents() {
  document
    .querySelectorAll(".suggestion")
    .forEach(button => {


      button.onclick = () => {
        const text =
          button.textContent
            .replace(/^[^\w]+/, "")
            .trim();




        messageInput.value =
          text;
        
          sendMessage();


      };


    });
}



// DARK MODE
const savedTheme =
  localStorage.getItem(
    "theme"
  );


if (savedTheme === "dark") {

  document.body.classList.add(
    "dark"
  );

  themeBtn.textContent =
    "☀️ Light Mode";

}



themeBtn.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "dark"
    );


    const dark =
      document.body.classList.contains(
        "dark"
      );



    localStorage.setItem(
      "theme",
      dark
        ? "dark"
        : "light"
    );


    themeBtn.textContent =
      dark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";


  }
);


// INITIALIZE APP

initializeChat();

