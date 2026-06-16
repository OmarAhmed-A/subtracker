export const CYCLE_LABELS = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }

const COLORS = ['bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

function colorFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function SubscriptionList({ subscriptions, onEdit, onDelete, onToggleActive }) {
  if (!subscriptions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
        <p className="text-slate-400">No subscriptions yet.</p>
        <p className="mt-1 text-sm text-slate-500">Tap the + button to add your first one.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className={`flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 ${sub.active ? '' : 'opacity-60'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${colorFor(sub.name)}`}>
              {sub.name[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{sub.name}</div>
              <div className="text-xs text-slate-400">{sub.category} • {CYCLE_LABELS[sub.cycle]} • Next: {sub.next_renewal}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{Number(sub.cost).toFixed(2)} {sub.currency}</div>
            <div className="mt-1 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => onToggleActive(sub)}
                className={sub.active ? 'text-amber-400 hover:underline' : 'text-emerald-400 hover:underline'}
              >
                {sub.active ? 'Pause' : 'Resume'}
              </button>
              <button onClick={() => onEdit(sub)} className="text-sky-400 hover:underline">Edit</button>
              <button onClick={() => onDelete(sub.id)} className="text-rose-400 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
