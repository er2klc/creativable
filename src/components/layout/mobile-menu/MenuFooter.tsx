export function MenuFooter() {
  return (
    <div className="sticky bottom-0 left-0 flex items-center justify-between px-4 py-2 text-sm text-gray-400 border-t border-white/10 bg-[#111111]/80">
      <div className="flex items-center gap-2">
        <span className="text-white">0.31</span>
        <a href="/changelog" className="text-gray-400 hover:text-white transition-colors">
          Changelog
        </a>
      </div>
    </div>
  );
}