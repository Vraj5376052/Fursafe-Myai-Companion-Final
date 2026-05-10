import { Platform } from "react-native";

// change to your PC IP if testing on phone
const BASE_URL = Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.247:8000";

// AUTH

// LOGIN
export const login = async (email, password) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let data;
    try { data = await res.json(); } catch { throw new Error("Server error — could not connect"); }

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server timeout");
    }
    console.log("FETCH ERROR:", err);
    throw err;
  }
};

// SIGNUP
// SIGNUP
export const register = async (name, email, password, acceptedTerms) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        accepted_terms: acceptedTerms,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let data;
    try { data = await res.json(); } catch { throw new Error("Server error — could not connect"); }

    if (!res.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server timeout");
    }
    console.log("FETCH ERROR:", err);
    throw err;
  }
};

// TRANSLATE
export const translateText = async (text, targetLanguage, token) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE_URL}/auth/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Translation failed");
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Translate timeout");
    }
    console.log("FETCH ERROR:", err);
    throw err;
  }
};

// OCR
export const imageToText = async (uri, token) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    let formData = new FormData();

    if (Platform.OS === "web") {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append("file", blob, "upload.jpg");
    } else {
      formData.append("file", {
        uri,
        name: "upload.jpg",
        type: "image/jpeg",
      });
    }

    const res = await fetch(`${BASE_URL}/api/ocr`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    console.log("OCR STATUS:", res.status);

    clearTimeout(timeout);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      console.log("OCR ERROR BACKEND:", data);
      throw new Error(data.detail || "OCR failed");
    }

    return {
      text: data.text || "",
    };

  } catch (err) {
    console.log("OCR URI:", uri);
    console.log("OCR FRONTEND ERROR:", err);

    if (err.name === "AbortError") {
      throw new Error("OCR timeout");
    }

    throw err;
  }
};

// TRANSCRIBE AUDIO
export const transcribeAudio = async (uri, token) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const formData = new FormData();
    // Detect format from URI extension (expo-audio records m4a on iOS, webm on Android)
    const ext = uri.split(".").pop()?.toLowerCase() || "m4a";
    const mimeMap = { m4a: "audio/m4a", wav: "audio/wav", webm: "audio/webm", mp4: "audio/mp4", ogg: "audio/ogg" };
    const mimeType = mimeMap[ext] || "audio/m4a";
    formData.append("file", {
      uri,
      type: mimeType,
      name: `recording.${ext}`,
    });

    const res = await fetch(`${BASE_URL}/api/transcribe`, {
      method: "POST",
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Transcription failed — invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.detail || "Transcription failed");
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Transcription timeout");
    }
    throw err;
  }
};

// CHAT SYSTEM

// CREATE CHAT
export const createChat = async (token) => {
  const res = await fetch(`${BASE_URL}/chat/create-chat`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Create chat failed");
  }

  return data;
};

// DELETE CHAT
export const deleteChat = async (chatId, token) => {
  const res = await fetch(`${BASE_URL}/chat/delete-chat/${chatId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Delete failed");
  }

  return data;
};

// FETCH ALL CHATS
export const fetchChats = async (token) => {
  const res = await fetch(`${BASE_URL}/chat/fetch-chats`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Fetch chats failed");
  }

  return data;
};

// FETCH SINGLE CHAT
export const fetchChatById = async (chatId, token) => {
  const res = await fetch(`${BASE_URL}/chat/fetch-chat/${chatId}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Fetch chat failed");
  }

  return data;
};

// ADD MESSAGE
export const addMessage = async (chatId, message, token, targetLang = "English") => {
  const res = await fetch(`${BASE_URL}/chat/add-chat/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, target_language: targetLang }),
  });
 
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Chat failed");
  return data;
};

// UPDATE USER PROFILE
export const updateProfile = async (data, token) => {
  const res = await fetch(`${BASE_URL}/auth/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Update failed");
  }

  return result;
};
