import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { EditorSection } from "@/components/editor-section"
import { Features } from "@/components/features"
import { Showcase } from "@/components/showcase"
import { Reviews } from "@/components/reviews"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <EditorSection />
      <Features />
      <Showcase />
      <Reviews />
      <FAQ />
      <Footer />
    </main>
  )
}
