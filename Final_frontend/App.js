import { useState } from "react";
import SignupScreen from "./src/screens/Signupscreen";
import LoginScreen from "./src/screens/Loginscreen";
import SplashScreen from "./src/screens/Splashscreen";
import HomeScreen from "./src/screens/Homescreen";
import ChatScreen from "./src/screens/Chatscreen";
import RecordScreen from "./src/screens/Recordscreen";
import CameraScreen from "./src/screens/Camerascreen";
import UserScreen from "./src/screens/Userscreen";
import OnboardingScreen from "./src/screens/Onboardingscreen";
import TermsScreen from "./src/screens/Termscreen";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [previousScreen, setPreviousScreen] = useState("signup"); 
  const [incoming, setIncoming] = useState("");
  const [token, setToken] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [targetLang, setTargetLang] = useState("English");
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [messages, setMessages] = useState([
    { type: "ai", text: "Hi, I'm here to help." },
  ]);
  const [chatId, setChatId] = useState(null);

  const goChat = (text) => {
    setIncoming(text || "");
    setScreen("chat");
  };

  const goTerms = (from) => {
    setPreviousScreen(from);
    setScreen("terms");
  };

  if (screen === "splash") {
    return <SplashScreen goNext={() => setScreen("onboarding")} />;
  }

  if (screen === "onboarding") {
    return (
      <OnboardingScreen
        goNext={() => setScreen(previousScreen === "user" ? "user" : "login")}
      />
    );
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={(t) => {
          setToken(t.access_token ? { token: t.access_token, user: t.user } : "guest");
          setScreen("home");
        }}
        goSignup={() => setScreen("signup")}
        goTerms={() => goTerms("login")}
      />
    );
  }

  if (screen === "signup") {
    return (
      <SignupScreen
        goLogin={() => setScreen("login")}
        goTerms={() => goTerms("signup")}
        onSignup={(auth) => {
          setToken({ token: auth.access_token, user: auth.user });
          setSignupForm({ name: "", email: "", password: "", confirm: "" });
          setScreen("home");
        }}
        termsAccepted={signupTermsAccepted}
        setTermsAccepted={setSignupTermsAccepted}
        formValues={signupForm}
        setFormValues={setSignupForm}
      />
    );
  }

  if (screen === "terms") {
    return (
      <TermsScreen
        goBack={() => {
          if (previousScreen === "signup") {
            setSignupTermsAccepted(true);
          }
          setScreen(previousScreen);
        }}
        fromSettings={previousScreen === "user"}
      />
    );
  }

  if (screen === "home") {
    return <HomeScreen goChat={() => setScreen("chat")} />;
  }

  if (screen === "record") {
    return <RecordScreen goBack={goChat} token={token?.token} />;
  }

  if (screen === "camera") {
    return <CameraScreen goBack={goChat} token={token?.token} />;
  }

  if (screen === "user") {
    return (
      <UserScreen
        goBack={() => setScreen("chat")}
        token={token}
        onLogout={() => {
          setToken(null);
          setScreen("login");
        }}
        autoSpeak={autoSpeak}
        setAutoSpeak={setAutoSpeak}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        goTerms={() => goTerms("user")}
        goOnboarding={() => {
          setPreviousScreen("user");
          setScreen("onboarding");
        }}
      />
    );
  }

  return (
    <ChatScreen
      token={token}
      autoSpeak={autoSpeak}
      setAutoSpeak={setAutoSpeak}
      targetLang={targetLang}
      setTargetLang={setTargetLang}
      goBack={() => setScreen("home")}
      goRecord={() => setScreen("record")}
      goCamera={() => setScreen("camera")}
      goUser={() => setScreen("user")}
      incoming={incoming}
      setIncoming={setIncoming}
      messages={messages}
      setMessages={setMessages}
      chatId={chatId}
      setChatId={setChatId}
    />
  );
}