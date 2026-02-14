'use client';

import { useState } from 'react';
import { Hotel } from '../types/hotel';
import Image from 'next/image';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const currency = '₦';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col p-2">
      {/* Image Slider */}
      <div className="relative rounded-lg overflow-hidden group">
        {/* Sale Badge */}
        {hotel.sale && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              {hotel.sale}
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-200">
          <Image
            src={hotel.images[currentImageIndex]}
            alt={hotel.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Navigation Arrows */}
        {hotel.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-zinc-700"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-zinc-700"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="px-3 py-4 flex-1 flex flex-col">
        {/* Rating and Bookmark */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1 bg-zinc-900 dark:bg-zinc-800 text-white px-3 py-1.5 rounded-md">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{hotel.rating}</span>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="text-xl hover:scale-110 transition-transform"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <span className="text-red-500">♥</span>
            ) : (
              <span className="text-gray-400">♡</span>
            )}
          </button>
        </div>

        {/* Hotel Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <a href={`/hotels/${hotel.id}`}>{hotel.name}</a>
        </h3>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          {hotel.feature.map((feature, idx) => (
            <span key={idx} className="flex items-center">
              {feature}
              {idx < hotel.feature.length - 1 && <span className="ml-2">•</span>}
            </span>
          ))}
        </div>

        {/* Footer - Price and CTA */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-zinc-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                ₦{hotel.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/day</span>
              {hotel.sale && (
                <span className="text-sm text-gray-400 line-through">₦{(hotel.price * 1.25).toLocaleString()}</span>
              )}
            </div>

            {/* View Detail Button */}
            <a
              href={`/hotels/${hotel.id}`}
              className="inline-flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              View Detail
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
