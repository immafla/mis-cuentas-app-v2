"use server";

import dbConnect from "./mongodb";
import Account from "./models/Account";

export async function getAllAccounts() {
  try {
    await dbConnect();
    const accounts = await Account.find({ type: "account" });
    return accounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw new Error("Failed to fetch accounts");
  }
}
