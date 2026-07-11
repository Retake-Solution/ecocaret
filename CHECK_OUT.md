# Checkout Page Design & Architecture

This document describes the design, styling, and logic structure of the Eco Caret checkout system.

## Overview
The Checkout Page (`/checkout`) is a highly responsive, premium checkout flow designed to match the brand’s ethical luxury aesthetic. It guides users through contact registration, shipping configuration, payment simulation, and order confirmation.

## Architecture

### 1. State Management
- **Redux Integration**: Connects to the global Redux store (`cartSlice`) to retrieve current items (`cartItems`).
- **Total Pricing**: Automatically calculates:
  - Subtotal (from cart items)
  - Tax (simulated at 8%)
  - Shipping (flat rate or free above $5,000)
  - Grand Total
- **Form State**: Manages contact, shipping, and payment information using React state.

### 2. Layout Structure
- **Two-Column Layout (Desktop)**:
  - **Main Area (60% width)**: Divided into logical steps:
    1. Contact Information
    2. Shipping Address
    3. Payment Details (Mock Credit Card input with real-time formatting)
  - **Summary Area (40% width)**: Sticky summary cards showing selected luxury items, pricing breakdown, and a prominent "Place Order" button.
- **Single Column (Mobile)**: Summary collapses below/above form elements for quick and clean scroll layout.

### 3. Order Processing Simulation
Upon clicking "Place Order":
1. Field validation ensures all shipping and contact details are present.
2. Shows a luxury themed loading state (e.g., blockchain authorization, secure payment ledger processing).
3. Clears the cart (`clearCart` action).
4. Navigates to a Checkout Success confirmation panel containing an order tracking ID.

## Color System Mapping (Teal Theme)
- Primary Color: `#3C9984`
- Secondary Color: `#2f6f73`
- Background: `#f7fffc`
- Glass Panel Backdrop: `rgba(247, 255, 252, 0.72)`
