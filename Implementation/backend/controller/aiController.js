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
 
// @desc    Generate a colorful chapter/book header image
// @route   POST /api/ai/generate-chapter-image
// @access  Private
const generateChapterImage = async (req, res) => {
  try {
    const { title, description, bookTitle } = req.body;
    if (!title) return res.status(400).json({ message: "Please provide a title" });

    const prompt = `Colorful vibrant illustration for a book chapter titled "${title}"${
      bookTitle ? ` from the book "${bookTitle}"` : ""
    }${
      description ? `. Chapter is about: ${description}` : ""
    }. Style: bright colors, professional book illustration, engaging, artistic, high quality header image`;

    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
    });

    // Upload to Cloudinary instead of returning base64
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    const { cloudinary } = require("../config/cloudinary");
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "bookstagram/chapter-images",
      transformation: [{ width: 1200, crop: "limit" }],
    });

    res.status(200).json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Error generating chapter image:", error.message);
    res.status(500).json({ message: "Server error during chapter image generation" });
  }
};

// @desc    Generate an AI book cover image
// @route   POST /api/ai/generate-book-cover
// @access  Private
const generateBookCover = async (req, res) => {
  try {
    const { title, subtitle, style } = req.body;
    if (!title) return res.status(400).json({ message: "Please provide a book title" });

    const stylePrompts = {
      Informative: "professional, clean, modern non-fiction book cover, bold typography style",
      Fiction: "dramatic, cinematic, story-driven fiction book cover, atmospheric lighting",
      Fantasy: "magical, ethereal, fantasy book cover with mystical elements, vibrant colors",
      "Self-Help": "motivational, bright, uplifting self-help book cover, modern design",
      Romance: "warm, elegant, romantic book cover with soft colors and emotional feel",
      Mystery: "dark, suspenseful, noir mystery book cover with dramatic shadows",
      "Sci-Fi": "futuristic, space-age, sci-fi book cover with neon colors and tech elements",
      Historical: "vintage, classic, historical book cover with rich earthy tones",
    };

    const styleDesc = stylePrompts[style] || "professional, colorful, eye-catching book cover";

    const prompt = `${styleDesc} for a book titled "${title}"${
      subtitle ? `, subtitle: "${subtitle}"` : ""
    }. High quality, detailed illustration, suitable as a book cover, portrait orientation, no text overlay`;

    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
    });

    // Upload directly to Cloudinary
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    const { cloudinary } = require("../config/cloudinary");
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "bookstagram/book-covers",
      transformation: [{ width: 600, height: 800, crop: "fill" }],
    });

    res.status(200).json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Error generating book cover:", error.message);
    res.status(500).json({ message: "Server error during book cover generation" });
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

//Adding a photo avatar
// @desc    Generate an AI avatar from uploaded photo
// @route   POST /api/ai/generate-avatar
// @access  Private
const generateAvatar = async (req, res) => {
  try {
    const { imageBase64, style } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "Please provide an image" });
    }

    const stylePrompts = {
      cartoon: "cartoon character avatar, vibrant colors, animated style, Disney-like",
      sketch: "detailed pencil sketch portrait, artistic, black and white, fine lines",
      storyboard: "comic book character, storyboard panel style, dramatic lighting, bold outlines",
      colorful: "pop-art style avatar, bold vivid colors, artistic, Andy Warhol inspired",
    };

    // Use Gemini to describe the uploaded photo first
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const descriptionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: "Describe this person's key physical features in 1-2 sentences: hair color, eye color, face shape, skin tone. Be concise and factual.",
            },
          ],
        },
      ],
    });

    const personDescription = descriptionResponse.text;

    // Now generate avatar using textToImage with the description
    const finalPrompt = `${stylePrompts[style] || stylePrompts.cartoon} of a person with these features: ${personDescription}. High quality, detailed, professional illustration.`;

    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: finalPrompt,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");

    res.status(200).json({ avatarUrl: `data:image/png;base64,${base64}` });

  } catch (error) {
    console.error("Error generating avatar:", error.message);
    res.status(500).json({ message: "Server error during avatar generation" });
  }
};
const improveThread = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const prompt = `You are a social media writing assistant for a book platform called Bookstagram.

A user wrote this post:
"${text}"

Your job:
1. Rewrite it in a more attractive, engaging, and grammatically correct way
2. Keep the same meaning and emotion  
3. Make it sound natural and friendly
4. Suggest 3-5 relevant hashtags

Return ONLY a valid JSON object like this (no extra text):
{
  "improved": "the improved text here",
  "hashtags": ["#BookReview", "#Reading", "#Bookstagram"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const raw = response.text;
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const json = JSON.parse(raw.substring(start, end + 1));
    res.status(200).json(json);
  } catch (error) {
    console.error("improveThread error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
//-------------------EDIT AVATAR
// @desc    Edit avatar with action prompt using Gemini + FLUX
// @route   POST /api/ai/edit-avatar
// @access  Private
const editAvatar = async (req, res) => {
  try {
    const { avatarImageBase64, actionPrompt, style } = req.body;

    if (!avatarImageBase64 || !actionPrompt) {
      return res.status(400).json({ message: "Avatar image and action prompt are required" });
    }

    const styleDescriptions = {
      cartoon: "cartoon style, vibrant colors, Disney-like animation",
      sketch: "pencil sketch style, black and white, fine lines",
      storyboard: "comic book style, bold outlines, graphic novel",
      colorful: "pop-art style, bold vivid colors, colorful illustration",
    };

    // Strip base64 header if present
    const base64Data = avatarImageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Step 1 — Gemini analyzes the avatar and combines with action
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Data,
              },
            },
            {
              text: `This is a ${styleDescriptions[style] || styleDescriptions.cartoon} avatar. 
              Describe this avatar's appearance in detail (hair, eyes, clothing, art style) in 2-3 sentences.
              Then describe them doing this action: "${actionPrompt}".
              Write it as a single image generation prompt. Be specific and vivid.`,
            },
          ],
        },
      ],
    });

    const enrichedPrompt = geminiResponse.text;

    // Step 2 — FLUX generates the scene
    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: `${enrichedPrompt}, high quality, detailed, professional illustration`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");

    res.status(200).json({ editedImageUrl: `data:image/png;base64,${base64}` });

  } catch (error) {
    console.error("Error editing avatar:", error.message);
    res.status(500).json({ message: "Server error during avatar editing" });
  }
};

// @desc    Generate 4-5 images from chapter content and embed between paragraphs
// @route   POST /api/ai/generate-content-images
// @access  Private
const generateContentImages = async (req, res) => {
  try {
    const { content, chapterTitle, bookTitle } = req.body;
    if (!content || content.trim().length < 50) {
      return res.status(400).json({ message: "Chapter needs more content first" });
    }

    // Step 1: Use Gemini to pick 4-5 key visual moments from content
    const geminiPrompt = `You are analyzing a book chapter to find the best moments to illustrate with images.

Chapter: "${chapterTitle}" from "${bookTitle || "the book"}"

Content:
${content.substring(0, 3000)}

Pick exactly 4 key visual moments or scenes from this content that would make great illustrations. For each, give:
1. A short image generation prompt (max 20 words, vivid and visual, no text in image)
2. The paragraph number (1-based) AFTER which this image should appear

Return ONLY valid JSON array, no markdown:
[
  {"prompt": "...", "afterParagraph": 1},
  {"prompt": "...", "afterParagraph": 3},
  {"prompt": "...", "afterParagraph": 5},
  {"prompt": "...", "afterParagraph": 7}
]`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: geminiPrompt,
    });

    let moments;
    try {
      const text = geminiResponse.text;
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      moments = JSON.parse(text.substring(start, end + 1));
    } catch {
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    // Step 2: Split content into paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

    // Step 3: Generate images for each moment
    const { cloudinary } = require("../config/cloudinary");
    const imageResults = [];

    for (const moment of moments.slice(0, 4)) {
      try {
        const blob = await hf.textToImage({
          model: "black-forest-labs/FLUX.1-schnell",
          inputs: `${moment.prompt}, book illustration style, high quality, no text, no words`,
        });
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64 = buffer.toString("base64");
        const dataUri = `data:image/png;base64,${base64}`;
        const upload = await cloudinary.uploader.upload(dataUri, {
          folder: "bookstagram/content-images",
          transformation: [{ width: 900, crop: "limit" }],
        });
        imageResults.push({
          imageUrl: upload.secure_url,
          afterParagraph: moment.afterParagraph,
          prompt: moment.prompt,
        });
      } catch (err) {
        console.error("Image gen failed for moment:", moment.prompt, err.message);
      }
    }

    // Step 4: Embed images into content between paragraphs
    const sortedImages = imageResults.sort((a, b) => a.afterParagraph - b.afterParagraph);
    const resultParagraphs = [...paragraphs];
    let offset = 0;

    for (const img of sortedImages) {
      const insertAt = Math.min(img.afterParagraph - 1 + offset, resultParagraphs.length - 1);
      const markdownImage = `\n\n![${img.prompt}](${img.imageUrl})\n\n`;
      resultParagraphs.splice(insertAt + 1, 0, markdownImage);
      offset++;
    }

    const updatedContent = resultParagraphs.join("\n\n");

    res.status(200).json({
      updatedContent,
      imagesGenerated: imageResults.length,
    });

  } catch (error) {
    console.error("Error generating content images:", error.message);
    res.status(500).json({ message: "Server error during content image generation" });
  }
};

module.exports = {
  generateOutline,
  editAvatar,
  generateChapterContent,
  generateStoryImage,
  generateChapterImage,
  //generateCoverImage,
  generateBookCover,
  generateContentImages,
  completeChapterContent,
  generateAvatar,
  improveThread,
};
