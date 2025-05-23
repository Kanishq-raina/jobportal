// utils/aiFeedback.js
import fetch from "node-fetch";


const HF_API_TOKEN = "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";
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";




const buildPrompt = (resumeText, jobDescription) => `
You are an AI resume evaluator.


Respond in **exactly 3 bullet points**, each one short and to the point:


1. ❌ List missing skills or technologies from the resume compared to the job description.
2. 🔧 Suggest one or two specific improvements to better match the job.
3. ✍️ Give a one-line critique of the resume's tone or writing style.


 






Resume:
${resumeText}


Job Description:
${jobDescription}




Only give 3 bullet points. Prompt should not contain anything besides 3 bullet points.
`;






export const generateAIResumeFeedback = async (resumeText, jobDescription) => {
  try {
    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: buildPrompt(resumeText, jobDescription),
        parameters: {
          max_new_tokens: 900,
          temperature: 0.7
        }
      })
    });


    const result = await response.json();


    if (result?.error) {
      throw new Error(result.error);
    }


    return result[0]?.generated_text || "No feedback generated.";
  } catch (err) {
    console.error("❌ AI Feedback Error:", err.message);
    return "⚠️ Unable to generate AI feedback at the moment.";
  }
};





