
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as T;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export default fetchData;