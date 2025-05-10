import { GoogleGenAI } from "@google/genai";

// Inisialisasi API dengan API key
const ai = new GoogleGenAI({ apiKey: "AIzaSyAqwIpUtkS8ZxE9RPtk2LRgcQNQhM3KHeI" }); // Ganti dengan API key Anda

// Elemen DOM
const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");

// Variabel untuk menyimpan file yang diunggah
let uploadedFile = null;

// Fungsi untuk menambahkan pesan ke chatbox
function addMessage(sender, message, isCode = false) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  if (isCode) {
    // Jika pesan adalah kode, gunakan elemen <pre> untuk menjaga format
    const preElement = document.createElement("pre");
    preElement.textContent = message;
    preElement.style.background = "#f4f4f9";
    preElement.style.padding = "10px";
    preElement.style.borderRadius = "10px";
    preElement.style.overflowX = "auto";
    messageElement.appendChild(preElement);
  } else {
    // Jika pesan adalah teks biasa, tambahkan spacing antar paragraf
    const paragraphs = message.split("\n").filter((p) => p.trim() !== "");
    paragraphs.forEach((paragraph) => {
      const pElement = document.createElement("p");
      pElement.textContent = paragraph;
      pElement.style.margin = "5px 0";
      messageElement.appendChild(pElement);
    });
  }

  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight; // Scroll ke bawah
}

// Fungsi untuk menambahkan file ke chatbox
function addFileMessage(sender, file) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("file-message", sender);

  const fileName = file.name;
  const fileURL = URL.createObjectURL(file);

  // Tambahkan nama file
  const fileTitle = document.createElement("p");
  fileTitle.textContent = fileName;
  fileTitle.classList.add("file-title");
  messageElement.appendChild(fileTitle);

  // Deteksi apakah file adalah gambar
  if (/\.(jpeg|jpg|png|gif)$/i.test(fileName)) {
    // Jika file adalah gambar
    const img = document.createElement("img");
    img.src = fileURL;
    img.alt = fileName;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    img.style.marginTop = "5px";
    img.style.border = sender === "user" ? "2px solid #007bff" : "2px solid #333"; // Warna border berbeda
    messageElement.appendChild(img);
  } else {
    // Jika file bukan gambar, tambahkan tombol "View"
    const viewButton = document.createElement("button");
    viewButton.textContent = "View";
    viewButton.classList.add("view-button");
    viewButton.onclick = () => {
      window.open(fileURL, "_blank");
    };
    messageElement.appendChild(viewButton);
  }

  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight; // Scroll ke bawah
}

// Fungsi untuk mengirim pesan ke AI
async function sendMessage(prompt, file = null) {
  try {
    let contents = prompt;

    // Jika ada file yang diunggah, tambahkan informasi file ke prompt
    if (file) {
      contents += `\n\nAttached file: ${file.name}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Gunakan model yang valid
      contents: contents,
    });

    console.log("API Response:", response); // Debugging: Periksa respons API
    return { text: response.text.trim(), isCode: response.text.includes("<") || response.text.includes("function") };
  } catch (error) {
    console.error("Error generating response:", error.message);
    return { text: "Sorry, I couldn't process your request.", isCode: false };
  }
}

// Event listener untuk tombol "Send"
sendBtn.addEventListener("click", async () => {
  const prompt = userInput.value.trim();
  if (!prompt) {
    alert("Please enter a message!");
    return;
  }

  // Tambahkan pesan pengguna ke chatbox
  addMessage("user", prompt);
  userInput.value = "";

  // Tampilkan "Typing..." saat menunggu respons
  addMessage("bot", "Typing...");

  // Panggil API untuk mendapatkan respons
  const { text: botResponse, isCode } = await sendMessage(prompt, uploadedFile);

  // Hapus "Typing..." dan tambahkan respons bot
  const typingMessage = chatbox.querySelector(".bot:last-child");
  typingMessage.remove(); // Hapus "Typing..." pesan
  addMessage("bot", botResponse, isCode);

  // Reset file setelah dikirim
  uploadedFile = null;
});

// Event listener untuk tombol upload
uploadBtn.addEventListener("click", () => {
  fileInput.click(); // Buka dialog file
});

// Event listener untuk input file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    uploadedFile = file; // Simpan file yang diunggah
    addFileMessage("user", file); // Tampilkan preview file di chatbox
    fileInput.value = ""; // Reset input file
  }
});