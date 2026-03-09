export default function DisclaimerBanner() {
  return (
    <div
      className="disclaimer-banner bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm text-red-800 print:block"
      role="alert"
    >
      <strong>DISCLAIMER:</strong> Toto je edukační simulátor. Není to klinický nástroj ani predikce reality.
      Výsledky nesmí být prezentovány jako doporučení pro reálná rozhodnutí.
    </div>
  );
}
