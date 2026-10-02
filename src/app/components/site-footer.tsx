export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} ING Software</span>
      <span aria-hidden="true" className="site-footer-separator">·</span>
      <span>
        Made with <span aria-label="amor" role="img">♥</span> by{" "}
        <a href="https://github.com/Fabrizzio20k" rel="noreferrer" target="_blank">
          Fabrizzio20k
        </a>
      </span>
    </footer>
  );
}
