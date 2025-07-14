export const metadata = {
  title: "Closet - Coming Soon | ReeseBlank",
  description: "Curate your style and get AI-powered fashion advice",
};

export default function Closet() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Your Closet is Almost Ready
        </h1>
        <p className="text-gray-300 text-base md:text-lg mb-8">
          We’re putting the final touches on your personalized closet
          experience. Soon, you'll be able to style, organize, and get
          AI-powered outfit recommendations tailored just for you.
        </p>
        <div className="inline-flex items-center gap-3">
          <span className="animate-bounce rounded-full w-3 h-3 bg-gold-500"></span>
          <span className="text-gold-400 font-medium uppercase text-sm tracking-widest">
            Coming Soon
          </span>
        </div>
      </div>
    </main>
  );
}
