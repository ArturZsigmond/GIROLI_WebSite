"use client";

import { useState, useEffect, useRef } from "react";

interface ProjectShowcaseImage {
  id: string;
  url: string;
}

interface ProjectShowcase {
  id: string;
  title: string;
  description: string;
  category: string;
  images: ProjectShowcaseImage[];
}

export function ProjectShowcaseCard({ showcase }: { showcase: ProjectShowcase }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Continuous auto-play slideshow
  useEffect(() => {
    if (isPaused || showcase.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcase.images.length);
    }, 3000); // Change image every 3 seconds for smoother continuous feel

    return () => clearInterval(interval);
  }, [isPaused, showcase.images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + showcase.images.length) % showcase.images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % showcase.images.length);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  if (!showcase.images || showcase.images.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
        <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-500">
          Fără imagine
        </div>
        <div className="p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-2">{showcase.title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{showcase.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200 group">
      {/* Image Slideshow */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {/* Images Container with Continuous Sliding Animation */}
        <div
          ref={containerRef}
          className="relative w-full h-full flex"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isPaused ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" : "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {showcase.images.map((image, index) => (
            <div
              key={image.id}
              className="min-w-full h-full flex-shrink-0"
            >
              <img
                src={image.url}
                alt={`${showcase.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showcase.images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showcase.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {showcase.images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "bg-blue-700 w-8 h-2"
                    : "bg-white/50 hover:bg-white/70 w-2 h-2"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Pause/Play Button */}
        {showcase.images.length > 1 && (
          <button
            onClick={togglePause}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          >
            {isPaused ? (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
          </button>
        )}

        {/* Image Counter */}
        {showcase.images.length > 1 && (
          <div className="absolute top-4 left-4 bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
            {currentIndex + 1} / {showcase.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-2">{showcase.title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{showcase.description}</p>
      </div>
    </div>
  );
}

