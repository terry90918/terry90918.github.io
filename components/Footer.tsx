export function Footer() {
  return (
    <footer className="bg-text-dark text-text-light relative px-8 py-8 md:px-16 lg:px-24 dark:bg-black">
      {/* Top border decoration */}
      <div className="via-accent/50 absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-text-light/70 text-sm">
            © {new Date().getFullYear()} 劉尹惠律師事務所
          </p>
          <a
            href="https://zenda-law.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-light/70 text-sm transition-colors hover:text-white"
          >
            仁大法律事務所
          </a>
        </div>
      </div>
    </footer>
  )
}
