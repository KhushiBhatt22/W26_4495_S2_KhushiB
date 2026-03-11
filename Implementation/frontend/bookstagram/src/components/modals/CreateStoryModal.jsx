import {useState} from "react";
import{X} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CreateStoryModal = ({isOpen, onClose}) => {

    const [prompt, setPrompt] = useState("");
    const [style, setStyle] = useState("cartoon");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

 if(!isOpen) return null;
    
    //Handle generate AI
    const handleGenerate = async () => {
  if (!prompt.trim()) return toast.error("Please enter a prompt!");

  try {
    setIsGenerating(true);
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_STORY_IMAGE, {
      prompt,
      style,
    });
    setGeneratedImage(response.data.imageUrl);
  } catch (error) {
    toast.error("Failed to generate image!");
  } finally {
    setIsGenerating(false);
  }
};
    //Handle save
    const handleSave = async () => {
        try {
          await axiosInstance.post(API_PATHS.STORIES.CREATE_STORY, {
            imageUrl: generatedImage,
            prompt,
            style,
          });
          toast.success("Story saved successfully!");
          onClose();
        } catch (error) {
          toast.error("Failed to save story!");
        }
      };

 return(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">

       {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Create New Story</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Your Prompt</label>
          <textarea
            rows={3}
            placeholder="e.g. A cat wearing a wizard hat..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="mb-6">
        <label className="text-sm font-medium text-slate-700 mb-2 block">Art Style</label>
        <div className="grid grid-cols-2 gap-2">
          {["cartoon", "sketch", "storyboard", "colorful"].map((s) => (
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
        {isGenerating ? "Generating..." : " Generate Story"}
      </button>
      
      
      {generatedImage && (
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl border border-pink-400 text-pink-500 font-semibold text-sm hover:bg-pink-50 transition-colors mt-3"
          >
            Save Story
          </button>
        )}

        
      </div>
    </div>
 );

};

export default CreateStoryModal;