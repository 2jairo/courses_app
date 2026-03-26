export const discountedPrice = (price: number, discountPercent: number) => {
	return price * (100 - discountPercent) / 100
}