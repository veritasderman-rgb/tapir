import { VERSION } from '@tapir/core';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nedovařený tapír
        </h1>
        <p className="text-gray-600">
          Edukační SEIR simulátor v{VERSION}
        </p>
        <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 max-w-md">
          DISCLAIMER: Toto je edukační simulátor. Není to klinický nástroj ani predikce reality.
        </p>
      </div>
    </div>
  );
}
