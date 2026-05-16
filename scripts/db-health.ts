import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../lib/prisma";

async function main() {
  const [users, sessions, merchants, invoices, payments] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.merchant.count(),
    prisma.invoice.count(),
    prisma.payment.count(),
  ]);

  console.log("BlockPay DB — row counts");
  console.log("  users     :", users);
  console.log("  sessions  :", sessions);
  console.log("  merchants :", merchants);
  console.log("  invoices  :", invoices);
  console.log("  payments  :", payments);

  const recent = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { merchant: { select: { businessName: true, settlementAddress: true } } },
  });
  if (recent.length) {
    console.log("\nLatest invoices:");
    for (const r of recent) {
      console.log(
        `  ${r.id}  status=${r.status}  chain=${r.chainKey}  amount=${r.amount}  merchant="${r.merchant.businessName}" (${r.merchant.settlementAddress.slice(0, 10)}...)`,
      );
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
