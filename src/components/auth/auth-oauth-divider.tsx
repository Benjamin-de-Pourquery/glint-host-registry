type Props = {
  label: string;
};

export function AuthOAuthDivider({ label }: Props) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-2 text-slate-500">{label}</span>
      </div>
    </div>
  );
}
