// Route transition: each navigation re-mounts the template, fading the new page in.
// A short CSS fade: it starts with the first paint and never holds a page back
// waiting for JavaScript.
export default function Template({ children }) {
  return <div className="animate-page-in">{children}</div>;
}
