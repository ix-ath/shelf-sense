import { GoogleGenerativeAI } from "@google/generative-ai";
import { SubstituteRecommendation } from "../types";

// Initialize Gemini Client
// @ts-ignore
const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);

const SCHEMA_DEFINITION = {
  type: "OBJECT",
  properties: {
    matchType: {
      type: "STRING",
      enum: ["EXACT_MATCH", "SUBSTITUTE", "FUNCTIONAL_ALTERNATIVE", "WRONG_AISLE"],
      description: "Classify the result."
    },
    productName: {
      type: "STRING",
      description: "The EXACT brand and product name. Include quantity if multiple needed (e.g. '3x BrandX Cake Mix').",
    },
    locationDescription: {
      type: "STRING",
      description: "Precise location (e.g. 'Top shelf, 2nd from left').",
    },
    matchScore: {
      type: "NUMBER",
      description: "Score 0-100.",
    },
    reasoning: {
      type: "STRING",
      description: "Brief explanation of why this is the best match.",
    },
    healthHighlights: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Top 3 health benefits.",
    },
    nutritionalComparison: {
      type: "STRING",
      description: "Concise nutrient comparison.",
    },
    visualCues: {
      type: "OBJECT",
      properties: {
        color: { type: "STRING", description: "Dominant color." },
        labelDetails: { type: "STRING", description: "Key text/logo." },
        shelfPosition: { type: "STRING", description: "e.g. 'Eye Level'." },
      },
      required: ["color", "labelDetails", "shelfPosition"],
    },
    boundingBox: {
      type: "OBJECT",
      description: "Bounding box of the product.",
      properties: {
        ymin: { type: "NUMBER" },
        xmin: { type: "NUMBER" },
        ymax: { type: "NUMBER" },
        xmax: { type: "NUMBER" },
      },
      required: ["ymin", "xmin", "ymax", "xmax"]
    },
    detectedItemCount: {
      type: "INTEGER",
      description: "Total visible items on the shelf."
    },
    otherCandidates: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          reasonExcluded: { type: "STRING" }
        },
        required: ["name", "reasonExcluded"]
      },
      description: "Up to 3 alternatives rejected."
    },
    supplementaryItems: {
      type: "ARRAY",
      description: "Up to 3 supplementary items (e.g. frosting for cake).",
      items: {
        type: "OBJECT",
        properties: {
          productName: { type: "STRING" },
          reasoning: { type: "STRING" },
          locationDescription: { type: "STRING" },
          visualCues: {
             type: "OBJECT",
             properties: {
                color: { type: "STRING" },
                labelDetails: { type: "STRING" },
                shelfPosition: { type: "STRING" },
             },
             required: ["color", "labelDetails", "shelfPosition"]
          },
          boundingBox: {
            type: "OBJECT",
            properties: {
                ymin: { type: "NUMBER" },
                xmin: { type: "NUMBER" },
                ymax: { type: "NUMBER" },
                xmax: { type: "NUMBER" },
            },
            required: ["ymin", "xmin", "ymax", "xmax"]
          }
        },
        required: ["productName", "reasoning", "locationDescription", "visualCues", "boundingBox"]
      }
    }
  },
  required: ["matchType", "productName", "locationDescription", "matchScore", "reasoning", "healthHighlights", "nutritionalComparison", "visualCues", "detectedItemCount", "otherCandidates"],
};

export async function analyzeShelfImage(
  imageBase64: string,
  userQuery: string,
  userProfileTags: string[]
): Promise<SubstituteRecommendation> {
  const modelName = "gemini-2.5-flash"; 

  const prompt = `
    Request: "${userQuery}". 
    Dietary Profile: ${userProfileTags.length > 0 ? userProfileTags.join(", ") : "None"}.

    Perform a rapid but deep visual analysis of the shelf.

    CRITICAL INSTRUCTIONS:
    1. **SMART COUNTING**: Estimate the total visible items accurately. If the shelf is dense, ensure the count reflects that (e.g. 50+ items).
    2. **QUANTITY LOGIC**: If the user asks for a quantity (e.g. "for 30 people"), you MUST calculate how many units are needed. 
       - If one item serves 12, recommend "3 boxes of [Product]".
       - Prioritize "Family Size" or "Bulk" packs for large requests.
    3. **READING**: Identify product names and "Serves X" text on labels.
    4. **DIETARY PRIORITY**: Strictly filter by the Dietary Profile.
    5. **OUTPUT**: Return ONLY raw JSON. Do NOT use markdown code blocks.

    Schema:
    ${JSON.stringify(SCHEMA_DEFINITION)}
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              text: prompt,
            },
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Increased significantly to prevent truncation
      }
    });

    const response = await result.response;
    let textResponse = response.text();
    
    if (!textResponse) throw new Error("No response from AI");

    // Clean markdown and potential whitespace
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    // Robust extraction: Find the first '{' and last '}' to handle any conversational preamble
    const jsonStartIndex = textResponse.indexOf('{');
    const jsonEndIndex = textResponse.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        textResponse = textResponse.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    const data = JSON.parse(textResponse) as SubstituteRecommendation;

    // @ts-ignore
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web !== undefined && web !== null) as { uri: string; title: string }[];
      data.verifiedSources = sources;
    }

    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the shelf. Please try again.");
  }
}