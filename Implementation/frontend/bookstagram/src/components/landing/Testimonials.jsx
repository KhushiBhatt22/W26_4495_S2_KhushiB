import React from 'react'
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../utils/data'

const Testimonials = () => {
  return (
     <div id='testimonials' className="relative py-24 lg:py-32 bg-gradient-to-br from-fuchsia-50 via-orange-50 to-white overflow-hidden">
      {/* Decorative Elements - Swapped to Fuchsia and Orange */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-fuchsia-100 shadow-sm">
            {/* Swapped to Primary color */}
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-fuchsia-900">Testimonials</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Loved by Creators
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Everywhere
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our users have to say about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 hover:border-fuchsia-200 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Quote Icon - Using Primary to Secondary Gradient */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-6 group-hover:rotate-12 transition-transform duration-300">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating Stars - Primary color */}
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-primary fill-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-8 leading-relaxed text-base italic">
                "{testimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur opacity-30"></div>
                  <img
                    className="relative w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-lg"
                    src={testimonial.avatar}
                    alt={testimonial.author}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-base">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.title}</p>
                </div>
              </div>

              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/0 to-orange-50/0 group-hover:from-fuchsia-50/50 group-hover:to-orange-50/30 rounded-3xl transition-all duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* Bottom Stats - Adding subtle color pops to the numbers */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-gray-100 pt-16">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-primary mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Happy Creators</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-secondary mb-2">4.9/5</div>
            <div className="text-gray-600 font-medium">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-accent mb-2">100K+</div>
            <div className="text-gray-600 font-medium">Ebooks Created</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testimonials