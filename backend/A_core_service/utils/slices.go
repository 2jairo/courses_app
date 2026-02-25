package utils

import "math/rand/v2"

func ShuffleSlice[T any](slice []T) {
	rand.Shuffle(len(slice), func(i, j int) {
		slice[i], slice[j] = slice[j], slice[i]
	})
}

func RemoveDuplicates[T comparable](values []T) []T {
	seen := make(map[T]struct{}, len(values))
	j := 0

	for _, n := range values {
		if _, ok := seen[n]; ok {
			continue
		}
		seen[n] = struct{}{}
		values[j] = n
		j++
	}

	return values[:j]
}

func RemoveDuplicatesWithCb[T any, C comparable](values []T, cb func(T) C) []T {
	seen := make(map[C]struct{}, len(values))
	j := 0

	for _, n := range values {
		cmp := cb(n)
		if _, ok := seen[cmp]; ok {
			continue
		}
		seen[cmp] = struct{}{}
		values[j] = n
		j++
	}

	return values[:j]
}
