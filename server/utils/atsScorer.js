import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import fetch from "node-fetch";


const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const HUGGINGFACE_API_TOKEN = "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";


const embedText = async (source, target) => {
  const response = await fetch(HUGGINGFACE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        source_sentence: source,
        sentences: [target]
      }
    }),
  });


  const result = await response.json();


  if (!Array.isArray(result) || typeof result[0] !== "number") {
    throw new Error("Embedding failed. Response: " + JSON.stringify(result));
  }


  return result[0]; // This is the cosine similarity directly
};


export const scoreResumeAgainstJob = async (resumePath, jobDescription) => {
  try {
    const absolutePath = path.join(process.cwd(), resumePath);
    const buffer = await fs.readFile(absolutePath);
    const { text: resumeText } = await pdfParse(buffer);


    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error("Resume content too short.");
    }


    const similarity = await embedText(resumeText, jobDescription);
    return Math.round(similarity * 100); // Convert to percentage
  } catch (err) {
    console.error("❌ ATS Scoring Error:", err);
    return 0;
  }
};





