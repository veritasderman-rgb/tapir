import { useAppStore } from '../store/useAppStore';

const SECTIONS = [
  {
    title: 'Modelové předpoklady vs. realita',
    text: 'Každý model je zjednodušením reality. Tento simulátor předpokládá homogenní míšení uvnitř věkových skupin, konstantní parametry v čase (pokud nejsou explicitně měněny), a deterministické nebo binomické přechody. Reálné epidemie jsou ovlivněny prostorovou heterogenitou, chováním populace, sezónností a dalšími faktory.',
  },
  {
    title: 'Nejistota (uncertainty)',
    text: 'Rozlišujeme tři typy nejistoty: (1) Parametrická — nepřesnost v odhadech R0, IFR, kontaktních matic. (2) Strukturní — volba modelu (SEIR vs. SEIRS, počet strát). (3) Scénářová — jaké intervence budou zavedeny a kdy. Monte Carlo simulace zobrazují jen parametrickou nejistotu z binomických přechodů.',
  },
  {
    title: 'R₀ a Reff jsou odhady modelu',
    text: 'R₀ (základní reprodukční číslo) a Reff(t) jsou modelové veličiny odvozené z next-generation matrix. Nejsou přímo měřitelné v reálném světě. Implied R₀ závisí na kontaktní matici a demografii — změna těchto parametrů změní i implied R₀.',
  },
  {
    title: 'Korelace ≠ kauzalita',
    text: 'Pokud v simulaci zavedení NPI koreluje s poklesem infekcí, je to kauzální efekt v rámci modelu. V reálném světě by takový závěr vyžadoval kontrolovanou studii. Model ukazuje mechanismus, ne důkaz.',
  },
  {
    title: 'Stochastika a vyhasnutí',
    text: 'Ve stochastickém režimu může epidemie vyhasnout i při R₀ > 1, zejména při malém počtu počátečních případů. To je realistický jev (stochastic fadeout). Deterministický model tento efekt nezachytí.',
  },
];

export default function PolicyLiteracyPanel() {
  const { policyLiteracyOpen, setPolicyLiteracyOpen } = useAppStore();

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg" role="complementary" aria-label="Policy Literacy">
      <button
        onClick={() => setPolicyLiteracyOpen(!policyLiteracyOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-amber-900 font-semibold text-sm hover:bg-amber-100 rounded-lg"
        aria-expanded={policyLiteracyOpen}
      >
        <span>Policy Literacy — Co model (ne)říká</span>
        <span className="text-amber-600">{policyLiteracyOpen ? '▲' : '▼'}</span>
      </button>

      {policyLiteracyOpen && (
        <div className="px-4 pb-4 space-y-3">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-amber-800 mb-1">{section.title}</h4>
              <p className="text-xs text-amber-700 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
