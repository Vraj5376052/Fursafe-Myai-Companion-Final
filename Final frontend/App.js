import { useState } from "react";
import SignupScreen from "./src/screens/Signupscreen"
import LoginScreen from "./src/screens/Loginscreen";
import SplashScreen from "./src/screens/Splashscreen";
import HomeScreen from "./src/screens/Homescreen";
import ChatScreen from "./src/screens/Chatscreen";
import RecordScreen from "./src/screens/Recordscreen";
import CameraScreen from "./src/screens/Camerascreen";
import UserScreen from "./src/screens/Userscreen";
import OnboardingScreen from "./src/screens/Onboardingscreen";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [incoming, setIncoming] = useState("");
  const [token, setToken] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const [messages, setMessages] = useState([
    { type: "ai", text: "Hi, I'm here to help." },
  ]);

  const goChat = (text) => {
    if (text) setIncoming(text);
    setScreen("chat");
  };

  if (screen === "splash") {
    return <SplashScreen goNext={() => setScreen("onboarding")} />;
  }

  if (screen === "onboarding") {
    return <OnboardingScreen goNext={() => setScreen("login")} />;
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={(t) => {
          if (!t.access_token) {
            setToken("guest");
          } else {
            setToken({ token: t.access_token, user: t.user });
          }
          setScreen("home");
        }}
        goSignup={() => setScreen("signup")}
      />
    );
  }

  if (screen === "signup") {
    return (
      <SignupScreen
        goLogin={() => setScreen("login")}
        onSignup={(auth) => {
          setToken({
            token: auth.access_token,
            user: auth.user,
          });
          setScreen("home");
        }}
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
      />
    );
  }

  return (
    <ChatScreen
      token={token}
      autoSpeak={autoSpeak}
      setAutoSpeak={setAutoSpeak}
      goBack={() => setScreen("home")}
      goRecord={() => setScreen("record")}
      goCamera={() => setScreen("camera")}
      goUser={() => setScreen("user")}
      incoming={incoming}
      messages={messages}
      setMessages={setMessages}
    />
  );
}
