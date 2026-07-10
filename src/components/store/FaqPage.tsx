"use client";

import { useState } from "react";
import { ChevronDown, Search, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FAQ_DATA = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How can I track my order?", a: "You can track your order in the 'My Orders' section of your account portal. Once shipped, you'll also receive a tracking number via email." },
      { q: "What is your shipping policy?", a: "We offer free shipping on orders above a certain threshold. Standard delivery usually takes 3-5 business days." },
    ]
  },
  {
    category: "Payments",
    items: [
      { q: "Which payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, and net banking via PayU India." },
      { q: "Is my payment information secure?", a: "Yes, all transactions are processed through encrypted, industry-standard payment gateways." },
    ]
  },
  {
    category: "Returns",
    items: [
      { q: "How do I return a product?", a: "You can initiate a return from your order history in the portal within 7 days of delivery." },
    ]
  }
];

export function FaqPage() {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about our products and services.</p>
        <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search for help..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="space-y-12">
        {FAQ_DATA.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">{cat.category}</h2>
            <div className="space-y-2">
                {cat.items.filter(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())).map((item, itemIdx) => {
                    const id = `${catIdx}-${itemIdx}`;
                    const isOpen = openIdx === id;
                    return (
                        <div key={id} className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenIdx(isOpen ? null : id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium text-sm sm:text-base">{item.q}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div className="p-4 pt-0 text-sm sm:text-base text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center space-y-4">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Still have questions?</h3>
        <p className="text-muted-foreground">We're here to help you. Chat with us or send an email.</p>
        <div className="flex justify-center gap-4">
            <Button>Contact Support</Button>
            <Button variant="outline">WhatsApp Us</Button>
        </div>
      </div>
    </div>
  );
}
