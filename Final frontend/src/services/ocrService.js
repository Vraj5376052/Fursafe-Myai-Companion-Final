import axios from "axios";

export const imageToText = async (uri) => {
  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "img.jpg",
  });

  const res = await axios.post(
    "https://api.ocr.space/parse/image",
    formData,
    {
      headers: { apikey: "helloworld" },
    }
  );

  return res.data.ParsedResults[0].ParsedText;
};