"use client";

import React, { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import Button from "@/components/Button";
import ProfileEditModal from "@/components/ProfileEditModal";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setProfileOpen, logoutUser } from "@/lib/features/profile/profileSlice";
import { getProfileAvatarDisplay } from "@/lib/profileEdit";

const formatProfileLabel = (value?: string) =>
  value
    ? value
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.profile.user);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const profileName = user?.name || user?.email.split("@")[0] || "Eco Caret Member";
  const displayName = profileName;
  const profileEmail = user?.email || "";
  const avatar = getProfileAvatarDisplay(user);

  const confirmLogout = () => {
    dispatch(logoutUser());
    setIsLogoutModalOpen(false);
    setIsEditProfileModalOpen(false);
    window.location.href = "/";
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Local styling overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .editorial-gradient {
          background: linear-gradient(to top, rgba(16, 32, 28, 0.7) 0%, rgba(16, 32, 28, 0.2) 60%, transparent 100%);
        }
        .copper-accent {
          border-top: 2px solid #3C9984;
        }
        .font-playfair {
          font-family: var(--font-playfair-display), serif;
        }
      `}} />

      {/* Main Container */}
      <main className="flex-grow pt-[84px] lg:pt-[96px] pb-16 md:pb-24 bg-background">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-8 md:mt-12">
          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start ripple-fade">
              
              {/* Left Sidebar Panel (4 columns) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-[2.5rem] p-6 shadow-sm animate-fade-in">
                  {/* Framed Portrait */}
                  <div className="relative aspect-[3/4] rounded-t-[100px] rounded-b-2xl overflow-hidden border border-outline-variant/20 shadow-inner group mb-6">
                    {avatar.type === "image" ? (
                      <img
                        className="w-full h-full object-cover grayscale-[10%] sepia-[5%] transition-transform duration-[1500ms] group-hover:scale-105"
                        alt={avatar.alt}
                        src={avatar.url}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-6xl font-bold tracking-wide transition-transform duration-[1500ms] group-hover:scale-105">
                        {avatar.initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Profile Name & Email */}
                  <div className="space-y-1 mb-6 text-center lg:text-left">
                    <h2 className="font-playfair text-3xl font-semibold text-on-surface leading-tight">
                      {displayName}
                    </h2>
                    <p className="text-sm text-on-surface-variant font-medium opacity-80">
                      {profileEmail}
                    </p>
                  </div>

                  {/* Desktop Quick Stats */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/20 mt-6">
                    <div className="p-4 bg-surface-container rounded-2xl text-center border border-outline-variant/10">
                      <div className="text-xl font-playfair font-semibold text-secondary">12</div>
                      <div className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">
                        Active Pieces
                      </div>
                    </div>
                    <div className="p-4 bg-surface-container rounded-2xl text-center border border-outline-variant/10">
                      <div className="text-xl font-playfair font-semibold text-secondary">1.2T</div>
                      <div className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">
                        CO₂ Offset
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Content Panel (8 columns) */}
              <section className="lg:col-span-8 space-y-12">
                {/* PROFILE TAB */}
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="font-playfair text-3xl font-semibold text-primary">
                        Profile
                      </h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          unstyled
                          onClick={() => setIsEditProfileModalOpen(true)}
                          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-secondary hover:shadow-md cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Edit Profile
                        </Button>
                        <Button
                          unstyled
                          onClick={() => setIsLogoutModalOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-1.5 border border-error/30 text-error hover:bg-error hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">logout</span>
                          Sign Out
                        </Button>
                      </div>
                    </div>

                    {/* Account Identity */}
                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 shadow-sm space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                          <span className="text-on-surface-variant">Full Name</span>
                          <span className="font-bold text-on-surface">{displayName}</span>
                        </div>
                        <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                          <span className="text-on-surface-variant">Email Address</span>
                          <span className="font-bold text-on-surface">{profileEmail}</span>
                        </div>
                        {user.gender && (
                          <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                            <span className="text-on-surface-variant">Gender</span>
                            <span className="font-bold text-on-surface">{formatProfileLabel(user.gender)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Residential address */}
                      <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 shadow-sm space-y-4">
                        <h3 className="font-playfair text-xl font-semibold text-secondary flex items-center gap-2">
                          <span className="material-symbols-outlined">home</span>
                          Residential Address
                        </h3>
                        {user?.residentialAddress ? (
                          <div className="space-y-1 text-sm text-on-surface-variant leading-relaxed">
                            <p className="font-bold text-on-surface">{user.residentialAddress.name}</p>
                            <p>{user.residentialAddress.line1}</p>
                            {user.residentialAddress.line2 && <p>{user.residentialAddress.line2}</p>}
                            <p>{user.residentialAddress.city}, {user.residentialAddress.state} {user.residentialAddress.postalCode}</p>
                            <p className="uppercase">{user.residentialAddress.country}</p>
                            <p className="text-xs mt-2">Phone: {user.residentialAddress.phone}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-on-surface-variant italic">No residential address on file.</p>
                        )}
                      </div>

                      {/* Shipping address */}
                      <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 shadow-sm space-y-4">
                        <h3 className="font-playfair text-xl font-semibold text-secondary flex items-center gap-2">
                          <span className="material-symbols-outlined">local_shipping</span>
                          Shipping Destination
                        </h3>
                        {user?.shippingAddresses && user.shippingAddresses.length > 0 ? (
                          <div className="space-y-1 text-sm text-on-surface-variant leading-relaxed">
                            <p className="font-bold text-on-surface">{user.shippingAddresses[0].name}</p>
                            <p>{user.shippingAddresses[0].line1}</p>
                            {user.shippingAddresses[0].line2 && <p>{user.shippingAddresses[0].line2}</p>}
                            <p>{user.shippingAddresses[0].city}, {user.shippingAddresses[0].state} {user.shippingAddresses[0].postalCode}</p>
                            <p className="uppercase">{user.shippingAddresses[0].country}</p>
                            <p className="text-xs mt-2">Phone: {user.shippingAddresses[0].phone}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-on-surface-variant italic">No shipping addresses on file.</p>
                        )}
                      </div>
                    </div>

                  </div>
              </section>
            </div>
          ) : (
            /* Logged Out Empty State */
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto py-20 px-8 bg-surface-container-low border border-outline-variant/30 rounded-[3rem] shadow-lg relative overflow-hidden animate-fade-in">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
              <span className="material-symbols-outlined text-secondary text-5xl bg-secondary-container/20 p-6 rounded-full ring-8 ring-secondary-container/5 animate-pulse">
                lock
              </span>
              <div className="space-y-3">
                <h2 className="font-playfair text-4xl font-semibold text-on-surface">EcoCaret</h2>
                <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed opacity-90">
                  Log in to access your certified blockchain registries, track bespoke commissions, and manage your private collection.
                </p>
              </div>
              <Button
                unstyled
                onClick={() => dispatch(setProfileOpen(true))}
                className="bg-secondary text-white px-10 py-4 rounded-full font-label-md text-label-md hover:bg-primary hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 cursor-pointer font-bold uppercase tracking-wider"
              >
                Sign In to EcoCaret
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <Button
          unstyled
          onClick={() => alert("Our Private Concierge is available to help. Direct Line: +1 (800) ECO-LUXE")}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
        </Button>
      </div>

      {user && (
        <ProfileEditModal
          isOpen={isEditProfileModalOpen}
          user={user}
          onClose={() => setIsEditProfileModalOpen(false)}
        />
      )}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of your profile?"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
