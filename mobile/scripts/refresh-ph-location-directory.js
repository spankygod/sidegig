const fs = require('node:fs')
const path = require('node:path')

const snapshotPath = path.join(__dirname, '..', 'data', 'ph-location-directory.json')

function readSnapshot() {
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
}

function writeSnapshot(snapshot) {
  fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot)}\n`)
}

function findCity(snapshot, cityName, provinceName) {
  const city = snapshot.cities.find((entry) => entry.name === cityName && entry.provinceName === provinceName)

  if (city == null) {
    throw new Error(`Unable to find city "${cityName}" in province "${provinceName}".`)
  }

  return city
}

function renameCity(snapshot, provinceName, previousName, nextName) {
  const alreadyRenamed = snapshot.cities.find((entry) => entry.name === nextName && entry.provinceName === provinceName)

  if (alreadyRenamed != null) {
    return
  }

  findCity(snapshot, previousName, provinceName).name = nextName
}

function renameBarangay(snapshot, provinceName, cityName, previousName, nextName) {
  const city = findCity(snapshot, cityName, provinceName)
  const barangayIndex = city.barangays.indexOf(previousName)

  if (barangayIndex < 0) {
    if (city.barangays.includes(nextName)) {
      return
    }

    throw new Error(`Unable to find barangay "${previousName}" in "${cityName}, ${provinceName}".`)
  }

  city.barangays[barangayIndex] = nextName
}

function removeBarangay(snapshot, provinceName, cityName, barangayName) {
  const city = findCity(snapshot, cityName, provinceName)
  city.barangays = city.barangays.filter((barangay) => barangay !== barangayName)
}

function moveProvinceToRegion(snapshot, provinceName, nextRegionName) {
  let matched = 0

  for (const city of snapshot.cities) {
    if (city.provinceName === provinceName) {
      city.regionName = nextRegionName
      matched += 1
    }
  }

  if (matched === 0) {
    throw new Error(`Unable to find province "${provinceName}" in snapshot.`)
  }
}

function dedupeAndSortBarangays(snapshot) {
  for (const city of snapshot.cities) {
    city.barangays = Array.from(new Set(city.barangays))
    city.barangays.sort((leftValue, rightValue) => leftValue.localeCompare(rightValue, 'en-PH'))
  }
}

function refreshSnapshot() {
  const snapshot = readSnapshot()

  renameCity(snapshot, 'Cagayan', 'Sanchez-Mira', 'Sanchez Mira')
  moveProvinceToRegion(snapshot, 'Sulu', 'Region IX (Zamboanga Peninsula)')

  renameBarangay(snapshot, 'Zamboanga del Sur', 'Lapuyan', 'Lubusan', 'Lubosan')
  renameBarangay(snapshot, 'Quezon', 'Calauag', 'Pinagsakahan', 'Pinagsakayan')
  renameBarangay(snapshot, 'Nueva Ecija', 'San Jose City', 'Villa Floresca', 'Villa Floresta')
  renameBarangay(snapshot, 'Agusan del Norte', 'Magallanes', 'Santo Niño', 'Sto. Niño')
  renameBarangay(snapshot, 'Agusan del Norte', 'Magallanes', 'Santo Rosario', 'Sto. Rosario')

  renameBarangay(snapshot, 'Catanduanes', 'Baras', 'Ginitligan', 'Genitligan')
  renameBarangay(snapshot, 'Benguet', 'Bokod', 'Ambuclao', 'Ambuklao')
  renameBarangay(snapshot, 'Benguet', 'Bokod', 'Daclan', 'Daklan')
  renameBarangay(snapshot, 'Bukidnon', 'Kitaotao', 'Santo Rosario', 'Sto. Rosario')
  renameBarangay(snapshot, 'Bukidnon', 'Manolo Fortich', 'Santo Niño', 'Sto. Niño')
  renameBarangay(snapshot, 'Bukidnon', 'City of Malaybalay', 'Saint Peter', 'St. Peter')
  renameBarangay(snapshot, 'Bukidnon', 'City of Malaybalay', 'Santo Niño', 'Sto. Niño')
  removeBarangay(snapshot, 'Batangas', 'City of Calaca', 'San Rafael')

  dedupeAndSortBarangays(snapshot)

  snapshot.source = 'Philippine Standard Geographic Code (PSGC)'
  snapshot.release = '2026-1Q'
  snapshot.generatedAt = new Date().toISOString()
  snapshot.cityCount = snapshot.cities.length
  snapshot.sourceNotes = [
    'Base snapshot: 2025-2Q PSGC directory.',
    'Official PSA release notices applied: Sulu transfer (2025-08-29), 2025 Q3 corrections, 2025 Q4 corrections, and 2026 Q1 corrections/merger.'
  ]

  writeSnapshot(snapshot)
}

refreshSnapshot()
