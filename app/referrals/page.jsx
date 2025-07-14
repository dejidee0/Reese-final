import dynamic from "next/dynamic";

const ReferralsPage = dynamic(
  () =>
    import("@/components/referrals/referrals-page").then((mod) => ({
      default: mod.ReferralsPage,
    })),
  {
    ssr: false,
  }
);

export const metadata = {
  title: "Referrals - ReeseBlank",
  description: "Refer friends and earn rewards",
};

export default function Referrals() {
  return <ReferralsPage />;
}
