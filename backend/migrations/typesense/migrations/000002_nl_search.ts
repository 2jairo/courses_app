import { MigrationObject } from "../types"

const migration: MigrationObject = {
    type: 'nl',
    nl: {
        model_name: 'vllm/gateway_ia_search',
        api_url: 'http://ai_gateway:3003/generate',
        max_bytes: 8192,
        id: 'gateway_IA_search',
        system_prompt: `Additional Instructions:
6. Price Handling:
- The "discountedPrice" field is stored in the smallest currency unit (e.g., cents).
- Always convert user-mentioned prices to this unit by multiplying by 100.
  Example: "under 10€" → discountedPrice:<1000
  Example: "between 5€ and 20€" → discountedPrice:[500..2000]

7. Default Query Behavior:
- Remove any terms from "q" that are already represented in "filter_by" or "sort_by".
- Only include terms in "q" that cannot be mapped to structured filters or sorting.
- If no meaningful full-text query terms remain after extracting filters and sorting, set: "q": "*"
- NEVER leave "q" as an empty string.

Ensure these rules are strictly followed in every generated response.     
`
    },
}

export default migration