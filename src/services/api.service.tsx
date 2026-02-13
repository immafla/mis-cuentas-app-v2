import React from "react";

export class ApiService {
  async updateProductsAmount(id: string, amount: number) {
    return await fetch(`/api/products/amount`, {
      method: "PUT",
      body: JSON.stringify({ id, amount }),
    });
  }

  async updateProductsAmountBatch(updates: Array<{ id: string; amount: number }>) {
    return await fetch(`/api/products/amount`, {
      method: "PUT",
      body: JSON.stringify({ updates }),
    });
  }

  async getAllCategories() {
    return await fetch("/api/categories", {
      method: "GET",
    });
  }

  async getAllProducts() {
    return await fetch("/api/products", {
      method: "GET",
    });
  }

  async getAllBrands() {
    console.log("Fetching brands...");
    return await fetch("/api/brands", {
      method: "GET",
    });
  }

  async getAllBussinesCategory() {
    return await fetch("/api/businessCategories", {
      method: "GET",
    });
  }

  async setBrand(body: any) {
    return fetch("/api/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      body: JSON.stringify(body),
    });
  }

  setBussines(body: any) {
    return fetch("/api/businesses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      body: JSON.stringify(body),
    });
  }

  async deleteBrand(body: any) {
    return fetch("/api/brands", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      body: JSON.stringify(body),
    });
  }

  async deleteProduct(id: string) {
    return fetch("/api/products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      body: JSON.stringify({ id }),
    });
  }
}
