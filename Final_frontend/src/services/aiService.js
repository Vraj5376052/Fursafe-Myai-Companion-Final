export const getAIResponse = (text) => {
  const t = text.toLowerCase();

  if (t.includes("tablet"))
    return "This likely means you should take medication after eating.";

  if (t.includes("pain"))
    return "This suggests discomfort. Monitor symptoms.";

  return "Here’s a simpler explanation of your message.";
};