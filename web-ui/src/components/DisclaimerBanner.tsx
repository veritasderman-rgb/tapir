export default function DisclaimerBanner() {
  return (
    <div
      className="disclaimer-banner bg-brand-red-soft border-b border-brand-red/30 px-4 py-1.5 text-center text-xs text-brand-red print:block"
      role="alert"
    >
      <strong className="font-bold tracking-wide">SIMULACE</strong> · Edukační model pro
      výuku epidemiologie, nikoliv klinická predikce. Výsledky nepoužívejte jako doporučení pro
      reálná rozhodnutí.
    </div>
  );
}
