"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { DocsSidebar } from "@/components/page/docs/docs-sidebar"
import { DocsContent } from "@/components/page/docs/docs-content"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/design/use-mobile"
import { ScrollToTop } from "@/components/design/scroll-to-top"

export default function DocsPage() {
  const [activeItem, setActiveItem] = useState("introduction")
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  // Scroll to top when active item changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeItem])

  // Function to handle item selection and close sidebar
  const handleItemSelect = (item: string) => {
    setActiveItem(item)
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 bg-[#1D1D1D] min-h-screen">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full bg-[#C3FF00] text-[#1D1D1D] h-14 w-14 shadow-lg">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] p-0 bg-[#1D1D1D]">
              <div className="h-full overflow-y-auto py-6">
                <DocsSidebar activeItem={activeItem} setActiveItem={handleItemSelect} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-[240px] lg:w-[280px] overflow-y-auto md:block">
        <DocsSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </aside>
      {/* Main content */}
      <div className={`md:col-start-2 ${isMobile ? "pt-4 px-4" : ""}`}>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid overflow-y-auto">
          <DocsContent activeItem={activeItem} />
        </main>
      </div>
      <ScrollToTop />
    </div>
  )
}
