export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ShopNova. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
