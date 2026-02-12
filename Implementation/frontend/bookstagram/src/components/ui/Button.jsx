import React from 'react'

const Button = ({variant = "primary", size = "md", isLoading = false, children, icon: Icon, className = "", ...props}) => {

  const variants = {
    /* Updated to use your Playful Pastel fuchsia-to-orange gradient */
    primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95",
    
    /* Using your secondary orange for a lighter variant */
    secondary: "bg-orange-50 hover:bg-orange-100 text-secondary border border-orange-100",
    
    /* Soft fuchsia for ghost buttons */
    ghost: "bg-transparent hover:bg-fuchsia-50 text-primary",
    
    danger: "bg-transparent hover:bg-red-50 text-red-600 border border-transparent hover:border-red-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8 rounded-lg",
    md: "px-5 py-2.5 text-sm h-11 rounded-xl", // Increased padding slightly for a "social" feel
    lg: "px-8 py-4 text-base h-14 rounded-2xl" // Larger for Hero CTAs
  };

  return (
     <button
      /* focus:ring updated to primary (fuchsia) */
      className={`inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />}
          {children}
        </>
      )}
    </button>
  )
}

export default Button