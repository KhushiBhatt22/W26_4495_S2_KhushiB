import { useState, useRef } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const STYLES = ["cartoon", "sketch", "storyboard", "colorful"];

const CreateStoryModal = ({ isOpen, onClose }) => {
  // Tab: "prompt" | "avatar"
  const [activeTab, setActiveTab] = useState("prompt");

  // ── Prompt tab state ──────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cartoon");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  // ── Avatar tab state ──────────────────────────────────────────────
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState(null);
  const [avatarStyle, setAvatarStyle] = useState("cartoon");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setPrompt("");
    setStyle("cartoon");
    setGeneratedImage(null);
    setUploadedPhoto(null);
    setUploadedPhotoBase64(null);
    setAvatarStyle("cartoon");
    setGeneratedAvatar(null);
    setAvatarPrompt("");
    setActiveTab("prompt");
    onClose();
  };

  // ── Prompt tab handlers ───────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt!");
    try {
      setIsGenerating(true);
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_STORY_IMAGE, { prompt, style });
      setGeneratedImage(response.data.imageUrl);
    } catch {
      toast.error("Failed to generate image!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await axiosInstance.post(API_PATHS.STORIES.CREATE_STORY, {
        imageUrl: generatedImage,
        prompt,
        style,
      });
      toast.success("Story saved successfully!");
      handleReset();
    } catch {
      toast.error("Failed to save story!");
    }
  };

  // ── Avatar tab handlers ───────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload an image file");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image must be under 5MB");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedPhoto(ev.target.result);
      setUploadedPhotoBase64(ev.target.result);
      setGeneratedAvatar(null); // reset previous avatar
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = async () => {
    if (!uploadedPhotoBase64)
      return toast.error("Please upload a photo first!");
    try {
      setIsGeneratingAvatar(true);
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_AVATAR, {
        imageBase64: uploadedPhotoBase64,
        style: avatarStyle,
      });
      setGeneratedAvatar(response.data.avatarUrl);
    } catch {
      toast.error("Failed to generate avatar!");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSaveAvatarStory = async () => {
    if (!generatedAvatar) return toast.error("Please generate an avatar first!");
    if (!avatarPrompt.trim()) return toast.error("Please write a story prompt!");
    try {
      setIsSavingAvatar(true);
      await axiosInstance.post(API_PATHS.STORIES.CREATE_STORY, {
        imageUrl: generatedAvatar,
        prompt: avatarPrompt,
        style: avatarStyle,
      });
      toast.success("Avatar story saved!");
      handleReset();
    } catch {
      toast.error("Failed to save story!");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-y-auto max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Create New Story</h2>
          <button
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex mx-6 mb-5 bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "prompt"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ✨ From Prompt
          </button>
          <button
            onClick={() => setActiveTab("avatar")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "avatar"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            🧑‍🎨 AI Avatar
          </button>
        </div>

        <div className="px-6 pb-6">

          {/* ══ PROMPT TAB ══ */}
          {activeTab === "prompt" && (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Your Prompt
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. A cat wearing a wizard hat..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Art Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition-colors capitalize ${
                        style === s
                          ? "border-pink-400 text-pink-500 bg-pink-50"
                          : "border-slate-200 text-slate-600 hover:border-pink-400 hover:text-pink-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {generatedImage && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                  <img src={generatedImage} alt="Generated story" className="w-full object-cover" />
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "✨ Generate Story"}
              </button>

              {generatedImage && (
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl border border-pink-400 text-pink-500 font-semibold text-sm hover:bg-pink-50 transition-colors mt-3"
                >
                  Save Story
                </button>
              )}
            </>
          )}

          {/* ══ AVATAR TAB ══ */}
          {activeTab === "avatar" && (
            <>
              {/* Upload Photo */}
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Upload Your Photo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    uploadedPhoto
                      ? "border-pink-300 bg-pink-50"
                      : "border-slate-200 hover:border-pink-300 hover:bg-pink-50"
                  }`}
                  style={{ minHeight: 120 }}
                >
                  {uploadedPhoto ? (
                    <img
                      src={uploadedPhoto}
                      alt="Uploaded"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium">
                        Click to upload a photo
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {uploadedPhoto && (
                  <button
                    onClick={() => {
                      setUploadedPhoto(null);
                      setUploadedPhotoBase64(null);
                      setGeneratedAvatar(null);
                    }}
                    className="text-xs text-slate-400 hover:text-red-400 mt-1 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Avatar Style */}
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Avatar Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setAvatarStyle(s)}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition-colors capitalize ${
                        avatarStyle === s
                          ? "border-pink-400 text-pink-500 bg-pink-50"
                          : "border-slate-200 text-slate-600 hover:border-pink-400 hover:text-pink-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Avatar Button */}
              <button
                onClick={handleGenerateAvatar}
                disabled={isGeneratingAvatar || !uploadedPhoto}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mb-4"
              >
                {isGeneratingAvatar ? "Generating Avatar..." : "🧑‍🎨 Generate Avatar"}
              </button>

              {/* Generated Avatar Preview */}
              {generatedAvatar && (
                <>
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={generatedAvatar}
                      alt="Generated avatar"
                      className="w-full object-cover"
                    />
                  </div>

                  {/* Story Prompt */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      Write Your Story Prompt
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. My avatar going on a magical adventure..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                      value={avatarPrompt}
                      onChange={(e) => setAvatarPrompt(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleSaveAvatarStory}
                    disabled={isSavingAvatar}
                    className="w-full py-3 rounded-xl border border-pink-400 text-pink-500 font-semibold text-sm hover:bg-pink-50 transition-colors disabled:opacity-50"
                  >
                    {isSavingAvatar ? "Saving..." : "Save Avatar Story"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;