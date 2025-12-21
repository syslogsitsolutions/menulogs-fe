/**
 * Indian Postal Code API Utility
 * Uses postalpincode.in API to fetch location details by pincode
 */

export interface PostalCodeData {
  postOffice: string;
  district: string;
  state: string;
  city?: string;
}

export interface PostalCodeResponse {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    Description?: string;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    Block: string;
    State: string;
    Pincode: string;
    Country: string;
  }>;
}

/**
 * Fetch location details from Indian postal code API
 * @param pincode - 6-digit Indian postal code
 * @returns Postal code data or null if not found
 */
export async function fetchPostalCodeData(
  pincode: string
): Promise<PostalCodeData | null> {
  // Validate pincode format (6 digits)
  const cleanPincode = pincode.trim().replace(/\D/g, '');
  if (cleanPincode.length !== 6) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${cleanPincode}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch postal code data');
    }

    const data: PostalCodeResponse[] = await response.json();

    if (!data || data.length === 0 || data[0].Status !== 'Success') {
      return null;
    }

    const postOfficeData = data[0].PostOffice;
    if (!postOfficeData || postOfficeData.length === 0) {
      return null;
    }

    // Use the first post office entry (they all have same state/district for a pincode)
    const firstOffice = postOfficeData[0];

    return {
      postOffice: firstOffice.Name,
      district: firstOffice.District,
      state: firstOffice.State,
      city: firstOffice.District, // District is often used as city in India
    };
  } catch (error) {
    console.error('Error fetching postal code data:', error);
    return null;
  }
}

