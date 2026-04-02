import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { UploadCloud } from "lucide-react";
import { BASE_URL } from "../../utils/apiPaths";

const BookDetailsTab = ({
  book,
  onBookChange,
  onCoverUpload,
  isUploading,
  fileInputRef,
  onGenerateCover,
  isGeneratingCover,
}) => {
 const coverImageUrl = book.coverImage
  ? book.coverImage
  : null;
    // ? book.coverImage 
    // : `${BASE_URL}/backend${book.coverImage}`.replace(/\\/g, '/');

  return <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Book Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Title" name="title" value={book.title} onChange={onBookChange} />
          <InputField label="Author" name="author" value={book.author} onChange={onBookChange} />
          <div className="md:col-span-2">
            <InputField label="Subtitle" name="subtitle" value={book.subtitle || ''} onChange={onBookChange} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cover Image</h3>
        <div className="flex items-start gap-6">
          
          {/* Cover Preview */}
        {coverImageUrl ? (
            <img src={coverImageUrl} alt="Cover" 
            className="w-32 h-48 object-cover rounded-lg border flex-shrink-0" />
                  ) : (
          <div className="w-32 h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-3xl mb-2">📖</span>
              <span className="text-xs text-slate-400 text-center px-2">No cover yet</span>
            </div>

          )}
          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-500">Upload a new cover image. Recommended size: 600x800px.</p>
            
            <input type="file" ref={fileInputRef} onChange={onCoverUpload} className="hidden" accept="image/*" />
            <Button variant="secondary" onClick={() => fileInputRef.current.click()} isLoading={isUploading} icon={UploadCloud}>
              Upload Your Cover
            </Button>
          {/* AI Generate Button */}
            <button
              onClick={onGenerateCover}
              disabled={isGeneratingCover}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-3"
            >
              <span>✨</span>
              {isGeneratingCover ? "Generating Cover..." : "Generate AI Cover"}
            </button>

            {/* {coverImageUrl && (
              <p className="text-xs text-green-600 font-medium">
                Cover saved to Cloudinary
              </p>
            )} */}

          </div>
        </div>
      </div>
    </div>
};

export default BookDetailsTab;
