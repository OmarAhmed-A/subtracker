export default function CurrencyToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
      {['EGP', 'USD'].map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-lg px-4 py-1 text-sm font-medium transition ${
            value === c ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
