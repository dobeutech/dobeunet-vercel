import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";
import Stripe from "stripe";

interface CheckoutRequest {
  serviceId: string;
  serviceName: string;
  totalAmount: number;
  selectedAddOns: { name: string; price: number }[];
  isSubscription?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "authorization, content-type",
      );
      return res.status(204).end();
    }

    if (req.method !== "POST") {
      return sendError(res, 405, "Method not allowed");
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return sendError(res, 500, "Stripe is not configured");
    }

    const claims = await requireAuth(req);
    const userEmail = claims.email as string | undefined;
    const userId = claims.sub;

    if (!userEmail) {
      return sendError(res, 400, "User email not found");
    }

    const body = getBody<CheckoutRequest>(req);
    const {
      serviceId,
      serviceName,
      totalAmount,
      selectedAddOns,
      isSubscription,
    } = body;

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: { auth0_user_id: userId },
      });
      customerId = newCustomer.id;
    }

    const addOnsDescription =
      selectedAddOns.length > 0
        ? ` + ${selectedAddOns.map((a) => a.name).join(", ")}`
        : "";

    const origin =
      (req.headers["origin"] as string | undefined) || "https://dobeu.net";

    if (isSubscription) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: serviceName,
                description: `Monthly retainer service${addOnsDescription}`,
              },
              unit_amount: Math.round(totalAmount * 100),
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/shop?canceled=true`,
        metadata: {
          service_id: serviceId,
          user_id: userId,
          selected_add_ons: JSON.stringify(selectedAddOns),
        },
      });

      return sendJson(res, 200, { url: session.url });
    } else {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: serviceName,
                description: `Project-based service${addOnsDescription}`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/shop?canceled=true`,
        metadata: {
          service_id: serviceId,
          user_id: userId,
          selected_add_ons: JSON.stringify(selectedAddOns),
        },
      });

      return sendJson(res, 200, { url: session.url });
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return sendError(res, 400, errorMessage);
  }
}
