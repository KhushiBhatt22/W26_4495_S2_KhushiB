import React from "react";
import { FEATURES } from "../../utils/data";

const Features = () => {
  return (
    <div
      id="features"
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Updated Background Pattern with warmer tones */}
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-50/50 via-transparent to-orange-50/50"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="text-center mb-20 space-y-4">
          {/* Badge: Swapped Violet for Fuchsia */}
          <div className="inline-flex items-center space-x-2 bg-fuchsia-100 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-fuchsia-900">
              Features
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Everything You Need to
            {/* Swapped Gradient to Fuchsia -> Orange */}
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create Your Ebook
            </span>
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Our platform is packed with powerful features to help you write,
            design, and publish your ebook effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-fuchsia-200 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/10 hover:-translate-y-1"
              >
                {/* Subtle Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/0 to-orange-50/0 group-hover:from-fuchsia-50/50 group-hover:to-orange-50/30 rounded-2xl transition-all duration-300"></div>

                <div className="relative space-y-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    {/* Hover text color change to Primary (Fuchsia) */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-primary text-sm font-medium inline-flex items-center">
                      Learn more
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Ready to get started?</p>
          {/* Main CTA: Swapped to Pink/Orange Gradient */}
          <a
            href="/signup"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-105 transition-all duration-200"
          >
            <span>Start Creating Today</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Features;