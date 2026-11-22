interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  let classes = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized === 'disponível' || normalized === 'disponivel' || normalized === 'concluido' || normalized === 'concluído' || normalized.includes('ativo com')) {
    classes = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'ativo') {
    classes = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'alugado' || normalized === 'indisponível' || normalized === 'cancelado' || normalized.includes('sem locações')) {
    classes = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}
