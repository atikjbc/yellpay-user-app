export type JapaneseAddress = {
  zipcode: string;
  prefcode: string; // Prefecture code
  address1: string; // Prefecture
  address2: string; // City/Ward
  address3: string; // Town/Area
  kana1: string; // Prefecture in Kana
  kana2: string; // City/Ward in Kana
  kana3: string; // Town/Area in Kana
};

export async function fetchJapaneseAddress(
  postalCode: string
): Promise<JapaneseAddress | null> {
  try {
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`
    );
    const data = await response.json();

    if (data.status !== 200 || !data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0] as JapaneseAddress;
  } catch (error) {
    console.error('Error fetching Japanese address:', error);
    return null;
  }
}
