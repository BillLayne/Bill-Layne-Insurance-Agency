export default function Header({ sendableCount }) {
  return (
    <div
      className="rounded-[14px] p-5 flex items-center justify-between mb-4"
      style={{ background: 'linear-gradient(135deg, #003f87 0%, #0076d3 100%)' }}
    >
      <div className="flex items-center gap-3">
        <img
          src="https://i.imgur.com/lxu9nfT.png"
          alt="Bill Layne Insurance Agency"
          className="h-9"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <div>
          <h1 className="text-white text-lg font-extrabold leading-tight">Newsletter Manager</h1>
          <p className="text-white/60 text-xs">Bill Layne Insurance Agency</p>
        </div>
      </div>
      {sendableCount > 0 && (
        <div className="text-right">
          <p className="text-[#C8A84E] text-2xl font-extrabold font-mono leading-tight">
            {sendableCount.toLocaleString()}
          </p>
          <p className="text-white/60 text-[10px] uppercase tracking-wider">Ready to Send</p>
        </div>
      )}
    </div>
  );
}
