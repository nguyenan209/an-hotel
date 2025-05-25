export default function Loading() {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-t-pink-500 border-b-pink-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading booking details...</p>
        </div>
      </div>
    );
  }
  