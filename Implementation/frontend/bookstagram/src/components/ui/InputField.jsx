import React from 'react'

const InputField = ({
  icon: Icon, label, name, ...props
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 ml-1">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {/* Icon color changes slightly when the parent is focused */}
            <Icon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
          </div>
        )}
        <input
          id={name}
          name={name}
          {...props}
          className={`w-full h-12 px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-all duration-200
            /* Using your Fuchsia theme for the focus state */
            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white
            ${Icon ? "pl-11" : ""}
          `}
        />
      </div>
    </div>
  )
}

export default InputField