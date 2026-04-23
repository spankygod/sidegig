export type PhLocationCity = {
  code: string
  name: string
  provinceName: string
  regionName: string
  barangays: string[]
}

type PhLocationDirectorySnapshot = {
  source: string
  release: string
  generatedAt: string
  cityCount: number
  cities: PhLocationCity[]
}

type ResolvedLocationMatch = {
  provinceName: string
  cityName: string
  barangayName: string | null
}

type InternalPhLocationCity = PhLocationCity & {
  canonicalCityName: string
  canonicalProvinceName: string
  searchCityNames: string[]
  searchProvinceNames: string[]
}

const cityBrowseOverrides: Record<string, { cityName?: string; provinceName?: string }> = {
  '30100': { provinceName: 'Pampanga' },
  '30200': { provinceName: 'Negros Occidental' },
  '30300': { provinceName: 'Benguet' },
  '30400': { provinceName: 'Agusan del Norte' },
  '30500': { provinceName: 'Misamis Oriental' },
  '30600': { provinceName: 'Cebu' },
  '30700': { provinceName: 'Davao del Sur' },
  '30800': { provinceName: 'South Cotabato' },
  '30900': { provinceName: 'Lanao del Norte' },
  '31000': { provinceName: 'Iloilo' },
  '31100': { provinceName: 'Cebu' },
  '31200': { provinceName: 'Quezon' },
  '31300': { provinceName: 'Cebu' },
  '31400': { provinceName: 'Zambales' },
  '31500': { provinceName: 'Palawan' },
  '31600': { provinceName: 'Leyte' },
  '31700': { provinceName: 'Zamboanga del Sur' },
  '80100': { provinceName: 'Metro Manila' },
  '80200': { provinceName: 'Metro Manila' },
  '80300': { provinceName: 'Metro Manila' },
  '80400': { provinceName: 'Metro Manila' },
  '80500': { provinceName: 'Metro Manila' },
  '80700': { provinceName: 'Metro Manila' },
  '80800': { provinceName: 'Metro Manila' },
  '80900': { provinceName: 'Metro Manila' },
  '81000': { provinceName: 'Metro Manila' },
  '81100': { provinceName: 'Metro Manila' },
  '81200': { provinceName: 'Metro Manila' },
  '81300': { provinceName: 'Metro Manila' },
  '81400': { provinceName: 'Metro Manila' },
  '81500': { provinceName: 'Metro Manila' },
  '81600': { provinceName: 'Metro Manila' },
  '81701': { provinceName: 'Metro Manila' }
}

function toCommonCityLabel(cityName: string): string {
  if (cityName.startsWith('City of ')) {
    return `${cityName.slice('City of '.length)} City`
  }

  return cityName
}

function toInternalCity(city: PhLocationCity): InternalPhLocationCity {
  const canonicalProvinceName = city.provinceName.trim() === '' ? city.regionName.trim() : city.provinceName.trim()
  const canonicalCityName = city.name.trim()
  const browseOverride = cityBrowseOverrides[city.code]
  const browseProvinceName = browseOverride?.provinceName ?? canonicalProvinceName
  const browseCityName = browseOverride?.cityName ?? toCommonCityLabel(canonicalCityName)

  return {
    code: city.code,
    name: browseCityName,
    provinceName: browseProvinceName,
    canonicalCityName,
    canonicalProvinceName,
    regionName: city.regionName.trim(),
    barangays: city.barangays.map((barangay) => barangay.trim()).filter((barangay) => barangay !== ''),
    searchCityNames: Array.from(new Set([browseCityName, canonicalCityName])),
    searchProvinceNames: Array.from(new Set([browseProvinceName, canonicalProvinceName]))
  } satisfies InternalPhLocationCity
}

function buildManilaCity(manilaDistrictRows: PhLocationCity[]): InternalPhLocationCity {
  const districtNames = manilaDistrictRows
    .map((row) => row.name.trim())
    .filter((name) => name !== '' && name !== 'City of Manila')

  const barangays = Array.from(new Set(
    manilaDistrictRows.flatMap((row) => row.barangays.map((barangay) => barangay.trim()).filter((barangay) => barangay !== ''))
  )).sort((leftValue, rightValue) => leftValue.localeCompare(rightValue, 'en-PH'))

  return {
    code: '80600',
    name: 'Manila',
    provinceName: 'Metro Manila',
    canonicalCityName: 'City of Manila',
    canonicalProvinceName: 'City of Manila',
    regionName: 'National Capital Region (NCR)',
    barangays,
    searchCityNames: Array.from(new Set(['Manila', 'City of Manila', ...districtNames])),
    searchProvinceNames: ['Metro Manila', 'City of Manila']
  }
}

type LoadedDirectory = {
  snapshot: PhLocationDirectorySnapshot
  cities: InternalPhLocationCity[]
  provinceNames: string[]
}

let loadedDirectory: LoadedDirectory | null = null

function getLoadedDirectory(): LoadedDirectory {
  if (loadedDirectory != null) {
    return loadedDirectory
  }

  const snapshot = require('../data/ph-location-directory.json') as PhLocationDirectorySnapshot
  const manilaDistrictRows = snapshot.cities.filter((city) => city.provinceName.trim() === 'City of Manila')
  const cities = [
    ...snapshot.cities
      .filter((city) => city.provinceName.trim() !== 'City of Manila')
      .map(toInternalCity),
    ...(manilaDistrictRows.length === 0 ? [] : [buildManilaCity(manilaDistrictRows)])
  ].sort((leftValue, rightValue) => (
    leftValue.provinceName.localeCompare(rightValue.provinceName, 'en-PH') ||
    leftValue.name.localeCompare(rightValue.name, 'en-PH')
  ))

  const provinceNames = Array.from(
    new Set(cities.map((city) => city.provinceName))
  ).sort((leftValue, rightValue) => leftValue.localeCompare(rightValue, 'en-PH'))

  loadedDirectory = {
    snapshot,
    cities,
    provinceNames
  }

  return loadedDirectory
}

function normalizeLocationValue(value: string | null | undefined): string {
  return (value ?? '')
    .toLocaleLowerCase('en-PH')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getLocationDirectoryRelease(): string {
  return getLoadedDirectory().snapshot.release
}

export function listProvinceNames(): string[] {
  return getLoadedDirectory().provinceNames
}

export function listCitiesByProvince(provinceName: string): PhLocationCity[] {
  const { cities } = getLoadedDirectory()
  const normalizedProvinceName = normalizeLocationValue(provinceName)

  if (normalizedProvinceName === '') {
    return []
  }

  return cities
    .filter((city) => city.searchProvinceNames.some((candidate) => normalizeLocationValue(candidate) === normalizedProvinceName))
    .map(({ canonicalCityName: _canonicalCityName, canonicalProvinceName: _canonicalProvinceName, searchCityNames: _searchCityNames, searchProvinceNames: _searchProvinceNames, ...city }) => city)
}

export function findCityByProvinceAndName(provinceName: string, cityName: string): PhLocationCity | null {
  const { cities } = getLoadedDirectory()
  const normalizedProvinceName = normalizeLocationValue(provinceName)
  const normalizedCityName = normalizeLocationValue(cityName)

  if (normalizedProvinceName === '' || normalizedCityName === '') {
    return null
  }

  const city = cities.find((candidate) => (
    candidate.searchProvinceNames.some((provinceCandidate) => normalizeLocationValue(provinceCandidate) === normalizedProvinceName) &&
    candidate.searchCityNames.some((cityCandidate) => normalizeLocationValue(cityCandidate) === normalizedCityName)
  )) ?? null

  if (city == null) {
    return null
  }

  const { canonicalCityName: _canonicalCityName, canonicalProvinceName: _canonicalProvinceName, searchCityNames: _searchCityNames, searchProvinceNames: _searchProvinceNames, ...resolvedCity } = city
  return resolvedCity
}

export function listBarangaysByProvinceAndCity(provinceName: string, cityName: string): string[] {
  return findCityByProvinceAndName(provinceName, cityName)?.barangays ?? []
}

export function findLocationMatch(
  provinceName: string | null | undefined,
  cityName: string | null | undefined,
  barangayName: string | null | undefined
): ResolvedLocationMatch | null {
  const { cities } = getLoadedDirectory()
  const normalizedProvinceName = normalizeLocationValue(provinceName)
  const normalizedCityName = normalizeLocationValue(cityName)
  const normalizedBarangayName = normalizeLocationValue(barangayName)

  if (normalizedCityName === '') {
    return null
  }

  const cityCandidates = cities.filter((city) => (
    city.searchCityNames.some((candidate) => normalizeLocationValue(candidate) === normalizedCityName)
  ))

  if (cityCandidates.length === 0) {
    return null
  }

  if (normalizedProvinceName !== '') {
    const exactProvinceMatch = cityCandidates.find((city) => (
      city.searchProvinceNames.some((candidate) => normalizeLocationValue(candidate) === normalizedProvinceName)
    ))

    if (exactProvinceMatch != null) {
      const exactBarangayMatch = normalizedBarangayName === ''
        ? null
        : exactProvinceMatch.barangays.find((barangay) => normalizeLocationValue(barangay) === normalizedBarangayName) ?? null

      return {
        provinceName: exactProvinceMatch.provinceName,
        cityName: exactProvinceMatch.name,
        barangayName: exactBarangayMatch
      }
    }
  }

  if (normalizedBarangayName !== '') {
    const exactBarangayCandidates = cityCandidates.filter((city) => (
      city.barangays.some((barangay) => normalizeLocationValue(barangay) === normalizedBarangayName)
    ))

    if (exactBarangayCandidates.length === 1) {
      const matchedCity = exactBarangayCandidates[0]
      const matchedBarangay = matchedCity.barangays.find((barangay) => normalizeLocationValue(barangay) === normalizedBarangayName) ?? null

      return {
        provinceName: matchedCity.provinceName,
        cityName: matchedCity.name,
        barangayName: matchedBarangay
      }
    }
  }

  if (cityCandidates.length === 1) {
    return {
      provinceName: cityCandidates[0].provinceName,
      cityName: cityCandidates[0].name,
      barangayName: null
    }
  }

  return null
}
