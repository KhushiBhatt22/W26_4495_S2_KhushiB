import {useState} from "react";
import{X} from "lucide-react";

const CreateStoryModal = ({isOpen, onClose}) => {
 if(!isOpen) return null;

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

        <p className="text-slate-400 text-sm">Form coming next...</p>

      </div>
    </div>
 );

};

export default CreateStoryModal;