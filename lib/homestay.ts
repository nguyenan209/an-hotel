import Cookies from "js-cookie";

export const fetchHomestayById = async (id: string) => {
  const token = Cookies.get("token");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/homestays/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch homestay details");
  }

  return response.json();
};

export async function fetchAddressResults(
  query: string
): Promise<{ id: string; address: string }[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/opencage?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch address results");
    }
    const data = await response.json();
    return data.formattedResult || [];
  } catch (error) {
    console.error("Error fetching address results:", error);
    return [];
  }
}

export async function fetchHomestayData(
  id: string,
  resetForm: (data: any) => void
): Promise<any> {
  try {
    const foundHomestay = await fetchHomestayById(id);

    if (foundHomestay) {
      resetForm({
        name: foundHomestay.name,
        location: foundHomestay.location,
        address: foundHomestay.address,
        description: foundHomestay.description,
        price: foundHomestay.price,
        maxGuests: foundHomestay.maxGuests,
        totalRooms: foundHomestay.totalRooms || 0,
        status: foundHomestay.status || "ACTIVE",
        amenities: foundHomestay.amenities,
        featured: foundHomestay.featured,
        allowsPartialBooking: foundHomestay.allowsPartialBooking !== false,
      });
    }

    return foundHomestay;
  } catch (error) {
    console.error("Error fetching homestay:", error);
    throw error;
  }
}

export async function createHomestay(data: any): Promise<any> {
  try {
    const token = Cookies.get("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/homestays`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create homestay");
    }

    const result = await response.json();
    console.log("Homestay created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating homestay:", error);
    throw error;
  }
}
