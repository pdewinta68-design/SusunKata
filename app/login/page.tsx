import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <div className="breadcrumb"><Link href="/">Beranda</Link> / Masuk</div>
        <AuthForm />
      </main>
    </>
  );
}
