"use client"

import { useState } from "react"
import { DocsSidebar } from "@/components/page/docs/docs-sidebar"
import { DocsContent } from "@/components/page/docs/docs-content"

export default function DocsPage() {
  const [activeItem, setActiveItem] = useState("introduction")

  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 bg-[#1D1D1D] min-h-screen">
      <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-[240px] lg:w-[280px] overflow-y-auto md:block">
        <DocsSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </aside>
      <div className="md:col-start-2">
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid overflow-y-auto">
          <DocsContent activeItem={activeItem} />
        </main>
      </div>
    </div>
  )
}
