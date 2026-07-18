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
    title: "1. Information We Collect",
    body: [
      "We may collect your name, email address, phone number, billing address, shipping address, account details, order history, payment status, support messages, return reasons, and preferences you provide while using Eco Caret.",
      "We may also collect device and usage information such as IP address, browser type, pages viewed, session activity, referral source, approximate location, and cookie identifiers.",
    ],
  },
  {
    title: "2. How We Use Information",
    body: [
      "We use your information to create and manage accounts, process orders, confirm payments, arrange shipment, support cancellations and returns, issue refunds, prevent fraud, improve the website, and communicate service updates.",
      "With your permission or where allowed by law, we may send product updates, collection news, care guidance, or promotional messages. You can opt out of marketing communications at any time.",
    ],
  },
  {
    title: "3. Payments",
    body: [
      "Payments are processed through authorized payment providers. Eco Caret does not intend to store full card numbers or sensitive payment credentials on our own systems.",
      "Payment providers may process payment information, authentication details, transaction identifiers, risk signals, refund records, and dispute information according to their own security and privacy practices.",
    ],
  },
  {
    title: "4. Cookies and Similar Technologies",
    body: [
      "We may use cookies, local storage, analytics tools, and similar technologies to keep you signed in, maintain cart experiences, remember preferences, measure performance, and protect against misuse.",
      "You can manage cookies through your browser settings. Disabling some cookies may affect account access, checkout, cart, payment, or personalization features.",
    ],
  },
  {
    title: "5. Sharing Information",
    body: [
      "We may share information with service providers that help operate the store, including payment processors, shipping partners, technology providers, analytics tools, fraud prevention services, support tools, and professional advisors.",
      "We may disclose information when required by law, court order, regulatory request, fraud investigation, security protection, business transfer, or to enforce our rights and policies.",
    ],
  },
  {
    title: "6. Data Retention",
    body: [
      "We keep information for as long as needed to provide services, complete transactions, support warranty or return obligations, meet tax, accounting, legal, fraud prevention, and business record requirements.",
      "When information is no longer needed, we will delete, anonymize, or archive it according to our operational and legal requirements.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. No online service can guarantee absolute security.",
      "You should keep your account credentials confidential and contact us immediately if you believe your account or order information has been accessed without authorization.",
    ],
  },
  {
    title: "8. Your Choices and Rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, object to, or receive a copy of certain personal information.",
      "You may update account information from your profile where available, unsubscribe from marketing messages, or contact us for privacy-related requests.",
    ],
  },
  {
    title: "9. Children",
    body: [
      "Eco Caret is not intended for children. We do not knowingly collect personal information from children without appropriate consent required by applicable law.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    body: [
      "We may update this Privacy Policy as our services, legal requirements, or business practices change. The updated policy will be posted on this page with a revised effective date.",
    ],
  },
  {
    title: "11. Contact",
    body: [
      "For privacy questions, data requests, or concerns about how your information is handled, contact Eco Caret support through the contact details provided on the website or your order confirmation.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              Privacy
            </p>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-on-surface-variant text-body-md leading-8 max-w-3xl">
              This policy explains what information Eco Caret collects, why we use it, how we share it, and the choices available to you.
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
