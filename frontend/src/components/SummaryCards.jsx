export default function SummaryCards({ dashboard, currency }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm text-slate-400">Monthly</div>
        <div className="mt-1 text-2xl font-bold">{dashboard.monthly_total.toFixed(2)} {currency}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm text-slate-400">Yearly</div>
        <div className="mt-1 text-2xl font-bold">{dashboard.yearly_total.toFixed(2)} {currency}</div>
      </div>
    </div>
  )
}
