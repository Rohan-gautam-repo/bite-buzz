"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  destination?: string;
  label?: string;
}

export default function BackButton({ destination, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (destination) {
      router.push(destination);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-20 left-4 z-40 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group border border-gray-200"
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="font-medium text-sm sm:text-base">{label}</span>
    </button>
  );
}
