export const objectToParams = (obj: object) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === null || v === undefined) continue

        params.append(key, String(v))
      }
    } else {
      params.append(key, String(value))
    }
  }

  return params
}