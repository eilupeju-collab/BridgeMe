import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, UserRole, SkillCategory } from "../types";

// Initialize the Gemini AI client
// NOTE: In a real production app, ensure API_KEY is set in environment variables.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateSmartMatch = async (userBio: string, userNeeds: string, existingUsers: UserProfile[] = []): Promise<{ match: UserProfile, reason: string } | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return null;
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Act as an advanced matchmaking algorithm for 'BridgeMe', an intergenerational skill-sharing app.
      
      My Profile (The User):
      - Bio: "${userBio}"
      - Needs Help With: "${userNeeds}"
      
      Candidate Database (Existing Users):
      ${JSON.stringify(existingUsers.map(u => ({ id: u.id, name: u.name, role: u.role, offers: u.offers, needs: u.needs, bio: u.bio })))}
      
      GOAL: Find the PERFECT connection.
      
      CRITERIA:
      1. SKILL MATCH: The match MUST offer what I need.
      2. GENERATION GAP: Ideally connect different generations (e.g. Gen Z <-> Boomer) for cultural exchange.
      3. PERSONALITY: Bio should suggest compatibility.
      
      INSTRUCTIONS:
      - First, check the Candidate Database. If a user fits the criteria well (>80% match), return their profile JSON exactly as is (maintaining their ID).
      - If NO existing candidate is a good match, GENERATE a new fictional user profile that perfectly satisfies the criteria.
      - Provide a 'reason' string explaining clearly WHY this person is a good match.
      
      Return ONLY the JSON object with keys 'match' (UserProfile) and 'reason' (string).
      Use standard enum values for roles (Gen Z, Millennial, Gen X, Boomer, Silent Gen) and skills.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    age: { type: Type.INTEGER },
                    role: { type: Type.STRING, enum: Object.values(UserRole) },
                    location: { type: Type.STRING },
                    avatar: { type: Type.STRING },
                    offers: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING, enum: Object.values(SkillCategory) } 
                    },
                    needs: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING, enum: Object.values(SkillCategory) } 
                    },
                    bio: { type: Type.STRING },
                    isPremium: { type: Type.BOOLEAN }
                }
            },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      let matchProfile = data.match as UserProfile;
      const reason = data.reason;
      
      // Check if it's an existing user to preserve their original avatar/data integrity
      const existingUser = existingUsers.find(u => u.id === matchProfile.id);
      if (existingUser) {
          matchProfile = existingUser;
      } else {
          // If it's a generated user, ensure it has a valid avatar
          if (!matchProfile.avatar || matchProfile.avatar.length < 10 || matchProfile.avatar.includes('placeholder')) {
               matchProfile.avatar = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;
          }
      }
      return { match: matchProfile, reason };
    }
    return null;

  } catch (error) {
    console.error("Gemini Match Error:", error);
    return null;
  }
};

export const translateMessage = async (text: string, targetLang: string = "English"): Promise<string> => {
  if (!apiKey) return "Simulation: Translation unavailable without API Key.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following text to ${targetLang}. Only return the translated text, nothing else. Text: "${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const getConversationStarters = async (context: string): Promise<string[]> => {
    if (!apiKey) return ["Tell me about your day.", "What is your favorite food?", "How is the weather?"];

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 distinct, engaging, and friendly conversation starters for a user to send to a person described as: "${context}". The messages should be personal, relevant to their profile/interests, and invite response. Return ONLY a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (e) {
        console.error("Conversation Starters Error:", e);
        return ["Hello!", "Nice to meet you.", "I'd love to connect!"];
    }
}

export const generateAvatar = async (prompt: string): Promise<string | null> => {
    if (!apiKey) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [{ text: `Generate a creative, high-quality avatar image based on: ${prompt}.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Avatar Gen Error:", e);
        return null;
    }
}

export const generateItemShowcaseVideo = async (imageBase64: string, title: string, description: string): Promise<string | null> => {
    try {
        const win = window as any;
        // 1. API Key Selection for Paid Model (Veo)
        if (win.aistudio && win.aistudio.hasSelectedApiKey) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await win.aistudio.openSelectKey();
            }
        }

        // Re-initialize AI with the potentially newly selected key
        const userAi = new GoogleGenAI({ apiKey: process.env.API_KEY || apiKey });

        // Extract raw base64 data (remove data:image/xxx;base64, prefix)
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));

        // 2. Start Video Generation
        let operation = await userAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Cinematic product showcase video of ${title}. ${description}. Professional lighting, 4k, slow motion pan, highly detailed.`,
            image: {
                imageBytes: base64Data,
                mimeType: mimeType
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '1:1' // Matching our square item images
            }
        });

        // 3. Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
            operation = await userAi.operations.getVideosOperation({ operation: operation });
        }

        // 4. Retrieve Video URI
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            // Append API key for access
            return `${downloadLink}&key=${process.env.API_KEY || apiKey}`;
        }
        
        return null;

    } catch (error: any) {
        console.error("Veo Video Gen Error:", error);
        if (error.message?.includes("Requested entity was not found")) {
            // Prompt user to re-select key if invalid
            const win = window as any;
            if (win.aistudio) await win.aistudio.openSelectKey();
        }
        return null;
    }
};