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
      description: "The TOTAL number of product facings visible across the ENTIRE image (often 30-100+ on a full shelf). Count every single visible item, not just relevant ones."
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
  // Use gemini-2.0-flash as a safe, high-performance fallback if 2.5 is causing API path issues,
  // but we will stick to 2.5-flash if available. If 400 persists, 2.0-flash is the stable next-gen.
  const modelName = "gemini-2.5-flash"; 

  const prompt = `
    I am at a grocery store and I have a request: "${userQuery}". 
    My Dietary Profile / Global Preferences: ${userProfileTags.length > 0 ? userProfileTags.join(", ") : "None specified"}.

    Perform a deep visual analysis of the ENTIRE shelf image.

    CRITICAL INSTRUCTION - SCANNING:
    1. **GLOBAL SCAN**: Look at the WHOLE image from edge to edge. Do not focus only on the center. 
    2. **COUNTING**: You are an expert inventory auditor. Your goal is an EXACT count. Count EVERY single product facing visible on the shelves. A typical grocery shelf photo contains 40-100 items. 
       - If you count fewer than 20 items, RE-SCAN the edges and background. You are likely missing items.
       - Count every unique facing, not just rows.
    3. **READING**: Read the text on as many labels as possible to understand the variety available.

    CRITICAL INSTRUCTION - INTERPRETATION:
    1. **Interpret the User Query**: The user might use natural language comparisons. 
       - If they mention a brand ("like Brand X"), they want a *similar* product, not necessarily Brand X.
    2. **Apply Dietary Profile**: Strictly prioritize products that match the Global Preferences.

    Logic Flow:
    1. **Scan & Count**: populate 'detectedItemCount' with the total number of items visible in the image.
    2. **Filter**: Identify products that match the query and dietary profile.
    3. **Select Best**: Choose the single best match.
    4. **Context Check**: If the shelf contains completely unrelated items (e.g. searching for 'Milk' in the 'Detergent' aisle), set matchType to WRONG_AISLE.

    Output Requirements:
    - **Bounding Box**: Required for Primary and Supplementary items.
    - RETURN ONLY RAW JSON. Strictly follow this schema:
    ${JSON.stringify(SCHEMA_DEFINITION, null, 2)}
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
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    let textResponse = response.text();
    
    if (!textResponse) throw new Error("No response from AI");

    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(textResponse) as SubstituteRecommendation;

    // @ts-ignore - groundingMetadata exists on candidate in some versions
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