import { GoogleGenAI } from "@google/genai";
import { SubstituteRecommendation } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      description: "The EXACT brand and product name printed on the package (e.g. 'BrandX Low Sodium Beans').",
    },
    locationDescription: {
      type: "STRING",
      description: "Precise instructions to find it.",
    },
    matchScore: {
      type: "NUMBER",
      description: "A score from 0 to 100 indicating how good of a match this is.",
    },
    reasoning: {
      type: "STRING",
      description: "Why this product was chosen.",
    },
    healthHighlights: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of key health benefits.",
    },
    nutritionalComparison: {
      type: "STRING",
      description: "Compare nutrients to the requested item.",
    },
    visualCues: {
      type: "OBJECT",
      properties: {
        color: { type: "STRING", description: "Dominant packaging color." },
        labelDetails: { type: "STRING", description: "Distinctive text/logo on the label." },
        shelfPosition: { type: "STRING", description: "e.g. 'Top Shelf', 'Eye Level', 'Bottom Shelf'." },
      },
      required: ["color", "labelDetails", "shelfPosition"],
    },
    boundingBox: {
      type: "OBJECT",
      description: "The bounding box of the identified product in the image. REQUIRED if matchType is EXACT_MATCH or SUBSTITUTE.",
      properties: {
        ymin: { type: "NUMBER", description: "Top edge percentage (0-100)" },
        xmin: { type: "NUMBER", description: "Left edge percentage (0-100)" },
        ymax: { type: "NUMBER", description: "Bottom edge percentage (0-100)" },
        xmax: { type: "NUMBER", description: "Right edge percentage (0-100)" },
      },
      required: ["ymin", "xmin", "ymax", "xmax"]
    },
    detectedItemCount: {
      type: "INTEGER",
      description: "Approximate total number of similar/relevant items found on the shelf section."
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
      description: "Top 3 alternative products considered but rejected."
    },
    supplementaryItems: {
      type: "ARRAY",
      description: "If the user's request implies multiple items (e.g. 'birthday cake' -> mix + frosting), list up to 3 supplementary items found on the shelf.",
      items: {
        type: "OBJECT",
        properties: {
          productName: { type: "STRING" },
          reasoning: { type: "STRING", description: "Why is this a good supplement?" },
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
  const model = "gemini-2.5-flash"; 

  const prompt = `
    I am at a grocery store and I have a request: "${userQuery}". 
    My Dietary Profile / Global Preferences: ${userProfileTags.length > 0 ? userProfileTags.join(", ") : "None specified"}.

    Analyze the image of the grocery shelf to find the best match.
    
    CRITICAL INSTRUCTION - INTERPRETATION:
    1. **Interpret the User Query**: The user might use natural language comparisons like "Good like Minute Maid" or "Something spicy". 
       - If they mention a brand ("like Brand X"), they are looking for a product *similar* to Brand X (in type/flavor), NOT literally a product named "Like Brand X".
       - If they search for a specific product name, look for that exact product.
    2. **Apply Dietary Profile**: Strictly prioritize products that match the Global Preferences (e.g. if profile says "Keto", reject high-sugar items even if they match the query name).

    CRITICAL INSTRUCTION - VISION:
    1. **READ VISIBLE TEXT**: Identify text actually printed on packaging. 
    2. **VERIFY**: Use Google Search to verify product names/brands based on visual cues.
    3. **NO HALLUCINATIONS**: Do NOT guess flavors not visible on the label.

    Logic Flow:
    1. **Identify Primary Match**: 
       - Best item matching the *interpreted* query and *dietary profile*.
    2. **Identify Supplementary Items (Optional)**:
       - If the request implies a recipe (e.g. "Cake"), find supplements (Frosting).
    3. **Check Context**: 
       - If the shelf is completely wrong, set matchType to WRONG_AISLE.

    Output Requirements:
    - **Bounding Box**: Required for Primary and Supplementary items.
    - RETURN ONLY RAW JSON. Strictly follow this schema:
    ${JSON.stringify(SCHEMA_DEFINITION, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
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
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    let textResponse = response.text;
    if (!textResponse) throw new Error("No response from AI");

    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(textResponse) as SubstituteRecommendation;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const sources = groundingChunks
        .map(chunk => chunk.web)
        .filter(web => web !== undefined && web !== null) as { uri: string; title: string }[];
      data.verifiedSources = sources;
    }

    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the shelf. Please try again.");
  }
}