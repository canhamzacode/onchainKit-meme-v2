import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type TokenListResponse, type TokenDetailResponse } from "~/types/coingecko";

export const coingeckoRouter = createTRPCRouter({
  getTokenById: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${input.id}`);
      const json = (await res.json()) as TokenDetailResponse;
      return json;
    }),
  getTokens: publicProcedure
    .input(z.object({ 
      sparkline: z.boolean().optional(),
      page: z.number().optional(),
      perPage: z.number().optional()
    }))
    .query(async ({ input }) => {
      try {
        const params = new URLSearchParams({
          vs_currency: "usd",
          category: "meme-token",
          order: "market_cap_desc",
          sparkline: (input.sparkline ?? true).toString(),
          page: (input.page ?? 1).toString(),
          per_page: (input.perPage ?? 100).toString(),
          x_cg_demo_api_key: env.COINGECKO_API_KEY,
        });
        const url = `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            accept: "application/json",
          },
        });
        const json = (await res.json()) as TokenListResponse[];
        return json;
      } catch (e) {
        console.error(e);
        return [];
      }
    }),
  getTokenByIdQuery: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${input.id}`);
      const json = (await res.json()) as TokenDetailResponse;
      return json;
    }),
});