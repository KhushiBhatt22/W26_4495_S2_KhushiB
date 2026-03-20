const { GoogleGenAI } = require("@google/genai");

const { HfInference } = require("@huggingface/inference");
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
//const imageAi = new GoogleGenAI({ apiKey: process.env.GEMINI_IMAGE_API_KEY });

// @desc    Generate a book outline
// @route   POST /api/ai/generate-outline
// @access  Private
const generateOutline = async (req, res) => {
  try {
    const { topic, style, numChapters, description } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Please provide a topic" });
    }

    const prompt = `You are an expert book outline generator. Create a comprehensive book outline based on the following requirements:

Topic: "${topic}"
${description ? `Description: ${description}` : ""}
Writing Style: ${style}
Number of Chapters: ${numChapters || 5}

Requirements:
1. Generate exactly ${numChapters || 5} chapters
2. Each chapter title should be clear, engaging, and follow a logical progression
3. Each chapter description should be 2-3 sentences explaining what the chapter covers
4. Ensure chapters build upon each other coherently
5. Match the "${style}" writing style in your titles and descriptions

Output Format:
Return ONLY a valid JSON array with no additional text, markdown, or formatting. Each object must have exactly two keys: "title" and "description".

Example structure:
[
  {
    "title": "Chapter 1: Introduction to the Topic",
    "description": "A comprehensive overview introducing the main concepts. Sets the foundation for understanding the subject matter."
  },
  {
    "title": "Chapter 2: Core Principles",
    "description": "Explores the fundamental principles and theories. Provides detailed examples and real-world applications."
  }
]

Generate the outline now:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const text = response.text;

    // Find and extract the JSON array from the response text
    const startIndex = text.indexOf("[");
    const endIndex = text.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      console.error("Could not find JSON array in AI response:", text);
      return res
        .status(500)
        .json({ message: "Failed to parse AI response, no JSON array found." });
    }

    const jsonString = text.substring(startIndex, endIndex + 1);

    // Validate if the response is valid JSON
    try {
      const outline = JSON.parse(jsonString);
      res.status(200).json({ outline });
    } catch (e) {
      console.error("Failed to parse AI response:", jsonString);
      res.status(500).json({
        message:
          "Failed to generate a valid outline. The AI response was not valid JSON.",
      });
    }
  } catch (error) {
    console.error("Error generating outline:", error);
    res
      .status(500)
      .json({ message: "Server error during AI outline generation" });
  }
};

// @desc    Generate content for a chapter
// @route   POST /api/ai/generate-chapter-content
// @access  Private
const generateChapterContent = async (req, res) => {
  try {
    const { chapterTitle, chapterDescription, style } = req.body;

    if (!chapterTitle) {
      return res
        .status(400)
        .json({ message: "Please provide a chapter title" });
    }

   const prompt = `You are an expert writer specializing in ${style} content. Write a complete chapter for a book with the following specifications:

Chapter Title: "${chapterTitle}"
${chapterDescription ? `Chapter Description: ${chapterDescription}` : ''}
Writing Style: ${style}
Target Length: Comprehensive and detailed (aim for 1500-2500 words)

Requirements:
1. Write in a ${style.toLowerCase()} tone throughout the chapter
2. Structure the content with clear sections and smooth transitions
3. Include relevant examples, explanations, or anecdotes as appropriate for the style
4. Ensure the content flows logically from introduction to conclusion
5. Make the content engaging and valuable to readers
${chapterDescription ? '6. Cover all points mentioned in the chapter description' : ''}

Format Guidelines:
- Start with a compelling opening paragraph
- Use clear paragraph breaks for readability
- Include subheadings if appropriate for the content length
- End with a strong conclusion or transition to the next chapter
- Write in plain text without markdown formatting

Begin writing the chapter content now:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    res.status(200).json({ content: response.text });
  } catch (error) {
    console.error("Error generating chapter:", error);
    res
      .status(500)
      .json({ message: "Server error during AI chapter generation" });
  }
};

// @desc    Generate a story image
// @route   POST /api/ai/generate-story-image
// @access  Private
const generateStoryImage = async (req, res) => {
  try {
    const { prompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Please provide a prompt" });
    }

    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: `Create a ${style || "cartoon"} style illustration: ${prompt}`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");

    res.status(200).json({ imageUrl: `data:image/png;base64,${base64}` });

  } catch (error) {
    console.error("Error generating story image:", error.message);
    res.status(500).json({ message: "Server error during image generation" });
  }
};

// @desc    Complete a chapter that the user has already started writing
// @route   POST /api/ai/complete-chapter-content
// @access  Private
const completeChapterContent = async (req, res) => {
  try {
    const { chapterTitle, chapterDescription, style, existingContent } = req.body;

    if (!chapterTitle) {
      return res.status(400).json({ message: "Please provide a chapter title" });
    }

    if (!existingContent || existingContent.trim().length < 10) {
      return res.status(400).json({
        message: "Please write at least a few lines before using 'Complete with AI'.",
      });
    }

    const prompt = `You are an expert writer specializing in ${style} content. A human author has started writing a chapter and needs you to complete it.

Chapter Title: "${chapterTitle}"
${chapterDescription ? `Chapter Description: ${chapterDescription}` : ""}
Writing Style: ${style}

The human has written the following so far:
---
${existingContent}
---

Your Task:
1. Read what the human wrote — understand their voice, tone, and direction
2. Continue and COMPLETE the chapter seamlessly from where they left off
3. Do NOT repeat what the human already wrote — only add the continuation
4. Match their writing style and tone as closely as possible
5. Aim to bring the total chapter to 1500-2500 words
6. Write in plain text without markdown formatting

Output ONLY the continuation text:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const aiContinuation = response.text;
    const fullContent = `${existingContent.trimEnd()}\n\n${aiContinuation.trimStart()}`;

    res.status(200).json({ content: fullContent });
  } catch (error) {
    console.error("Error completing chapter:", error);
    res.status(500).json({ message: "Server error during AI chapter completion" });
  }
};

module.exports = {
  generateOutline,
  generateChapterContent,
  generateStoryImage,
  completeChapterContent,
};
