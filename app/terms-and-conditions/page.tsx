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
    title: "4. Order Policy",
    body: [
      "Every order placed through Eco Caret is subject to acceptance, payment authorization, inventory checks, fraud review, address validation, and operational approval. An order confirmation message means we have received your request; it does not always mean the order has completed every review step.",
      "You must provide accurate product selections, metal color, size, quantity, shipping address, billing details, and contact information. Eco Caret is not responsible for delay, failed delivery, or additional cost caused by incorrect or incomplete information provided by the customer.",
      "After an order is accepted, the order may move through processing, crafting, quality check, packing, shipment, delivery, cancellation, return, or refund states depending on the product and fulfillment progress. Certain made-to-order, customized, engraved, resized, or personalized items may begin processing quickly and may not be cancellable once work has started.",
      "Eco Caret may cancel, pause, reject, or require additional verification for any order if payment is not completed, inventory becomes unavailable, the item is incorrectly priced, fraud or misuse is suspected, delivery details are invalid, or the order violates these terms.",
    ],
  },
  {
    title: "5. Payments and Pricing",
    body: [
      "Prices are shown in the currency displayed at checkout and may include or exclude taxes, shipping, duties, or payment fees depending on the checkout details shown to you before payment.",
      "Payment must be completed through the payment options available at checkout. If a payment fails, expires, is cancelled, or requires review, the order may remain unpaid until a successful payment is recorded.",
    ],
  },
  {
    title: "6. Shipping and Delivery",
    body: [
      "Shipping timelines are estimates and may vary due to customization, quality checks, courier delays, holidays, weather, customs, or events outside our control.",
      "Risk of loss may transfer according to the delivery confirmation from the courier. Please inspect your package promptly and contact us if there is visible damage, missing content, or delivery concern.",
    ],
  },
  {
    title: "7. Cancellation and Return Policy",
    body: [
      "Cancellation eligibility depends on the order status, shipment status, payment state, and quantity already prepared or shipped. Shipped items may need to follow the return process instead of cancellation.",
      "Customers may request cancellation for eligible unshipped quantities from the order details page or by contacting support. If part of an order has shipped, only the unshipped quantity may be cancellable and the shipped quantity may require a return request.",
      "If a customer cancels an order after shipment has already been created or dispatched, Eco Caret may deduct 10% from the eligible refundable amount to cover shipment, handling, payment processing, and operational costs.",
      "Return requests must include the relevant order item, requested quantity, and return reason. Returned products must be unused, complete, securely packed, and accompanied by any required packaging, certificates, tags, invoices, or accessories unless the return is due to an approved defect or delivery issue.",
      "Eco Caret may reject or reduce a return if the item is used, altered, damaged after delivery, missing components, outside the eligible return window, not received by our warehouse, or fails inspection.",
    ],
  },
  {
    title: "8. Refund Policy",
    body: [
      "Refunds are processed only after the cancellation is approved or the returned item is received and inspected, unless applicable law requires otherwise. Approval of a return request does not guarantee a refund until inspection is complete.",
      "Eligible refunds may be full or partial depending on the approved quantity, product condition, order status, payment status, promotional discount, shipping charge, duty, tax, handling cost, payment-provider fee, or other non-refundable amount shown or permitted at the time of purchase.",
      "Refunds are normally issued to the original payment method used for the order. Processing time depends on Eco Caret review, the payment gateway, card network, bank, wallet, or other payment provider. Once we initiate a refund, the final credit timeline is controlled by the payment provider or bank.",
      "If payment has failed, expired, or was never captured, no refund may be required. If an order has been partially paid, partially cancelled, partially returned, or partially approved after inspection, the refund will be calculated only for the eligible approved amount.",
      "Example: If an order total is ₹50,000 and the full order is cancelled before shipment, the eligible refund may be ₹50,000. If the same order is cancelled after shipment, a 10% deduction may apply, so ₹5,000 may be deducted and the eligible refund may be ₹45,000. If only one approved item worth ₹20,000 is returned from that order, the refund may be ₹20,000 and the remaining order value will be ₹30,000, subject to inspection, payment status, and any non-refundable charges.",
      "Eco Caret may hold, decline, or manually review a refund if fraud, abuse, chargeback, duplicate request, payment dispute, return mismatch, or policy violation is suspected.",
    ],
  },
  {
    title: "9. Custom, Personalized, and Final Sale Items",
    body: [
      "Engraved, resized, personalized, custom-made, special-order, altered, or hygiene-sensitive items may be restricted from cancellation or return unless defective, damaged, or required by applicable law.",
      "Any final sale or non-returnable condition will be communicated in the product, checkout, or support process where applicable.",
    ],
  },
  {
    title: "10. Website Use",
    body: [
      "You agree not to misuse the website, interfere with security, scrape data, upload harmful code, attempt unauthorized access, impersonate another person, or use the website for unlawful activity.",
      "All website content, product photography, branding, designs, text, and interface elements are owned by Eco Caret or its licensors and may not be copied or reused without written permission.",
    ],
  },
  {
    title: "11. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Eco Caret is not liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages arising from your use of the website, products, delivery services, or payment services.",
      "Nothing in these terms limits rights that cannot be excluded under applicable consumer protection laws.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      "For questions about these terms, orders, cancellations, returns, or refunds, contact Eco Caret support through the contact details provided on the website or your order confirmation.",
    ],
  },
];

const policyHighlights = [
  {
    icon: "shopping_bag",
    label: "Order Review",
    text: "Orders pass through payment, inventory, address, and operational checks before fulfillment.",
  },
  {
    icon: "local_shipping",
    label: "After Shipment",
    text: "A 10% deduction may apply when cancellation happens after shipment is created or dispatched.",
  },
  {
    icon: "currency_rupee",
    label: "Refund Timing",
    text: "Refunds are calculated after cancellation approval or return inspection and sent to the original payment method.",
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

      <main className="flex-grow pt-24 md:pt-32">
        <section className="px-margin-mobile md:px-margin-desktop pb-10 md:pb-14">
          <div className="max-w-container-max mx-auto rounded-[2rem] bg-surface-container-low border border-outline-variant/10 organic-shadow overflow-hidden">
            <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
              <div className="p-7 md:p-12 lg:p-14">
                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-5">
                  Legal Agreement
                </p>
                <h1 className="font-headline-lg text-headline-lg text-primary mb-5 max-w-3xl">
                  Terms & Conditions
                </h1>
                <p className="text-on-surface-variant text-body-md leading-8 max-w-3xl">
                  These terms explain how Eco Caret handles website use, orders, payments, shipment, cancellations, returns, and refunds.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <span className="material-symbols-outlined text-base">event</span>
                    Effective July 15, 2026
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    Customer Policy
                  </span>
                </div>
              </div>

              <div className="bg-primary text-white p-7 md:p-10 lg:p-12 flex flex-col justify-between gap-8">
                <div>
                  <p className="font-label-sm text-label-sm uppercase tracking-widest text-white/70 mb-4">
                    Key Note
                  </p>
                  <p className="font-headline-sm text-headline-sm leading-tight">
                    After-shipment cancellation may include a 10% deduction from the eligible refundable amount.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                  <p className="text-sm text-white/75 mb-1">Example refund</p>
                  <p className="text-2xl font-bold">₹50,000 - ₹5,000 = ₹45,000</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin-mobile md:px-margin-desktop pb-10">
          <div className="max-w-container-max mx-auto grid gap-4 md:grid-cols-3">
            {policyHighlights.map((item) => (
              <div key={item.label} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 organic-shadow">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">
                  {item.icon}
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  {item.label}
                </h2>
                <p className="text-sm leading-7 text-on-surface-variant">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-margin-mobile md:px-margin-desktop pb-24">
          <div className="max-w-container-max mx-auto grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            <aside className="hidden lg:block sticky top-28">
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 organic-shadow">
                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-4">
                  Sections
                </p>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <a
                      key={section.title}
                      href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                    >
                      {section.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="space-y-4">
              {sections.map((section) => (
                <article
                  id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                  key={section.title}
                  className="scroll-mt-28 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 md:p-7 organic-shadow"
                >
                  <div className="flex gap-4 items-start">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {section.title.split(".")[0]}
                    </span>
                    <div className="space-y-4">
                      <h2 className="font-headline-sm text-headline-sm text-primary">
                        {section.title.replace(/^\d+\.\s*/, "")}
                      </h2>
                      <div className="space-y-3">
                        {section.body.map((paragraph) => (
                          <p key={paragraph} className="text-on-surface-variant leading-8 text-sm md:text-base">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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
