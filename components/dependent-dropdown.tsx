"use client"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { MapPin, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFormTranslations } from "@/lib/form-service"
import administrations from "@/components/Administrations.json"

type DistrictMap = Record<string, string[]>
type SectorMap = Record<string, string[]>
type CellMap = Record<string, string[]>
type VillageMap = Record<string, string[]>

interface DependentDropdownProps {
  value?: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  onChange: (address: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }) => void
  onBlur?: () => void
  required?: boolean
  error?: boolean
  lang?: string
}

export function DependentDropdown({
  value = {},
  onChange,
  onBlur,
  required = false,
  error = false,
  lang = 'en'
}: DependentDropdownProps) {
  // Get translations
  const translations = getFormTranslations(lang)

  const getProvinceDisplay = (province: string): string => {
    if (lang === 'rw') {
      if (province === "Eastern") return "Uburasirazuba"
      if (province === "Northern") return "Amajyaruguru"
    }
    return province
  }

  const getLocationDisplay = (location: string): string => {
    if (lang === 'rw') {
      // Province translations
      if (location === "Eastern") return "Uburasirazuba"
      if (location === "Northern") return "Amajyaruguru"

      // District translations
      if (location === "Nyagatare") return "Nyagatare"
      if (location === "Musanze") return "Musanze"

      // Sector translations
      if (location === "Karama") return "Karama"
      if (location === "Rwimiyaga") return "Rwimiyaga"
      if (location === "Busogo") return "Busogo"

      // Cell translations for Busogo sector
      if (location === "Gisesero") return "Gisesero"
      if (location === "Kavumu") return "Kavumu"
      if (location === "Nyagisozi") return "Nyagisozi"
      if (location === "Sahara") return "Sahara"

      // Village translations for Busogo sector
      if (location === "Gahanga") return "Gahanga"
      if (location === "Jabiro") return "Jabiro"
      if (location === "Kabaya") return "Kabaya"
      if (location === "Nengo") return "Nengo"
      if (location === "Gatovu") return "Gatovu"
      if (location === "Karema") return "Karema"
      if (location === "Karuriza") return "Karuriza"
      if (location === "Mutaboneka") return "Mutaboneka"
      if (location === "Rugeshi") return "Rugeshi"
      if (location === "Cyasure") return "Cyasure"
      if (location === "Gora") return "Gora"
      if (location === "Kabwenge") return "Kabwenge"
      if (location === "Kirezi") return "Kirezi"
      if (location === "Rurembo") return "Rurembo"
      if (location === "Nyarubuye") return "Nyarubuye"
      if (location === "Nyiragaju") return "Nyiragaju"
      if (location === "Rubaya") return "Rubaya"
      if (location === "Ryamukutsi") return "Ryamukutsi"

      // ... rest of existing translations ...
    }
    return location
  }

  // Use the value prop directly instead of trying to extract from formData
  const [selectedProvince, setSelectedProvince] = useState(getProvinceDisplay(value.province || ""))
  const [selectedDistrict, setSelectedDistrict] = useState(value.district || "")
  const [selectedSector, setSelectedSector] = useState(value.sector || "")
  const [selectedCell, setSelectedCell] = useState(getLocationDisplay(value.cell || ""))
  const [selectedVillage, setSelectedVillage] = useState(getLocationDisplay(value.village || ""))

  // Sync local state with value prop changes
  useEffect(() => {
    setSelectedProvince(getProvinceDisplay(value.province || ""))
  }, [value.province, lang])

  useEffect(() => {
    setSelectedDistrict(value.district || "")
  }, [value.district])

  useEffect(() => {
    setSelectedSector(value.sector || "")
  }, [value.sector])

  useEffect(() => {
    setSelectedCell(getLocationDisplay(value.cell || ""))
  }, [value.cell])

  useEffect(() => {
    setSelectedVillage(getLocationDisplay(value.village || ""))
  }, [value.village])

  type AdminData = Record<string, Record<string, Record<string, Record<string, string[]>>>>
  const adminData = administrations as AdminData
  const provinces = Object.keys(adminData)

  const getDistricts = (province?: string): string[] =>
    province && adminData[province] ? Object.keys(adminData[province]) : []

  const getSectors = (province?: string, district?: string): string[] =>
    province && district && adminData[province]?.[district]
      ? Object.keys(adminData[province][district])
      : []

  const getCells = (province?: string, district?: string, sector?: string): string[] =>
    province && district && sector && adminData[province]?.[district]?.[sector]
      ? Object.keys(adminData[province][district][sector])
      : []

  const getVillages = (province?: string, district?: string, sector?: string, cell?: string): string[] =>
    province && district && sector && cell && adminData[province]?.[district]?.[sector]?.[cell]
      ? adminData[province][district][sector][cell]
      : []

  const districts: DistrictMap = {
    Eastern: ["Nyagatare"],
    Northern: ["Musanze"],
    "Uburasirazuba": ["Nyagatare"],
    "Amajyaruguru": ["Musanze"]
  }
  const sectors: SectorMap = {
    "Musanze": ["Busogo", "Muhoza", "Rwaza", "Nkotsi"],
    Gasabo: ["Gisozi", "Remera", "Kimironko"],
    Kicukiro: ["Gahanga", "Masaka", "Niboye"],
    Nyarugenge: ["Nyamirambo", "Kigali", "Muhima"],
    Huye: ["Ngoma", "Mukura", "Tumba"],
    Nyanza: ["Busasamana", "Muyira", "Cyabakamyi"],
    Gisagara: ["Mamba", "Kansi", "Ndora"],
    Gicumbi: ["Byumba", "Kageyo", "Mukarange"],
    Rulindo: ["Base", "Tumba", "Shyorongi"],
    Kayonza: ["Mukarange", "Kabare", "Rukara"],
    Nyagatare: ["Nyagatare", "Rwimiyaga", "Karama", "Rukomo"],
    Rwamagana: ["Muhazi", "Mununu"],
    Rubavu: ["Gisenyi", "Kanama", "Nyamyumba"],
    Rusizi: ["Gikundamvura", "Mururu", "Bugarama"],
    Karongi: ["Rubengera", "Mubuga", "Gishyita"],
  }
  const cells: CellMap = {
    "Busogo": ["Gisesero", "Kavumu", "Nyagisozi", "Sahara"],
    "Rwaza": ["Bumara", "Kabushinge", "Musezero", "Nturo", "Nyarubuye"],
    "Muhoza": ["Cyabararika", "Kigombe", "Mpenge", "Ruhengeri"],
    "Nkotsi": ["Bikara", "Gashinga", "Mubago", "Rugeshi", "Ruyumba"],

    Gisozi: ["Rukiri I", "Rukiri II", "Rukiri III"],
    Remera: ["Rukatsa", "Rwandex", "Umucyo"],
    Kimironko: ["Bibare", "Nyagatovu", "Rugando"],
    Gahanga: ["Gahanga", "Nyakabanda", "Rugarama"],
    Masaka: ["Masaka I", "Masaka II", "Masaka III"],
    Niboye: ["Niboye I", "Niboye II", "Niboye III"],
    Nyamirambo: ["Nyamirambo I", "Nyamirambo II", "Nyamirambo III"],
    Kigali: ["Kigali I", "Kigali II", "Kigali III"],
    Muhima: ["Muhima I", "Muhima II", "Muhima III"],
    Ngoma: ["Ngoma I", "Ngoma II", "Ngoma III"],
    Mukura: ["Mukura I", "Mukura II", "Mukura III"],
    Tumba: ["Tumba I", "Tumba II", "Tumba III"],
    Busasamana: ["Busasamana I", "Busasamana II", "Busasamana III"],
    Muyira: ["Muyira I", "Muyira II", "Muyira III"],
    Cyabakamyi: ["Cyabakamyi I", "Cyabakamyi II", "Cyabakamyi III"],
    Mamba: ["Mamba I", "Mamba II", "Mamba III"],
    Kansi: ["Kansi I", "Kansi II", "Kansi III"],
    Ndora: ["Ndora I", "Ndora II", "Ndora III"],
    Kinigi: ["Kinigi I", "Kinigi II", "Kinigi III"],
    Shingiro: ["Shingiro I", "Shingiro II", "Shingiro III"],
    Byumba: ["Byumba I", "Byumba II", "Byumba III"],
    Kageyo: ["Kageyo I", "Kageyo II", "Kageyo III"],
    Mukarange: ["Mukarange I", "Mukarange II", "Mukarange III"],
    Base: ["Base I", "Base II", "Base III"],
    Shyorongi: ["Shyorongi I", "Shyorongi II", "Shyorongi III"],
    Kabare: ["Kabare I", "Kabare II", "Kabare III"],
    Rukara: ["Rukara I", "Rukara II", "Rukara III"],
    Gatunda: ["Gatunda I", "Gatunda II", "Gatunda III"],
    Karama: ["Bushara", "Cyenkwanzi", "Gikagati", "Gikundamvura", "Kabuga", "Ndego", "Nyakiga"],
    Matimba: ["Matimba I", "Matimba II", "Matimba III"],
    Muhazi: ["Muhazi I", "Muhazi II", "Muhazi III"],
    Gishari: ["Gishari I", "Gishari II", "Gishari III"],
    Mununu: ["Mununu I", "Mununu II", "Mununu III"],
    Gisenyi: ["Gisenyi I", "Gisenyi II", "Gisenyi III"],
    Kanama: ["Kanama I", "Kanama II", "Kanama III"],
    Nyamyumba: ["Village 2731", "Village 2741", "Village 2751"],
    Gikundamvura: ["Village 2821", "Village 2831", "Village 2841"],
    Mururu: ["Village 2911", "Village 2921", "Village 2931"],
    Bugarama: ["Village 3001", "Village 3011", "Village 3021"],
    Rubengera: ["Village 3091", "Village 3101", "Village 3111"],
    Mubuga: ["Village 3181", "Village 3191", "Village 3201"],
    Gishyita: ["Village 3271", "Village 3281", "Village 3291"],
    Nyagatare: ["Barija", "Bushoga", "Cyabayaga", "Gakirage", "Kamagiri", "Nsheke", "Nyagatare", "Rutaraka", "Ryabega", ],
    Rukomo: ["Gahurura", "Gashenyi", "Nyakagarama", "Rukomo II", "Rurenge"],
    Rwimiyaga: ["Gacundezi", "Kabeza", "Kirebe", "Ntoma", "Nyarupfubire", "Nyendo", "Rutungu", "Rwimiyaga"],
  }
  const villages: VillageMap = {
    // Adding Busogo sector's cells and their villages
    "Gisesero_Busogo": [
      "Gahanga",
      "Jabiro",
      "Kabaya",
      "Nengo"
    ],
    "Kavumu_Busogo": [
      "Gatovu",
      "Karema",
      "Karuriza",
      "Mutaboneka",
      "Rugeshi"
    ],
    "Nyagisozi_Busogo": [
      "Cyasure",
      "Gora",
      "Kabwenge",
      "Kirezi",
      "Rurembo"
    ],
    "Sahara_Busogo": [
      "Nyarubuye",
      "Nyiragaju",
      "Rubaya",
      "Ryamukutsi"
    ],
    // Adding Karama sector's cells and their villages
    "Bushara_Karama": [
      "Bushara Centre",
      "Ihuriro",
      "Isangano",
      "Kadendegeri",
      "Meshero",
      "Rurembo",
      "Uruyenzi"
    ],
    "Cyenkwanzi_Karama": ["Cyenkwanzi Centre", "Kabeza", "Kiyovu", "Rurembo"],
    "Gikagati_Karama": [
      "Bigega",
      "Gataba",
      "Gikagati Centre",
      "Gishenyi",
      "Kanunga",
      "Nyabitare",
      "Nyakibande",
      "Rurembo",
      "Rutegamatwi"
    ],
    "Gikundamvura_Karama": [
      "Fene",
      "Gikundamvura I",
      "Gikundamvura II",
      "Irebero",
      "Isangano",
      "Kukibuye",
      "Kukimpundu",
      "Musenyi",
      "Nyabitare",
      "Nyagasharara",
      "Umutara",
      "Urugwiro"
    ],
    "Kabuga_Karama": [
      "Gakukuru",
      "Kabeza",
      "Kabuga",
      "Kizunguruko",
      "Nyakibande",
      "Nyamirama",
      "Rukamba",
      "Rwebishirira",
      "Rwubuzizi"
    ],
    "Ndego_Karama": [
      "Gakirage",
      "Kababanda",
      "Kanyami",
      "Matereza",
      "Mishasha",
      "Murambi",
      "Mutete",
      "Ndego",
      "Rubanda",
      "Rusoroza",
      "Rutoma"
    ],
    "Nyakiga_Karama": [
      "Humure",
      "Kabeza",
      "Kanunga",
      "Karama Centre",
      "Kavumu",
      "Kentarama",
      "Mabare"
    ],
    Barija: ["Barija A", "Barija B", "Burumba", "Kinihira"],
    Bushoga: ["Bushoga", "Cyabahanga", "Cyonyo", "Ruhuha I", "Ruhuha II", "Ryinkuyu"],
    Cyabayaga: ["Akamonyi", "Bihinga", "Cyabayaga", "Nyakabuye", "Urugero"],
    Gakirage: ["Gakirage", "Kiboga I", "Kiboga II", "Mihingo", "Nkongi", "Urumuri"],
    Kamagiri: ["Kamagiri", "Karungi", "Nkerenke"],
    Nsheke: ["Kabare", "Nsheke", "Nyegeza"],
    Nyagatare: ["Mirama I", "Mirama II", "Nyagatare I", "Nyagatare II", "Nyagatare III"],
    Rutaraka: ["Gihorobwa", "Mugari", "Nkonji", "Rutaraka", "Ryabega"],
    Ryabega: ["Marongero", "Rugendo", "Ryabega"],
    "Rukiri I": ["Village A", "Village B", "Village C"],
    "Rukiri II": ["Village D", "Village E", "Village F"],
    "Rukiri III": ["Village G", "Village H", "Village I"],
    Rukatsa: ["Village J", "Village K", "Village L"],
    Rwandex: ["Village M", "Village N", "Village O"],
    Umucyo: ["Village P", "Village Q", "Village R"],
    Bibare: ["Village S", "Village T", "Village U"],
    Nyagatovu: ["Village V", "Village W", "Village X"],
    Rugando: ["Village Y", "Village Z", "Village AA"],
    Gahanga: ["Village BB", "Village CC", "Village DD"],
    Nyakabanda: ["Village EE", "Village FF", "Village GG"],
    Rugarama: ["Village HH", "Village II", "Village JJ"],
    "Masaka I": ["Village KK", "Village LL", "Village MM"],
    "Masaka II": ["Village NN", "Village OO", "Village PP"],
    "Masaka III": ["Village QQ", "Village RR", "Village SS"],
    "Niboye I": ["Village TT", "Village UU", "Village VV"],
    "Niboye II": ["Village WW", "Village XX", "Village YY"],
    "Niboye III": ["Village ZZ", "Village 11", "Village 22"],
    "Nyamirambo I": ["Village 33", "Village 44", "Village 55"],
    "Nyamirambo II": ["Village 66", "Village 77", "Village 88"],
    "Nyamirambo III": ["Village 99", "Village 101", "Village 111"],
    "Kigali I": ["Village 121", "Village 131", "Village 141"],
    "Kigali II": ["Village 151", "Village 161", "Village 171"],
    "Kigali III": ["Village 181", "Village 191", "Village 201"],
    "Muhima I": ["Village 211", "Village 221", "Village 231"],
    "Muhima II": ["Village 241", "Village 251", "Village 261"],
    "Muhima III": ["Village 271", "Village 281", "Village 291"],
    "Ngoma I": ["Village 301", "Village 311", "Village 321"],
    "Ngoma II": ["Village 331", "Village 341", "Village 351"],
    "Ngoma III": ["Village 361", "Village 371", "Village 381"],
    "Mukura I": ["Village 391", "Village 401", "Village 411"],
    "Mukura II": ["Village 421", "Village 431", "Village 441"],
    "Mukura III": ["Village 451", "Village 461", "Village 471"],
    "Tumba I": ["Village 481", "Village 491", "Village 501"],
    "Tumba II": ["Village 511", "Village 521", "Village 531"],
    "Tumba III": ["Village 541", "Village 551", "Village 561"],
    "Busasamana I": ["Village 571", "Village 581", "Village 591"],
    "Busasamana II": ["Village 601", "Village 611", "Village 621"],
    "Busasamana III": ["Village 631", "Village 641", "Village 651"],
    "Muyira I": ["Village 661", "Village 671", "Village 681"],
    "Muyira II": ["Village 691", "Village 701", "Village 711"],
    "Muyira III": ["Village 721", "Village 731", "Village 741"],
    "Cyabakamyi I": ["Village 751", "Village 761", "Village 771"],
    "Cyabakamyi II": ["Village 781", "Village 791", "Village 801"],
    "Cyabakamyi III": ["Village 811", "Village 821", "Village 831"],
    "Mamba I": ["Village 841", "Village 851", "Village 861"],
    "Mamba II": ["Village 871", "Village 881", "Village 891"],
    "Mamba III": ["Village 901", "Village 911", "Village 921"],
    "Kansi I": ["Village 931", "Village 941", "Village 951"],
    "Kansi II": ["Village 961", "Village 971", "Village 981"],
    "Kansi III": ["Village 991", "Village 1001", "Village 1011"],
    "Ndora I": ["Village 1021", "Village 1031", "Village 1041"],
    "Ndora II": ["Village 1051", "Village 1061", "Village 1071"],
    "Ndora III": ["Village 1081", "Village 1091", "Village 1101"],
    "Kinigi I": ["Village 1201", "Village 1211", "Village 1221"],
    "Kinigi II": ["Village 1231", "Village 1241", "Village 1251"],
    "Kinigi III": ["Village 1261", "Village 1271", "Village 1281"],
    "Shingiro I": ["Village 1291", "Village 1301", "Village 1311"],
    "Shingiro II": ["Village 1321", "Village 1331", "Village 1341"],
    "Shingiro III": ["Village 1351", "Village 1361", "Village 1371"],
    "Byumba I": ["Village 1381", "Village 1391", "Village 1401"],
    "Byumba II": ["Village 1411", "Village 1421", "Village 1431"],
    "Byumba III": ["Village 1441", "Village 1451", "Village 1461"],
    "Kageyo I": ["Village 1471", "Village 1481", "Village 1491"],
    "Kageyo II": ["Village 1501", "Village 1511", "Village 1521"],
    "Kageyo III": ["Village 1531", "Village 1541", "Village 1551"],
    "Mukarange I": ["Village 1561", "Village 1571", "Village 1581"],
    "Mukarange II": ["Village 1591", "Village 1601", "Village 1611"],
    "Mukarange III": ["Village 1621", "Village 1631", "Village 1641"],
    "Base I": ["Village 1651", "Village 1661", "Village 1671"],
    "Base II": ["Village 1681", "Village 1691", "Village 1701"],
    "Base III": ["Village 1711", "Village 1721", "Village 1731"],
    "Shyorongi I": ["Village 1741", "Village 1751", "Village 1761"],
    "Shyorongi II": ["Village 1771", "Village 1781", "Village 1791"],
    "Shyorongi III": ["Village 1801", "Village 1811", "Village 1821"],
    "Kabare I": ["Village 1831", "Village 1841", "Village 1851"],
    "Kabare II": ["Village 1861", "Village 1871", "Village 1881"],
    "Kabare III": ["Village 1891", "Village 1901", "Village 1911"],
    "Rukara I": ["Village 1921", "Village 1931", "Village 1941"],
    "Rukara II": ["Village 1951", "Village 1961", "Village 1971"],
    "Rukara III": ["Village 1981", "Village 1991", "Village 2001"],
    "Gatunda I": ["Village 2011", "Village 2021", "Village 2031"],
    "Gatunda II": ["Village 2041", "Village 2051", "Village 2061"],
    "Gatunda III": ["Village 2071", "Village 2081", "Village 2091"],
    "Karama I": ["Village 2101", "Village 2111", "Village 2121"],
    "Karama II": ["Village 2131", "Village 2141", "Village 2151"],
    "Karama III": ["Village 2161", "Village 2171", "Village 2181"],
    "Matimba I": ["Village 2191", "Village 2201", "Village 2211"],
    "Matimba II": ["Village 2221", "Village 2231", "Village 2241"],
    "Matimba III": ["Village 2251", "Village 2261", "Village 2271"],
    "Muhazi I": ["Village 2281", "Village 2291", "Village 2301"],
    "Muhazi II": ["Village 2311", "Village 2321", "Village 2331"],
    "Muhazi III": ["Village 2341", "Village 2351", "Village 2361"],
    "Gishari I": ["Village 2371", "Village 2381", "Village 2391"],
    "Gishari II": ["Village 2401", "Village 2411", "Village 2421"],
    "Gishari III": ["Village 2431", "Village 2441", "Village 2451"],
    "Mununu I": ["Village 2461", "Village 2471", "Village 2481"],
    "Mununu II": ["Village 2491", "Village 2501", "Village 2511"],
    "Mununu III": ["Village 2521", "Village 2531", "Village 2541"],
    "Gisenyi I": ["Village 2551", "Village 2561", "Village 2571"],
    "Gisenyi II": ["Village 2581", "Village 2591", "Village 2601"],
    "Gisenyi III": ["Village 2611", "Village 2621", "Village 2631"],
    "Kanama I": ["Village 2641", "Village 2651", "Village 2661"],
    "Kanama II": ["Village 2671", "Village 2681", "Village 2691"],
    "Kanama III": ["Village 2701", "Village 2711", "Village 2721"],
    "Nyamyumba I": ["Village 2731", "Village 2741", "Village 2751"],
    "Nyamyumba II": ["Village 2761", "Village 2771", "Village 2781"],
    "Nyamyumba III": ["Village 2791", "Village 2801", "Village 2811"],
    "Gikundamvura I": ["Village 2821", "Village 2831", "Village 2841"],
    "Gikundamvura II": ["Village 2851", "Village 2861", "Village 2871"],
    "Gikundamvura III": ["Village 2881", "Village 2891", "Village 2901"],
    "Mururu I": ["Village 2911", "Village 2921", "Village 2931"],
    "Mururu II": ["Village 2941", "Village 2951", "Village 2961"],
    "Mururu III": ["Village 2971", "Village 2981", "Village 2991"],
    "Bugarama I": ["Village 3001", "Village 3011", "Village 3021"],
    "Bugarama II": ["Village 3031", "Village 3041", "Village 3051"],
    "Bugarama III": ["Village 3061", "Village 3071", "Village 3081"],
    "Rubengera I": ["Village 3091", "Village 3101", "Village 3111"],
    "Rubengera II": ["Village 3121", "Village 3131", "Village 3141"],
    "Rubengera III": ["Village 3151", "Village 3161", "Village 3171"],
    "Mubuga I": ["Village 3181", "Village 3191", "Village 3201"],
    "Mubuga II": ["Village 3211", "Village 3221", "Village 3231"],
    "Mubuga III": ["Village 3241", "Village 3251", "Village 3261"],
    "Gishyita I": ["Village 3271", "Village 3281", "Village 3291"],
    "Gishyita II": ["Village 3301", "Village 3311", "Village 3321"],
    "Gishyita III": ["Village 3331", "Village 3341", "Village 3351"],
    Gahurura: ["Amahoro", "Busasamana", "Isangano", "Nomero I", "Rambura", "Ruyonza", "Ubumwe", "Urugwiro", "Urukundo", "Urumuri"],
    Gashenyi: ["Agasasa", "Bukamba", "Gashenyi", "Gisenyi", "Huriro", "Isangano", "Kiyovu", "Murore", "Nyamirambo", "Rebero", "Rukomo", "Rurembo"],
    Nyakagarama: ["Akamashama", "Akamasheka", "Amahoro", "Amizero", "Gashenyi", "Gashura", "Isangano", "Karugondo", "Kayenzi", "Musenyi", "Nyakagarama", "Nyamworoma"],
    "Rukomo II": ["Amahoro", "Berwa", "Isangano", "Kabeza", "Mwurirwa", "Nyange", "Nyarubuye", "Nyarurama", "Rebero", "Rugabano"],
    Rurenge: ["Akajuka", "Benishyaka", "Biryogo", "Kabeza", "Kabusunzu", "Nyabwunyu", "Nyamirambo", "Rurenge", "Rushashi", "Rwiju"],
    "Bumara": ["Gisorora", "Kabuye", "Kavumu", "Muheta", "Nyakarambi II"],
    "Kabushinge": ["Busana", "Gihango", "Kabuga", "Murambi", "Nyagisozi", "Nyarugando", "Ramba", "Rwamigimbu"],
    "Musezero": ["Kamabuye", "Kansenda", "Kibingo", "Kiganda", "Mataba", "Mutara", "Nyakarambi I"],
    "Nturo": ["Gakenke", "Mugogo", "Rubabi", "Rugari", "Rugogwe", "Ruvumu"],
    "Nyarubuye": ["Buhama", "Bukoro", "Kanama", "Murambi", "Ngege", "Rusaki", "Sayo"],
    "Bushara": [
      "Bushara Centre",
      "Ihuriro",
      "Isangano",
      "Kadendegeri",
      "Meshero",
      "Rurembo",
      "Uruyenzi"
    ],
    "Cyenkwanzi": ["Cyenkwanzi Centre", "Kabeza", "Kiyovu", "Rurembo"],
    "Gikagati": [
      "Bigega",
      "Gataba",
      "Gikagati Centre",
      "Gishenyi",
      "Kanunga",
      "Nyabitare",
      "Nyakibande",
      "Rurembo",
      "Rutegamatwi"
    ],
    "Gikundamvura": [
      "Fene",
      "Gikundamvura I",
      "Gikundamvura II",
      "Irebero",
      "Isangano",
      "Kukibuye",
      "Kukimpundu",
      "Musenyi",
      "Nyabitare",
      "Nyagasharara",
      "Umutara",
      "Urugwiro"
    ],
    "Kabuga": [
      "Gakukuru",
      "Kabeza",
      "Kabuga",
      "Kizunguruko",
      "Nyakibande",
      "Nyamirama",
      "Rukamba",
      "Rwebishirira",
      "Rwubuzizi"
    ],
    "Ndego": [
      "Gakirage",
      "Kababanda",
      "Kanyami",
      "Matereza",
      "Mishasha",
      "Murambi",
      "Mutete",
      "Ndego",
      "Rubanda",
      "Rusoroza",
      "Rutoma"
    ],
    "Nyakiga": [
      "Humure",
      "Kabeza",
      "Kanunga",
      "Karama Centre",
      "Kavumu",
      "Kentarama",
      "Mabare"
    ],
    // Adding Rwimiyaga sector's cells and their villages
    "Gacundezi_Rwimiyaga": [
      "Bugaragara",
      "Gacundezi I",
      "Gacundezi II",
      "Rukundo I",
      "Rukundo II",
      "Rukundo III"
    ],
    "Kabeza_Rwimiyaga": [
      "Gatovu",
      "Kabeza",
      "Kabeza Centre",
      "Kavumu",
      "Rugarama",
      "Rukiri I",
      "Rukiri II"
    ],
    "Kirebe_Rwimiyaga": [
      "Gatebe I",
      "Gatebe II",
      "Kirebe",
      "Rukindo"
    ],
    "Ntoma_Rwimiyaga": [
      "Gashwenu",
      "Kibuye",
      "Kimaramu",
      "Nyampire",
      "Rwembogo"
    ],
    "Nyarupfubire_Rwimiyaga": [
      "Kamagiri",
      "Nyakagando I",
      "Nyakagando II",
      "Nyarupfubire I",
      "Nyarupfubire II",
      "Rwimiyaga I",
      "Rwimiyaga II"
    ],
    "Nyendo_Rwimiyaga": [
      "Isangano",
      "Nyamirama",
      "Rebero",
      "Remera"
    ],
    "Rutungu_Rwimiyaga": [
      "Bwera",
      "Cyamunyana",
      "Gakagati I",
      "Gakagati II",
      "Rubira"
    ],
    "Rwimiyaga_Rwimiyaga": [
      "Byimana",
      "Gakoma",
      "Kizungu",
      "Mahoro",
      "Muyange",
      "Rebero",
      "Rwinyange"
    ],
    
    // Adding Muhoza sector's cells and their villages
    "Cyabararika": [
      "Buhuye",
      "Bwuzuri", 
      "Gasanze",
      "Gatare",
      "Gatorwa",
      "Kabogobogo",
      "Yorodani"
    ],
    "Kigombe": [
      "Kavumu",
      "Kiryi",
      "Mugara",
      "Nduruma",
      "Nyamagumba",
      "Nyamuremure",
      "Rukereza"
    ],
    "Mpenge": [
      "Gikwege",
      "Giramahoro",
      "Mpenge",
      "Rukoro",
      "Rusagara"
    ],
    "Ruhengeri": [
      "Buhoro",
      "Burera",
      "Bushozi",
      "Byimana",
      "Kabaya",
      "Muhe",
      "Susa"
    ],
    
    // Adding Nkotsi sector's cells and their villages
    "Bikara": [
      "Barizo",
      "Kabaya",
      "Karambi",
      "Kindiki",
      "Kinkware",
      "Kiruhura",
      "Nyakinama",
      "Rubindi"
    ],
    "Gashinga": [
      "Buhanga",
      "Gitaraga",
      "Kabasaza",
      "Musebeya"
    ],
    "Mubago": [
      "Bugugu",
      "Buhamo",
      "Musembe",
      "Nyagahondo",
      "Nyarubingo"
    ],
    "Rugeshi": [
      "Bigabiro",
      "Gahanga",
      "Gasebeya",
      "Karambo",
      "Mucyamo",
      "Mutuzo"
    ],
    "Ruyumba": [
      "Cyivugiza",
      "Gasiza",
      "Kamusheshe",
      "Murindi",
      "Nyakigezi"
    ]
  }

  const getProvinceKey = (province: string): string => {
    if (province === "Uburasirazuba") return "Eastern"
    if (province === "Amajyaruguru") return "Northern"
    return province
  }

  const handleProvinceChange = (province: string) => {
    console.log(`🏛️ Province changed to: ${province}`)
    setSelectedProvince(province)
    setSelectedDistrict("")
    setSelectedSector("")
    setSelectedCell("")
    setSelectedVillage("")

    const newLocationData = {
      province: province,
      district: "",
      sector: "",
      cell: "",
      village: "",
    }
    console.log(`🏛️ Calling onChange with:`, newLocationData)
    onChange(newLocationData)
  }

  const handleDistrictChange = (district: string) => {
    console.log(`🏘️ District changed to: ${district}`)
    setSelectedDistrict(district)
    setSelectedSector("")
    setSelectedCell("")
    setSelectedVillage("")

    const newLocationData = {
      province: selectedProvince,
      district,
      sector: "",
      cell: "",
      village: "",
    }
    console.log(`🏘️ Calling onChange with:`, newLocationData)
    onChange(newLocationData)
  }

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector)
    setSelectedCell("")
    setSelectedVillage("")

    onChange({
      ...value,
      sector: sector,
      cell: "",
      village: ""
    })
  }

  const handleCellChange = (cell: string) => {
    setSelectedCell(cell)
    setSelectedVillage("")

    // For sectors with special handling, append sector name to the cell name when looking up villages
    let cellKey = cell
    if (selectedSector === "Karama") {
      cellKey = `${cell}_Karama`
    } else if (selectedSector === "Rwimiyaga") {
      cellKey = `${cell}_Rwimiyaga`
    } else if (selectedSector === "Busogo") {
      cellKey = `${cell}_Busogo`
    }

    onChange({
      ...value,
      cell: cell,
      village: ""
    })
  }

  const handleVillageChange = (village: string) => {
    setSelectedVillage(village)
    onChange({
      ...value,
      village: village
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <div className="p-2 bg-blue-50 rounded-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{translations.questions.addressInfo.placeholder}</h3>
        </div>
      </div>

      {/* Address Fields Grid */}
      <div className="grid grid-cols-4 md:grid-cols-2 gap-6">
        {/* Province */}
        <div className="space-y-2">
          <Label htmlFor="province" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              1
            </span>
            {translations.questions.province.label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger
              className={`transition-all duration-200 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue placeholder={translations.questions.province.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              2
            </span>
            {translations.questions.district.label} {required && <span className="text-red-500">*</span>}
            {selectedProvince && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </Label>
          <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedProvince}>
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedProvince ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue placeholder={!selectedProvince ? translations.questions.province.placeholder : translations.questions.district.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectedProvince &&
                getDistricts(selectedProvince).map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label htmlFor="sector" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              3
            </span>
            {translations.questions.sector.label} {required && <span className="text-red-500">*</span>}
            {selectedDistrict && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </Label>
          <Select value={selectedSector} onValueChange={handleSectorChange} disabled={!selectedDistrict}>
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedDistrict ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue placeholder={!selectedDistrict ? translations.questions.district.placeholder : translations.questions.sector.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectedDistrict &&
                getSectors(selectedProvince, selectedDistrict).map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cell */}
        <div className="space-y-2">
          <Label htmlFor="cell" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              4
            </span>
            {translations.questions.cell.label} {required && <span className="text-red-500">*</span>}
            {selectedSector && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </Label>
          <Select value={selectedCell} onValueChange={handleCellChange} disabled={!selectedSector}>
            <SelectTrigger
              className={`transition-all duration-200 ${
                !selectedSector ? "opacity-50" : ""
              } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            >
              <SelectValue placeholder={!selectedSector ? translations.questions.sector.placeholder : translations.questions.cell.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectedSector &&
                getCells(selectedProvince, selectedDistrict, selectedSector).map((cell) => (
                  <SelectItem key={cell} value={cell}>
                    {cell}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Village - Full Width */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="village" className="text-sm font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              5
            </span>
            {translations.questions.village.label} {required && <span className="text-red-500">*</span>}
            {selectedCell && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </Label>
          <Select
            value={selectedVillage}
            onValueChange={handleVillageChange}
            onOpenChange={onBlur}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue
                placeholder={translations.questions.village.placeholder}
              />
            </SelectTrigger>
            <SelectContent>
              {getVillages(selectedProvince, selectedDistrict, selectedSector, selectedCell).map((village) => (
                <SelectItem key={village} value={village}>
                  {village}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address Summary */}
      {(selectedProvince || selectedDistrict || selectedSector || selectedCell || selectedVillage) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {translations.questions.addressInfo.label}
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            {selectedVillage && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{lang === 'rw' ? "Ibyo wahisemo:" : "Complete Address:"}</span>
                <span className="text-gray-800">
                  {[selectedVillage, selectedCell, selectedSector, selectedDistrict, selectedProvince]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
              {selectedProvince && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">{translations.questions.province.label}</div>
                  <div className="font-medium text-xs">{selectedProvince}</div>
                </div>
              )}
              {selectedDistrict && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">{translations.questions.district.label}</div>
                  <div className="font-medium text-xs">{selectedDistrict}</div>
                </div>
              )}
              {selectedSector && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">{translations.questions.sector.label}</div>
                  <div className="font-medium text-xs">{selectedSector}</div>
                </div>
              )}
              {selectedCell && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">{translations.questions.cell.label}</div>
                  <div className="font-medium text-xs">{selectedCell}</div>
                </div>
              )}
              {selectedVillage && (
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xs text-gray-500">{translations.questions.village.label}</div>
                  <div className="font-medium text-xs">{selectedVillage}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
