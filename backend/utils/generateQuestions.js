const axios = require("axios");

async function getSupportedGenerateModel(apiKey) {
  const versions = ["v1", "v1beta"];

  for (const version of versions) {
    try {
      const listUrl = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      const response = await axios.get(listUrl, { timeout: 30000 });
      const models = Array.isArray(response?.data?.models) ? response.data.models : [];

      console.log(`Available Gemini models (${version}):`, models.map((model) => model.name));

      const supportedModel = models.find((model) => {
        const methods = Array.isArray(model.supportedGenerationMethods)
          ? model.supportedGenerationMethods
          : [];

        return (
          methods.includes("generateContent") &&
          typeof model.name === "string" &&
          !model.name.includes("embedding")
        );
      });

      if (supportedModel?.name) {
        return {
          apiVersion: version,
          modelName: supportedModel.name
        };
      }
    } catch (error) {
      console.error(
        `Failed to list Gemini models on ${version}:`,
        error.response?.data || error.message
      );
    }
  }

  return null;
}

async function generateQuestions(text) {
  try {
    if (!text || typeof text !== "string") {
      return [];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return [];
    }

    const prompt = `
You are a question generation assistant.
From the provided study text, generate between 20 and 30 high-quality questions in total.
Cover the entire text thoroughly with:
- MCQs
- fill in the blanks
- short answer questions
- true/false questions

Return ONLY valid JSON in this exact array object format:
[
  { "type": "mcq", "question": "", "options": [], "answer": "" },
  { "type": "fill", "question": "", "answer": "" },
  { "type": "short", "question": "", "answer": "" },
  { "type": "truefalse", "question": "", "options": ["True", "False"], "answer": "" }
]

Rules:
- Do not include markdown, explanation, or extra text.
- For MCQ, include exactly 4 options.
- For true/false, options must be exactly ["True", "False"] and answer must be either "True" or "False".
- Keep questions concise and clear.

Study text:
${text}
`;

    const supportedModel = await getSupportedGenerateModel(apiKey);
    if (!supportedModel) {
      console.error("No Gemini model supporting generateContent was found.");
      return [];
    }

    const { apiVersion, modelName } = supportedModel;
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/${modelName}:generateContent?key=${apiKey}`;

    console.log(`Using Gemini model: ${modelName} (${apiVersion})`);

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log(`Gemini API response (${modelName}):`, response.data);
    const rawOutput = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawOutput) {
      console.error("Gemini returned no text output.");
      return [];
    }

    const cleaned = rawOutput
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", parseError.message);
      return cleaned;
    }
  } catch (error) {
    console.error(
      "Question generation failed:",
      error.response?.data || error.message
    );
    return [];
  }
}

module.exports = {
  generateQuestions
};
