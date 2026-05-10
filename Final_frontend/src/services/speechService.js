import axios from "axios";

export const speechToText = async (uri) => {
  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "audio/m4a",
    name: "recording.m4a",
  });

  formData.append("model", "whisper-1");

  const res = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
      },
    }
  );

  return res.data.text;
};