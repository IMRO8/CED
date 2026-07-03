async function getData<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }

  const data: T = await response.json();
  return data;
}

export { getData };