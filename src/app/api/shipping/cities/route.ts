import { NextResponse } from "next/server";

const cityFees: Record<string, number> = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

export async function GET() {
  return NextResponse.json({ cities: Object.keys(cityFees).map((name) => ({ name, fee: cityFees[name] })) });
}


