"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { removeFromCart, setCartOpen } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By browsing Eco Caret, creating an account, placing an order, or using any customer service feature, you agree to these Terms and Conditions. If you do not agree, please do not use the website.",
      "Eco Caret may update these terms from time to time. The version published on this page applies to your use of the website and to orders placed after the effective date shown above.",
    ],
  },
  {
    title: "2. Products and Availability",
    body: [
      "Our jewelry may include lab-grown diamonds, recycled precious metals, handcrafted settings, and made-to-order details. Product images, color tones, stone appearance, and metal finish may vary slightly because displays, photography, and artisan finishing are not identical.",
      "Product availability, pricing, sizes, metal colors, and estimated delivery timelines may change without notice. Placing an item in the cart does not reserve inventory until an order is confirmed according to our checkout flow.",
    ],
  },
  {
    title: "3. Accounts and Customer Information",
    body: [
      "You are responsible for keeping your sign-in details secure and for ensuring that your profile, billing, and shipping information are accurate.",
      "Eco Caret may refuse, cancel, or hold an order when information appears incomplete, inaccurate, fraudulent, unauthorized, or inconsistent with our operational checks.",
    ],
  },
  {
    title: "4. Orders, Payments, and Pricing",
    body: [
      "Orders are subject to acceptance, payment authorization, inventory checks, fraud review, and operational validation. We may contact you for additional confirmation before processing an order.",
      "Prices are shown in the currency displayed at checkout and may include or exclude taxes, shipping, duties, or payment fees depending on the checkout details shown to you before payment.",
      "Payment must be completed through the payment options available at checkout. If a payment fails, expires, is cancelled, or requires review, the order may remain unpaid until a successful payment is recorded.",
    ],
  },
  {
    title: "5. Shipping and Delivery",
    body: [
      "Shipping timelines are estimates and may vary due to customization, quality checks, courier delays, holidays, weather, customs, or events outside our control.",
      "Risk of loss may transfer according to the delivery confirmation from the courier. Please inspect your package promptly and contact us if there is visible damage, missing content, or delivery concern.",
    ],
  },
  {
    title: "6. Cancellation, Returns, and Refunds",
    body: [
      "Cancellation eligibility depends on the order status, shipment status, payment state, and quantity already prepared or shipped. Shipped items may need to follow the return process instead of cancellation.",
      "Return requests may require order item selection, quantities, reason, warehouse receipt, and inspection approval before refund processing. Refunds are not guaranteed until the return is approved according to our policy and operational checks.",
      "Refund timing depends on the payment method, payment provider, bank, and internal review. Partial refunds may apply for partial cancellations, partial returns, rejected quantities, shipping charges, duties, or non-refundable fees where permitted.",
    ],
  },
  {
    title: "7. Custom, Personalized, and Final Sale Items",
    body: [
      "Engraved, resized, personalized, custom-made, special-order, altered, or hygiene-sensitive items may be restricted from cancellation or return unless defective, damaged, or required by applicable law.",
      "Any final sale or non-returnable condition will be communicated in the product, checkout, or support process where applicable.",
    ],
  },
  {
    title: "8. Website Use",
    body: [
      "You agree not to misuse the website, interfere with security, scrape data, upload harmful code, attempt unauthorized access, impersonate another person, or use the website for unlawful activity.",
      "All website content, product photography, branding, designs, text, and interface elements are owned by Eco Caret or its licensors and may not be copied or reused without written permission.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Eco Caret is not liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages arising from your use of the website, products, delivery services, or payment services.",
      "Nothing in these terms limits rights that cannot be excluded under applicable consumer protection laws.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      "For questions about these terms, orders, cancellations, returns, or refunds, contact Eco Caret support through the contact details provided on the website or your order confirmation.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col relative overflow-x-hidden">
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow pt-28 md:pt-36">
        <section className="px-margin-mobile md:px-margin-desktop pb-16">
          <div className="max-w-4xl mx-auto">
            <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-4">
              Legal
            </p>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-4">
              Terms & Conditions
            </h1>
            <p className="text-on-surface-variant text-body-md leading-8 max-w-3xl">
              These terms explain how Eco Caret handles website use, orders, payments, shipment, cancellations, returns, and refunds.
            </p>
            <p className="mt-4 text-sm text-on-surface-variant">
              Effective date: July 15, 2026
            </p>
          </div>
        </section>

        <section className="px-margin-mobile md:px-margin-desktop pb-24">
          <div className="max-w-4xl mx-auto bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 md:p-10 organic-shadow space-y-8">
            {sections.map((section) => (
              <article key={section.title} className="space-y-3">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-on-surface-variant leading-8 text-sm md:text-base">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => dispatch(setCartOpen(false))}
        cartItems={cartItems}
        onRemoveItem={(id) => dispatch(removeFromCart(id))}
        onCheckout={() => {
          dispatch(setCartOpen(false));
          router.push("/checkout");
        }}
      />
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
