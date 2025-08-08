import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { Seo } from "@/components/Seo";

const Index = () => {
  return (
    <AppLayout>
      <Seo title="Smart Market Ledger – Simple Finance for Shops" description="Track income, expenses, profit and reports. Built for Indian shop owners." />
      <section className="py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Manage your shop finances with confidence</h1>
          <p className="mt-4 text-lg text-muted-foreground">Easy income & expense entry, automatic profit/loss, charts, and exportable reports. Made for tea shops, bakeries, hotels and more.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="hero" size="pill"><Link to="/signup">Get started</Link></Button>
            <Button asChild variant="outline"><Link to="/login">I have an account</Link></Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
