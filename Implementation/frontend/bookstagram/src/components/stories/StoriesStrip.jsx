import { useRef, useState, useEffect } from "react";
import { Plus, X, Clock, Camera } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hours ago`;
};

export const STYLE_GRADIENTS = {
  cartoon: "from-pink-500 via-fuchsia-500 to-purple-600",
  sketch: "from-slate-400 via-zinc-500 to-gray-600",
  storyboard: "from-amber-400 via-orange-500 to-red-500",
  colorful: "from-cyan-400 via-teal-400 to-emerald-500",
};

const AVATAR_COLORS = [
  "bg-rose-400", "bg-fuchsia-500", "bg-violet-500",
  "bg-blue-500", "bg-teal-500", "bg-amber-500",
];

export const avatarColor = (name = "") => {
  const code = [...(name || "A")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

export const initials = (name = "") =>
  name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// ─── Skeletons ───────────────────────────────────────────────────────────────
export const StoryBubbleSkeleton = () => (
  <div className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
    <div className="w-[62px] h-[62px] rounded-full bg-slate-200" />
    <div className="h-2.5 w-12 rounded bg-slate-200" />
  </div>
);

// ─── Story Components ────────────────────────────────────────────────────────
export const StoryBubble = ({ story, isViewed, onClick }) => {
  const gradient = STYLE_GRADIENTS[story.style] || STYLE_GRADIENTS.cartoon;
  const name = story.user?.name || "User";
  const color = avatarColor(name);

  return (
    <button
      onClick={() => onClick(story)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
    >
      <div className={`p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 ${isViewed ? "bg-slate-300" : `bg-gradient-to-tr ${gradient}`}`}>
        <div className="p-[2.5px] bg-white rounded-full">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
            {story.imageUrl ? (
              <img src={story.imageUrl} alt={story.prompt} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${color}`}>
                <span className="text-white text-sm font-bold">{initials(name)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="text-[11px] text-slate-600 font-medium w-16 text-center truncate leading-tight">
        {name.split(" ")[0]}
      </span>
    </button>
  );
};

export const AddStoryBubble = ({ user, onClick }) => {
  const color = avatarColor(user?.name || "");
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none">
      <div className="relative">
        <div className="w-[62px] h-[62px] rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 group-hover:border-slate-300 transition-colors">
          {user?.avatar ? (
            <img
              src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:8000${user.avatar}`}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${color}`}>
              <span className="text-white font-bold text-base">{initials(user?.name)}</span>
            </div>
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <Plus className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      </div>
      <span className="text-[11px] text-slate-600 font-medium">Your Story</span>
    </button>
  );
};

export const StoriesStrip = ({ stories, isLoading, user, onStoryClick, viewedIds, onAddClick }) => {
  const scrollRef = useRef(null);
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div ref={scrollRef} className="flex items-start gap-5 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <AddStoryBubble user={user} onClick={onAddClick} />
          <div className="w-px self-stretch bg-slate-100 flex-shrink-0 my-0.5" />
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => <StoryBubbleSkeleton key={i} />)
          ) : stories.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm self-center py-2">
              <Camera className="w-4 h-4 flex-shrink-0" />
              <span>No stories yet</span>
            </div>
          ) : (
            stories.map((story) => (
              <StoryBubble key={story._id} story={story} isViewed={viewedIds.has(story._id)} onClick={onStoryClick} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const StoryViewer = ({ story, stories, onClose, onViewed }) => {
  const [index, setIndex] = useState(stories.findIndex((s) => s._id === story._id));
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const DURATION = 5000;
  const current = stories[index];

  useEffect(() => { if (current) onViewed(current._id); }, [index]);

  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { handleNext(); return 0; }
        return p + (100 / (DURATION / 100));
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [index]);

  const handleNext = () => { if (index < stories.length - 1) setIndex((i) => i + 1); else onClose(); };
  const handlePrev = () => { if (index > 0) setIndex((i) => i - 1); };

  if (!current) return null;
  const name = current.user?.name || "User";
  const color = avatarColor(name);
  const gradient = STYLE_GRADIENTS[current.style] || STYLE_GRADIENTS.cartoon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      {index > 0 && (
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-20">‹</button>
      )}
      <div className="relative w-[360px] rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: "9/16", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
          {stories.map((s, i) => (
            <div key={s._id} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }} />
            </div>
          ))}
        </div>
        <div className="absolute top-8 inset-x-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${gradient}`}>
              <div className="p-[1.5px] bg-black rounded-full">
                <div className={`w-8 h-8 rounded-full overflow-hidden ${color} flex items-center justify-center`}>
                  {current.user?.avatar ? <img src={current.user.avatar} className="w-full h-full object-cover" alt={name} /> : <span className="text-white text-xs font-bold">{initials(name)}</span>}
                </div>
              </div>
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none">{name.split(" ")[0]}</p>
              <p className="text-white/50 text-[10px] flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(current.createdAt)} ago</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"><X className="w-4 h-4 text-white" /></button>
        </div>
        <img src={current.imageUrl} alt={current.prompt} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pt-12 pb-5">
          <p className="text-white text-sm leading-relaxed line-clamp-3">{current.prompt}</p>
        </div>
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </div>
      {index < stories.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-20">›</button>
      )}
    </div>
  );
};