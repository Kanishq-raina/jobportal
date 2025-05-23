import axios from "axios";


const HF_API_KEY = "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"; // ⬅️ paste your Hugging Face key here
const HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";


const headers = {
  Authorization: `Bearer ${HF_API_KEY}`,
};


export const getSimilarityScore = async (resumeText, jobText) => {
  try {
    const payload = {
      inputs: {
        source_sentence: resumeText,
        sentences: [jobText],
      },
    };


    const response = await axios.post(HF_API_URL, payload, { headers });
    const score = response.data[0]; // it's a float between 0–1
    return Math.round(score * 100); // convert to percentage
  } catch (err) {
    console.error("❌ HuggingFace API error:", err.response?.data || err.message);
    return 0;
  }
};





