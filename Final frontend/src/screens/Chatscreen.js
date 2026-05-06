import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";
import {
  addMessage,
  fetchChatById,
  fetchChats,
  createChat,
  deleteChat,
  translateText,
} from "../services/apiService";

export default function ChatScreen({
  goRecord,
  goCamera,
  goBack,
  goUser,
  incoming,
  token,
  messages,
  setMessages,
  autoSpeak,
  setAutoSpeak,
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const [chatId, setChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [showChats, setShowChats] = useState(false);

  // LANGUAGE FEATURE
  const [showLang, setShowLang] = useState(false);
  const [searchLang, setSearchLang] = useState("");
  const [targetLang, setTargetLang] = useState("English");

  const languages = [
    "English", "Vietnamese", "Chinese", "Japanese", "Korean",
    "French", "German", "Spanish", "Italian"
  ];

  const getLangCode = (lang) => {
    const map = {
      English: "en-US",
      Vietnamese: "vi-VN",
      Chinese: "zh-CN",
      Japanese: "ja-JP",
      Korean: "ko-KR",
      French: "fr-FR",
      German: "de-DE",
      Spanish: "es-ES",
      Italian: "it-IT",
    };
    return map[lang] || "en-US";
  };

  const detectLanguage = (text) => {
    if (!text) return "en-US";
    if (/[àáạảãâăđêôơư]/i.test(text)) return "vi-VN";
    if (/[\u4e00-\u9fff]/.test(text)) return "zh-CN";
    if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
    if (/[\uac00-\ud7af]/.test(text)) return "ko-KR";
    return "en-US";
  };

  // LOAD CHAT LIST
  useEffect(() => {
    if (!token?.token) return;

    const loadChats = async () => {
      try {
        const res = await fetchChats(token.token);
        setChatList(res);

        if (res.length && !chatId) {
          setChatId(res[0].id);
        }
      } catch (err) {
        console.log("Fetch chats error:", err);
      }
    };

    loadChats();
  }, [token]);

  // LOAD CHAT MESSAGES
  useEffect(() => {
    if (!chatId) return;

    const loadChat = async () => {
      try {
        setMessages([{ type: "ai", text: "Loading chat..." }]);

        const res = await fetchChatById(chatId, token?.token);

        if (res?.messages) {
          const formatted = res.messages.map((m) => ({
            type: m.role === "user" ? "user" : "ai",
            text: m.message,
          }));

          setMessages(formatted.length ? formatted : [{ type: "ai", text: "Hi, I'm here to help." }]);
        }
      } catch (err) {
        console.log("Fetch chat error:", err);
      }
    };

    loadChat();
  }, [chatId]);

  // SEND MESSAGE
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    if (!token?.token) {
      setMessages((p) => [
        ...p,
        { type: "ai", text: "Please login to use AI features." }
      ]);
      return;
    }

    let currentChatId = chatId;

    if (!currentChatId) {
      try {
        const newChat = await createChat(token.token);
        currentChatId = newChat.chatId;
        setChatId(currentChatId);
      } catch (err) {
        console.log("Create chat error:", err);
        return;
      }
    }

    setMessages((p) => [
      ...p,
      { type: "user", text },
      { type: "ai", text: "Thinking..." }
    ]);

    setInput("");

    try {
      const res = await addMessage(currentChatId, text, token.token);

      const aiText = res.ai_message || "AI unavailable";

      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = { type: "ai", text: aiText };
        return updated;
      });

      if (autoSpeak) {
        speakText(aiText);
      }

      const updatedChats = await fetchChats(token.token);
      setChatList(updatedChats);

    } catch (error) {
      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = { type: "ai", text: error.message };
        return updated;
      });
    }
  };

  // INCOMING (from record/camera)
  useEffect(() => {
    if (incoming) sendMessage(incoming);
  }, [incoming]);

  // AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // CREATE NEW CHAT
  const handleCreateChat = async () => {
    try {
      const res = await createChat(token?.token);
      setMessages([{ type: "ai", text: "New chat started." }]);
      setChatId(res.chatId);
      setShowChats(false);

      const updated = await fetchChats(token?.token);
      setChatList(updated);
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE CHAT
  const handleDeleteChat = async (id) => {
    try {
      await deleteChat(id, token?.token);

      const updated = await fetchChats(token?.token);
      setChatList(updated);

      if (chatId === id) {
        setMessages([{ type: "ai", text: "Select a chat." }]);
        setChatId(updated[0]?.id || null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // SPEAK TEXT
  const speakText = (text) => {
    if (!text) return;
    Speech.stop();
    const finalLang = getLangCode(targetLang) || detectLanguage(text);
    Speech.speak(text, { language: finalLang, pitch: 1.0, rate: 0.9 });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.phoneFrame}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="#0dd9f7" />
            </TouchableOpacity>

            <Text style={styles.headerText}>MyAI Companion</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Ionicons
                name="menu-outline"
                size={24}
                color="#0dd9f7"
                onPress={() => setShowChats(!showChats)}
              />
              <Ionicons
                name="person-outline"
                size={24}
                color="#0dd9f7"
                onPress={goUser}
              />
              <Ionicons
                name={autoSpeak ? "volume-high" : "volume-mute"}
                size={20}
                color="#0dd9f7"
                onPress={() => setAutoSpeak(!autoSpeak)}
              />
            </View>
          </View>

          {/* CHIPS */}
          <ScrollView horizontal style={styles.chips}>
            {[
              { icon: "medkit-outline", label: "Explain" },
              { icon: "globe-outline", label: "Translate" },
              { icon: "document-text-outline", label: "Summarise" },
            ].map((chip) => (
              <TouchableOpacity
                key={chip.label}
                style={styles.chip}
                onPress={() => {
                  if (chip.label === "Translate") {
                    setShowLang(!showLang);
                    return;
                  }

                  const lastUserMsg = [...messages].reverse().find((m) => m.type === "user");

                  if (!lastUserMsg) {
                    sendMessage(
                      chip.label === "Summarise"
                        ? "Please summarise what I tell you next."
                        : "Please explain what I tell you next in simple terms."
                    );
                    return;
                  }

                  if (chip.label === "Summarise") {
                    sendMessage(`Please summarise the following in clear, simple language:\n\n"${lastUserMsg.text}"`);
                  } else {
                    sendMessage(`Based on what I described below, please explain in plain, simple language what is happening and what it might mean for me as a patient:\n\n"${lastUserMsg.text}"`);
                  }
                }}
              >
                <Ionicons name={chip.icon} size={16} color="#0dd9f7" />
                <Text style={styles.chipText}> {chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* LANGUAGE DROPDOWN */}
          {showLang && (
            <View style={styles.dropdown}>
              <TextInput
                placeholder="Search language..."
                placeholderTextColor="#aaa"
                value={searchLang}
                onChangeText={setSearchLang}
                style={styles.dropdownInput}
              />
              {languages
                .filter((l) => l.toLowerCase().includes(searchLang.toLowerCase()))
                .map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={styles.dropdownItem}
                    onPress={async () => {
                      const last = messages[messages.length - 1];
                      if (!last) return;
                      try {
                        const res = await translateText(last.text, lang, token?.token);
                        setTargetLang(lang);
                        setMessages((p) => [...p, { type: "ai", text: res.translated_text }]);
                      } catch (err) {
                        console.log("Translate error:", err);
                      }
                      setShowLang(false);
                    }}
                  >
                    <Text style={{ color: "white" }}>{lang}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* SIDEBAR */}
          {showChats && (
            <View style={{
              position: "absolute",
              left: 0,
              top: 60,
              bottom: 0,
              width: 200,
              backgroundColor: "#0a0a2a",
              zIndex: 10,
              padding: 10,
            }}>
              <ScrollView>
                <TouchableOpacity onPress={handleCreateChat} style={{ marginBottom: 15 }}>
                  <Text style={{ color: "#0dd9f7", fontSize: 16 }}>+ New Chat</Text>
                </TouchableOpacity>

                {chatList.map((chat) => (
                  <View key={chat.id} style={{ marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => { setChatId(chat.id); setShowChats(false); }}>
                      <Text style={{ color: "white", marginBottom: 4 }}>
                        {chat.title || `Chat ${chat.id}`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteChat(chat.id)}>
                      <Text style={{ color: "red", fontSize: 12 }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* CHAT MESSAGES */}
          <ScrollView ref={scrollRef} style={{ flex: 1, marginBottom: 80 }}>
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[styles.msg, msg.type === "user" ? styles.user : styles.ai]}
              >
                <Text style={{ color: msg.type === "user" ? "#04041c" : "white" }}>
                  {msg.text}
                </Text>

                {msg.type === "ai" && (
                  <View style={{ flexDirection: "row", marginTop: 6, gap: 10 }}>
                    <Ionicons
                      name="volume-high-outline"
                      size={18}
                      color="#0dd9f7"
                      onPress={() => speakText(msg.text)}
                    />
                    <Ionicons
                      name="stop-circle-outline"
                      size={18}
                      color="#ff4444"
                      onPress={() => Speech.stop()}
                    />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* INPUT BAR */}
          <View style={styles.floatingInput}>
            <TouchableOpacity onPress={goRecord}>
              <Ionicons name="mic-outline" size={22} color="#0dd9f7" />
            </TouchableOpacity>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              style={styles.input}
              onSubmitEditing={() => sendMessage(input)}
            />

            <TouchableOpacity onPress={goCamera}>
              <Ionicons name="camera-outline" size={22} color="#0dd9f7" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => sendMessage(input)}>
              <Ionicons name="send" size={22} color="#0dd9f7" />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
