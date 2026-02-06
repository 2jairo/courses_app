package entity

type FileMetadataKindImageResolutionVariant string

const (
	FileMetadataKindImageResolutionVariantThumbnail FileMetadataKindImageResolutionVariant = "thumbnail"
	FileMetadataKindImageResolutionVariantSmall     FileMetadataKindImageResolutionVariant = "small"
	FileMetadataKindImageResolutionVariantLarge     FileMetadataKindImageResolutionVariant = "large"
	FileMetadataKindImageResolutionVariantNative    FileMetadataKindImageResolutionVariant = "native"
)

func (v FileMetadataKindImageResolutionVariant) IsValid() bool {
	return FileMetadataKindImageResolutionVariantThumbnail == v ||
		FileMetadataKindImageResolutionVariantSmall == v ||
		FileMetadataKindImageResolutionVariantLarge == v ||
		FileMetadataKindImageResolutionVariantNative == v
}

type FileMetadataKindImage struct {
	Resolutions map[FileMetadataKindImageResolutionVariant]FileMetadataKindImageResolution `json:"resolutions"`
}

type FileMetadataKindImageResolution struct {
	Width  int32  `json:"w"`
	Height int32  `json:"h"`
	Path   string `json:"path"`
}

func (self *FileMetadataKindImage) indexOfVariant(v FileMetadataKindImageResolutionVariant) int32 {
	order := map[FileMetadataKindImageResolutionVariant]int32{
		FileMetadataKindImageResolutionVariantThumbnail: 0,
		FileMetadataKindImageResolutionVariantSmall:     1,
		FileMetadataKindImageResolutionVariantLarge:     2,
		FileMetadataKindImageResolutionVariantNative:    3,
	}
	if o, ok := order[v]; ok {
		return o
	}
	return -1
}

func (self *FileMetadataKindImage) ChooseClosestImageResolution(
	res FileMetadataKindImageResolutionVariant,
) *FileMetadataKindImageResolution {
	if r, ok := self.Resolutions[res]; ok {
		return &r
	}

	if len(self.Resolutions) == 0 {
		return nil
	}

	targetIndex := self.indexOfVariant(res)
	if targetIndex == -1 {
		return nil
	}

	var (
		closest FileMetadataKindImageResolutionVariant
		found   bool
		minDiff = int32(^uint32(0) >> 1)
	)

	for variant := range self.Resolutions {
		idx := self.indexOfVariant(variant)
		if idx == -1 {
			continue
		}

		diff := abs(idx - targetIndex)
		if diff < minDiff {
			minDiff = diff
			closest = variant
			found = true
		}
	}

	if !found {
		return nil
	}

	r := self.Resolutions[closest]
	return &r
}

func abs(x int32) int32 {
	if x < 0 {
		return -x
	}
	return x
}
