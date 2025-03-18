export default function NotFoundPage() {
  return (
    <div className="container mt-5">
      <div className="alert-danger">
        <h1>Error 404 | Sayfa bulunamadı!</h1>
        <a href="/" className="btn btn-outline-danger mb-2 me-2">
          Anasayfa'ya Git
        </a>
        <a href="/login" className="btn btn-outline-danger mb-2 me-2">
          Girişe Git
        </a>
        <a href="/login-client" className="btn btn-outline-danger mb-2 me-2">
          Müşteri Girişine Git
        </a>
      </div>
    </div>
  );
}
