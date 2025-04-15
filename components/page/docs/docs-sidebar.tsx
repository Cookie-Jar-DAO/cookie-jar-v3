"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DocsSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeItem: string
  setActiveItem: (item: string) => void
}

export function DocsSidebar({ className, activeItem, setActiveItem, ...props }: DocsSidebarProps) {
  const items = [
    {
      title: "Getting Started",
      items: [
        {
          id: "introduction",
          title: "Introduction",
          href: "#introduction",
        },
        {
          id: "installation",
          title: "Installation",
          href: "#installation",
        },
      ],
    },
    {
      title: "Core Concepts",
      items: [
        {
          id: "cookie-jars",
          title: "Cookie Jars",
          href: "#cookie-jars",
        },
        {
          id: "access-control",
          title: "Access Control",
          href: "#access-control",
        },
        {
          id: "withdrawal-rules",
          title: "Withdrawal Rules",
          href: "#withdrawal-rules",
        },
      ],
    },
    {
      title: "Guides",
      items: [
        {
          id: "creating-a-jar",
          title: "Creating a Jar",
          href: "#creating-a-jar",
        },
        {
          id: "managing-a-jar",
          title: "Managing a Jar",
          href: "#managing-a-jar",
        },
        {
          id: "withdrawing-funds",
          title: "Withdrawing Funds",
          href: "#withdrawing-funds",
        },
      ],
    },
    {
      title: "API Reference",
      items: [
        {
          id: "smart-contracts",
          title: "Smart Contracts",
          href: "#smart-contracts",
        },
        {
          id: "javascript-sdk",
          title: "JavaScript SDK",
          href: "#javascript-sdk",
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          id: "faq",
          title: "FAQ",
          href: "#faq",
        },
        {
          id: "troubleshooting",
          title: "Troubleshooting",
          href: "#troubleshooting",
        },
      ],
    },
  ]

  return (
    <div className={cn("docs-sidebar w-full py-4 pr-4 h-full overflow-y-auto", className)} {...props}>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.title} className="space-y-2">
            <h4 className="font-medium text-sm text-white">{item.title}</h4>
            {item.items.map((subItem) => (
              <Button
                key={subItem.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start font-normal",
                  activeItem === subItem.id
                    ? "bg-[#ff5e14] bg-opacity-20 text-[#ff5e14] font-medium"
                    : "text-white hover:bg-white hover:bg-opacity-10 hover:text-[#ff5e14]",
                )}
                onClick={() => setActiveItem(subItem.id)}
              >
                {subItem.title}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
