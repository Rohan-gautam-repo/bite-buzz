export default function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-6 md:p-8 bg-gray-100 rounded-2xl shadow-md border border-gray-200"
        >
          {/* Emoji placeholder */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full mb-3 md:mb-4"></div>
          
          {/* Name placeholder */}
          <div className="h-5 md:h-6 bg-gray-300 rounded w-24 md:w-32"></div>
        </div>
      ))}
    </div>
  );
}
