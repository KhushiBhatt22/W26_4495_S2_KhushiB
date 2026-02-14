const { GoogleGenAI } = require("@google/genai");

// Initialize the Google AI with your API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate a book outline
// @route   POST /api/ai/generate-outline
// @access  Private
const generateOutline = async (req, res) => {
  try {
    const { topic, style, numChapters, description } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Please provide a topic" });
    }

    // Using gemini-1.5-flash for stability and speed
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert book outline generator. Create a comprehensive book outline based on the following requirements:

Topic: "${topic}"
${description ? `Description: ${description}` : ""}
Writing Style: ${style}
Number of Chapters: ${numChapters || 5}

Requirements:
1. Generate exactly ${numChapters || 5} chapters
2. Each chapter title should be clear and engaging
3. Each chapter description should be 2-3 sentences
4. Return ONLY a valid JSON array.

Format:
[
  { "title": "Chapter 1: ...", "description": "..." },
  { "title": "Chapter 2: ...", "description": "..." }
]`;

    // Correct API call for @google/genai ^1.40.0
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // Call as a function

    // Extract JSON array from the response string
    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      console.error("AI Response missing JSON:", text);
      return res.status(500).json({ message: "AI failed to format the outline correctly." });
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    const outline = JSON.parse(jsonString);

    res.status(200).json({ outline });
  } catch (error) {
    console.error("Error generating outline:", error);
    res.status(500).json({ 
      message: "Server error during AI outline generation",
      error: error.message 
    });
  }
};

// @desc    Generate content for a chapter
// @route   POST /api/ai/generate-chapter-content
// @access  Private
const generateChapterContent = async (req, res) => {
  try {
    const { chapterTitle, chapterDescription, style } = req.body;

    if (!chapterTitle) {
      return res.status(400).json({ message: "Please provide a chapter title" });
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert writer in ${style} style. Write a complete, detailed chapter for:
Title: "${chapterTitle}"
Description: ${chapterDescription}
Write in plain text without markdown formatting. Aim for depth and engagement.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.status(200).json({ content: response.text() });
  } catch (error) {
    console.error("Error generating chapter:", error);
    res.status(500).json({ 
      message: "Server error during AI chapter generation",
      error: error.message 
    });
  }
};

// @desc    Generate prompt for Story Images (Bookstagram Feature)
// @route   POST /api/ai/generate-story
// @access  Private
const generateStoryImagePrompt = async (req, res) => {
  try {
    const { userPrompt, style } = req.body;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // This logic creates a highly descriptive prompt for an image generator
    const prompt = `Create a detailed image description for a ${style} illustration. 
    Subject: ${userPrompt}. 
    Style details: ${style === 'cartoon' ? 'vibrant colors, 3D render style' : 'minimalist pencil sketch, storyboard style'}. 
    Format: 9:16 vertical aspect ratio. 
    Return only the descriptive prompt text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.status(200).json({ imagePrompt: response.text() });
  } catch (error) {
    res.status(500).json({ message: "Error generating story prompt" });
  }
};

module.exports = {
  generateOutline,
  generateChapterContent,
  generateStoryImagePrompt
};