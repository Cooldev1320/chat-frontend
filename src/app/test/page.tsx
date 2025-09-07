export default function TestPage() {
  return (
    <div className="min-h-screen bg-purple-900 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tailwind Test</h1>
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded">
          If you see purple background and this styled card, Tailwind is working!
        </div>
        <div className="mt-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
