// ******************************************************************************************
// ****************************** CODE.GS (BACKEND) *****************************************
// Version 1.9.17 - 03/03/2026 - Fix boucle récursive + dates invalides
// ******************************************************************************************

// --- CONFIGURATION ---
const SCRIPT_PROP = PropertiesService.getScriptProperties();
const BOOTSTRAP_SNAPSHOT_KEY = "BOOTSTRAP_SNAPSHOT_V1";
const PHOTO_PRESENCE_KEY = "PHOTO_PRESENCE_JSON";
const SHEET_NAMES = {
  INVENTORY: "Inventaire",
  HISTORY: "Historique",
  CONFIG: "Config",
  FORMS: "Structure_Forms"
};

const VENDEE_VLI_CATEGORY = "VLI";
const VENDEE_VLI_BAGS = ["VLI 1", "VLI 2"];

function normalizeDlu_(value) {
  if (!value && value !== 0) return "";
  const s = String(value).trim();
  if (!s || s === "/" || s === "-") return "";
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12) return "";
  // Clamper le jour au dernier jour valide du mois (ex: 31 fév -> 28 fév)
  const lastDay = new Date(year, month, 0).getDate();
  const d = Math.min(day, lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function makeVliItem_(name, dlu, qty) {
  const q = (qty || qty === 0) ? ` (${qty})` : "";
  return { name: `${name}${q}`, type: "date", def: normalizeDlu_(dlu) };
}

// =============================================
// === VLI 1 — CIS Chantonnay (images 1/2/3) ===
// =============================================
const VENDEE_VLI1_FORM = [
  {
    section: "POCHETTE PERFUSION (ROUGE)",
    items: [
      makeVliItem_("Cathéter 16 G", "1/3/2028", "x3"),
      makeVliItem_("Cathéter 18 G", "1/8/2028", "x3"),
      makeVliItem_("Cathéter 20 G", "1/1/2029", "x3"),
      makeVliItem_("Cathéter 22 G", "1/7/2028", "x3"),
      makeVliItem_("Cathéter 24 G", "1/1/2027", "x3"),
      makeVliItem_("Rasoir", "/", "x1"),
      makeVliItem_("Champ non stérile", "/", "x1"),
      makeVliItem_("Garrot adulte", "/", "x1"),
      makeVliItem_("Compresses stériles 7,5 x 7,5 cm", "31/8/2029", "x3"),
      makeVliItem_("Chlorhexidine alcoolique 40ml", "28/3/2027", "x1"),
      makeVliItem_("NaCl 0,9 % 100 ml", "28/12/2026", "x2"),
      makeVliItem_("Tégaderm", "25/1/2027", "x2"),
      makeVliItem_("Tubulure 3 voies", "1/1/2027", "x1"),
      makeVliItem_("Régulateur de débit", "19/8/2028", "x1"),
      makeVliItem_("Règlette EVA adulte, enfant", "/", "x1+1"),
      makeVliItem_("Solution hydro-alcoolique", "31/5/2028", "x1"),
      makeVliItem_("Kit de prélèvement sanguin", "30/4/2026", "x1"),
      makeVliItem_("Tulipe", "/", "x1"),
      makeVliItem_("Adaptateur", "/", "x1"),
      makeVliItem_("Tube sec", "/", "x1"),
      makeVliItem_("Tube NFS plaquettes", "/", "x1"),
      makeVliItem_("Tube TP", "/", "x1"),
      makeVliItem_("Tube ionogramme, glycémie", "/", "x1"),
      makeVliItem_("Tube toxique", "/", "x1"),
      makeVliItem_("Poche bilan + étiquettes patient", "/", "x1"),
      makeVliItem_("Tensoban®", "/", "x1")
    ]
  },
  {
    section: "POCHETTE AMPOULIER (JAUNE)",
    items: [
      makeVliItem_("Seringue 5 cc luer lock", "31/5/2027", "x4"),
      makeVliItem_("Seringue 10 cc luer", "31/12/2026", "x2"),
      makeVliItem_("Seringue 10 cc luer lock", "1/2/2029", "x2"),
      makeVliItem_("Seringue 20 cc luer lock (G30% / dilution amiodarone pédiatrique)", "31/1/2027", "x2"),
      makeVliItem_("Seringue sous-cutanée 1 cc (adrénaline pédiatrique)", "31/10/2028", "x2"),
      makeVliItem_("Aiguille IV", "31/8/2026", "x2"),
      makeVliItem_("Aiguille à prélèvement", "1/6/2028", "x2"),
      makeVliItem_("Aiguille IM", "31/5/2027", "x2"),
      makeVliItem_("Aiguille IM obèse", "31/4/2028", "x1"),
      makeVliItem_("Paracétamol® IV 1 g", "31/2/2027", "x1"),
      makeVliItem_("Tubulure 3 voies", "1/1/2027", "x1"),
      makeVliItem_("Clonazepam 1 mg / 1 ml", "31/10/2027", "x4"),
      makeVliItem_("EPPI 1 ml", "30/6/2029", "x4"),
      makeVliItem_("Trinitrine 0,30 mg", "31/3/2027", "x1"),
      makeVliItem_("Acide tranexamique 0,5 g / 5 ml", "31/2/2027", "x4"),
      makeVliItem_("Furosémide 20 mg / 2 ml", "28/9/2026", "x4"),
      makeVliItem_("Paracétamol® IV 500 mg", "30/1/2027", "x1"),
      makeVliItem_("Patch Lidocaïne prilocaïne", "31/10/2026", "x2"),
      makeVliItem_("Glucose 30% 10 ml", "31/7/2026", "x4"),
      makeVliItem_("Diazépam 10 mg / 2 ml", "30/7/2026", "x2"),
      makeVliItem_("Canule rectale", "/", "x1"),
      makeVliItem_("Glucose 5% 20 ml (dilution cordarone pédiatrique)", "31/11/2026", "x2"),
      makeVliItem_("Amiodarone 150 mg / 3 ml", "1/9/2026", "x3"),
      makeVliItem_("Adrénaline 5 mg / 5 ml", "1/9/2026", "x4"),
      makeVliItem_("Adrénaline 1 mg / 1 ml", "1/10/2026", "x2"),
      makeVliItem_("Paracétamol® lyoc 250 mg", "30/4/2028", "x1"),
      makeVliItem_("Paracétamol® lyoc 500 mg", "30/7/2075", "x1"),
      makeVliItem_("EPPI 10 ml", "31/8/2026", "x2")
    ]
  },
  {
    section: "AMPOULIER STUPÉFIANTS — CÔTÉ ORAMORPH",
    items: [
      makeVliItem_("Ampoule Oramorph 30 mg / 5 ml", "31/5/2027", "x4"),
      makeVliItem_("Seringue 5 cc", "31/12/2027", "x2"),
      makeVliItem_("Aiguille à prélèvement", "1/6/2028", "x2"),
      makeVliItem_("Aiguille IV", "1/2/2027", "x2")
    ]
  },
  {
    section: "AMPOULIER STUPÉFIANTS — KIT MORPHINE / NARCAN",
    items: [
      makeVliItem_("Ampoule Morphine 10 mg / 1 ml", "31/10/2026", "x6"),
      makeVliItem_("Ampoule NaCl 0,9% 10 ml", "31/8/2027", "x2"),
      makeVliItem_("Seringue 10 cc", "30/2/2029", "x2"),
      makeVliItem_("Aiguille IV", "28/2/2027", "x2"),
      makeVliItem_("Aiguille à prélèvement", "30/6/2028", "x2"),
      makeVliItem_("Ampoule Naloxone 0,4 mg / 1 ml", "31/8/2027", "x1")
    ]
  },
  {
    section: "POCHETTE PANSEMENTS (VERTE)",
    items: [
      makeVliItem_("Bande 5 cm", "31/1/2031", "x1"),
      makeVliItem_("Bande 10 cm", "31/3/2029", "x1"),
      makeVliItem_("Couverture de survie", "/", "x2"),
      makeVliItem_("Dakin 60 ml", "31/9/2026", "x1"),
      makeVliItem_("Dosette Dacryosérum", "30/11/2026", "x5"),
      makeVliItem_("NaCl 0,9% dosette 45 ml", "31/8/2027", "x2"),
      makeVliItem_("Paire de ciseaux JESCO", "/", "x1"),
      makeVliItem_("Pansement américain stérile", "28/2/2027", "x2"),
      makeVliItem_("Sparadrap", "/", "x1"),
      makeVliItem_("Garrot tourniquet", "/", "x1"),
      makeVliItem_("Bande Tensoban 7 cm", "/", "x1"),
      makeVliItem_("Compresses stériles 7,5 x 7,5 cm", "30/11/2028", "x3")
    ]
  },
  {
    section: "POCHETTE VENTILATION (BLEUE)",
    items: [
      makeVliItem_("Dosette Terbutaline adulte 5 mg / 2 ml", "31/2/2027", "x4"),
      makeVliItem_("Dosette Ipratropium 0,50 mg / 2 ml", "30/3/2027", "x2"),
      makeVliItem_("Dosette Ipratropium 0,25 mg / 1 ml", "30/1/2028", "x2"),
      makeVliItem_("Dosette Salbutamol enfant 2,5 mg / 2,5 ml", "31/1/2027", "x4"),
      makeVliItem_("Dosette NaCl 0,9% 10 ml", "31/8/2027", "x2"),
      makeVliItem_("Masque aérosol adulte", "1/6/2026", "x1"),
      makeVliItem_("Masque aérosol enfant", "1/6/2026", "x1"),
      makeVliItem_("Masque chambre inhalation bébé/enfant/adulte", "/", "x1"),
      makeVliItem_("Chambre inhalation", "/", "x1"),
      makeVliItem_("Salbutamol flacon pressurisé", "30/10/2026", "x1"),
      makeVliItem_("Canule de Guédel (petite/moyenne/grande)", "31/10/2027", "x1+1+1"),
      makeVliItem_("Sonde d'aspiration 8ch & 10ch", "30/7/2029", "x1+1")
    ]
  },
  {
    section: "POCHETTE SOLUTÉS (NOIRE)",
    items: [
      makeVliItem_("NaCl 0,9% 500 ml", "28/2/2027", "x2"),
      makeVliItem_("Tubulure 3 voies", "1/1/2027", "x2"),
      makeVliItem_("NaCl 0,9% 100 ml", "28/12/2026", "x1"),
      makeVliItem_("Glucosé 10% 500 ml", "31/2/2028", "x1"),
      makeVliItem_("Seringue 50 cc luer lock (G10% pédiatrique)", "1/6/2029", "x1")
    ]
  },
  {
    section: "POCHE DESSUS DE SAC",
    items: [
      makeVliItem_("Bandelettes (+ glucomètre + 5 lancettes)", "31/8/2026", "x5"),
      makeVliItem_("Stéthoscope", "/", "x1"),
      makeVliItem_("Stylo lampe", "/", "x1"),
      makeVliItem_("Tensiomètre manuel + brassards (L-M-S)", "/", "x1"),
      makeVliItem_("ThermoScan + embouts", "/", "x1"),
      makeVliItem_("Lampe frontale rechargeable", "/", "x1")
    ]
  },
  {
    section: "CÔTÉ GAUCHE SAC",
    items: [
      makeVliItem_("Paires gants S/M/L (3 poches zippées)", "/", "x4"),
      makeVliItem_("Livrets protocoles", "/", "x1")
    ]
  },
  {
    section: "CÔTÉ DROIT SAC",
    items: [
      makeVliItem_("Rouleau poche poubelle jaune", "/", "x1"),
      makeVliItem_("Boite à DASRI", "/", "x1"),
      makeVliItem_("Kit infectieux (combinaison, masque chir, masque FFP)", "/", "x1")
    ]
  },
  {
    section: "RABAT VENTRAL",
    items: [
      makeVliItem_("Fiches bilan (+ support écriture)", "/", "x10")
    ]
  },
  {
    section: "COMPARTIMENT HAUT INTÉRIEUR SAC",
    items: [
      makeVliItem_("Ampoulier morphinique", "/", "x1")
    ]
  },
  // === POCHETTES VLI 01 (image 2) ===
  {
    section: "RÉSERVE ISP",
    items: [
      makeVliItem_("Paracétamol IV 1g", "1/2/2027", "x1"),
      makeVliItem_("Paracétamol IV 500mg", "31/1/2027", "x1"),
      makeVliItem_("NaCl 0,9% 100ml", "28/12/2026", "x2"),
      makeVliItem_("Tubulures 3 voies", "1/7/2026", "x4"),
      makeVliItem_("Tégadermes", "25/1/2027", "x4"),
      makeVliItem_("Chlorhexidine Alcoolique 2%", "28/3/2027", "x1"),
      makeVliItem_("Garrot", "/", "x1"),
      makeVliItem_("Paquet Compresses", "31/12/2026", "x4"),
      makeVliItem_("Cathéter 18 G", "1/3/2028", "x2"),
      makeVliItem_("Cathéter 20 G", "1/8/2028", "x2"),
      makeVliItem_("Kits de prélèvements", "31/4/2026", "x1"),
      makeVliItem_("Sachets 10 électrodes ECG", "1/8/2026", "x1"),
      makeVliItem_("Masque aérosol Adulte", "31/6/2026", "x1"),
      makeVliItem_("Capteur Sat° Ped", "1/1/2028", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT CYANOKIT",
    items: [
      makeVliItem_("Cyanokit 5 g", "30/4/2028", "x2"),
      makeVliItem_("NaCl 0,9% 250 ml", "30/2/2027", "x1"),
      makeVliItem_("Seringue 50 ml", "31/6/2029", "x1"),
      makeVliItem_("Aiguille Prélèvement", "1/6/2028", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT BRULSTOP",
    items: [
      makeVliItem_("Compresses imprégnées PETIT", "31/8/2027", "x2"),
      makeVliItem_("Compresses imprégnées MOYEN", "30/4/2028", "x2"),
      makeVliItem_("Compresses imprégnées GRAND", "30/4/2028", "x2")
    ]
  },
  {
    section: "RÉSERVE ISP — HemoCue",
    items: [
      makeVliItem_("Microcuvettes", "3/3/2027", "x1 boîte"),
      makeVliItem_("Compresse", "1/5/2028", "x1"),
      makeVliItem_("Kit nettoyage (alcool/compresse)", "/", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — SSO 1",
    items: [
      makeVliItem_("Glucopulse", "31/1/2027", "x1 boîte"),
      makeVliItem_("Laves œil 250 ml", "31/7/2027", "x2"),
      makeVliItem_("Bande 5 cm", "31/11/2028", "x4"),
      makeVliItem_("Bande 10 cm", "31/3/2029", "x4"),
      makeVliItem_("Pansement américains", "30/6/2028", "x4"),
      makeVliItem_("Sparadrap", "/", "x1"),
      makeVliItem_("Compresses", "30/11/2028", "x10"),
      makeVliItem_("NaCl 45 ml", "31/5/2027", "x4")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT ASPI",
    items: [
      makeVliItem_("Réceptacle aspi mucosité", "7/6/2029", "x1"),
      makeVliItem_("Sonde aspi", "20/12/2028", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — SCHILLER T7",
    items: [
      makeVliItem_("Patch DSA", "29/5/1900", "x1"),
      makeVliItem_("Capteur Sat° péd", "1/5/2025", "x1"),
      makeVliItem_("Poche 10 électrodes", "1/6/1900", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT DAMAGE CONTROL",
    items: [
      makeVliItem_("Pansement compressif d'urgence", "27/6/2029", "x5")
    ]
  },
  {
    section: "RÉSERVE ISP — SAC PS",
    items: [
      makeVliItem_("BAVU UU adulte", "9/5/2027", "x1"),
      makeVliItem_("BAVU UU péd.", "26/6/2028", "x1"),
      makeVliItem_("Masque HC adulte", "30/4/2029", "x1"),
      makeVliItem_("Masque HC péd.", "31/10/2026", "x1"),
      makeVliItem_("Bouteille O2 B5", "30/9/2029", "x1"),
      makeVliItem_("Collier cervical adulte/enfant", "/", "x1+1"),
      makeVliItem_("Fiche bilan", "/", "x10")
    ]
  },
  {
    section: "RÉSERVE ISP — AUTRES",
    items: [
      makeVliItem_("Spray désinfectant surface", "31/7/2026", "x1"),
      makeVliItem_("Bouteille eau potable 50 ml", "/", "x6"),
      makeVliItem_("SHA (avant véhicule)", "5/9/2026", "x1")
    ]
  },
  // === PHARMACIE VLI 01 (image 3) ===
  {
    section: "PÉREMPTION PHARMACIE",
    items: [
      makeVliItem_("Acide tranexamique 0,5m/5ml", "28/2/2027", "x5"),
      makeVliItem_("Adrénaline 1mg/1ml", "31/12/2025", "x5"),
      makeVliItem_("Adrénaline 5mg/5ml", "31/3/2026 (5) / 30/6/2026 (20)", "x25"),
      makeVliItem_("Aiguilles à prélèvement", "1/6/2028", "x100"),
      makeVliItem_("Aiguilles IM", "30/5/2027", "x10"),
      makeVliItem_("Aiguilles IM (obèse)", "31/1/2026", "x10"),
      makeVliItem_("Aiguilles IV", "31/1/2026", "x5"),
      makeVliItem_("Amiodarone 150mg/3ml", "30/9/2026", "x20"),
      makeVliItem_("Bactiseptic", "31/10/2026", "x20"),
      makeVliItem_("Bandelettes glycémie", "/", "Réappro CS"),
      makeVliItem_("Bandes 5 cm et 10cm", "/", "Réappro CS"),
      makeVliItem_("Bon de réapprovisionnement pharmacie", "/", "Commande GLPI"),
      makeVliItem_("Canule rectale", "30/6/2026", "x2"),
      makeVliItem_("Canule de guédel", "/", "/"),
      makeVliItem_("Capteur SpO² pédiatrique", "1/7/2027", "x20"),
      makeVliItem_("Cathéter 16G", "1/3/2028", "x5"),
      makeVliItem_("Cathéter 18G", "1/8/2028", "x50"),
      makeVliItem_("Cathéter 20G", "1/1/2029", "x50"),
      makeVliItem_("Cathéter 22G", "1/7/2028", "x10"),
      makeVliItem_("Cathéter 24G", "1/1/2027", "x5"),
      makeVliItem_("Chambre d'inhalation Vortex*", "/", "x0"),
      makeVliItem_("Champs non stériles", "30/4/2027", "x20"),
      makeVliItem_("Clonazépam 1mg/1ml", "31/3/2028", "x4"),
      makeVliItem_("Compresses stériles", "/", "50 (Réappro CS)"),
      makeVliItem_("Container à aiguilles", "/", "Réappro CS"),
      makeVliItem_("Couverture de survie", "/", "Réappro CS"),
      makeVliItem_("Couvre thermomètre (Tempaset*)", "/", "Réappro CS"),
      makeVliItem_("Dacryosérum", "31/1/2027", "x5"),
      makeVliItem_("Dakin", "/", "Réappro CS"),
      makeVliItem_("Diazépam 10mg/2ml", "31/7/2026", "x6"),
      makeVliItem_("Électrodes DSA T7", "31/10/2027", "x5"),
      makeVliItem_("Électrodes multiparamètres", "18/8/2026", "x200"),
      makeVliItem_("EPPI 1ml", "31/12/2028 (1) / 30/6/2029 (3)", "x4"),
      makeVliItem_("EPPI 10ml", "31/7/2025", "x5"),
      makeVliItem_("Fiche intervention SSSM", "/", "x200"),
      makeVliItem_("Furosémide 20mg/2ml", "28/2/2026", "x5"),
      makeVliItem_("Garrot adulte", "/", "x10"),
      makeVliItem_("Glucose 10% 500ml", "31/1/2026", "x2"),
      makeVliItem_("Glucose 30% 10ml", "31/1/2026", "x10"),
      makeVliItem_("Glucose 5% 20ml", "30/11/2026", "x1"),
      makeVliItem_("Ipratropium unidose 0,25mg", "28/2/2027 (10)", "x20"),
      makeVliItem_("Ipratropium unidose 0,50mg", "31/3/2027", "x10"),
      makeVliItem_("Kit risques infectieux ISP", "/", "x1"),
      makeVliItem_("Lancettes glycémie", "/", "Réappro CS"),
      makeVliItem_("Lidocaïne Prilocaïne patch", "30/6/2026 (4) / 31/10/2026 (6)", "x10"),
      makeVliItem_("Masque aérosol adulte", "14/3/2027 (1) / 28/2/2027", "x5"),
      makeVliItem_("Masque aérosol enfant", "28/2/2027", "x5"),
      makeVliItem_("Masque chambre d'inhalation Vortex*", "/", "/"),
      makeVliItem_("Masques chirurgicaux", "28/2/2029", "x50"),
      makeVliItem_("NaCl 0,9% 10ml", "31/8/2027", "x50"),
      makeVliItem_("NaCl 0,9% 45ml", "31/8/2027", "x2 (Réappro CS)"),
      makeVliItem_("NaCl 0,9% 100ml", "31/5/2026 (120) / 31/12/2026 (60)", "x120"),
      makeVliItem_("NaCl 0,9% 500ml", "30/11/2025 (13) / 28/2/2026 (7)", "x10"),
      makeVliItem_("Naloxone 0,40mg/1ml", "31/12/2027", "x1"),
      makeVliItem_("Paire de gants", "/", "1 S, M, L (Réappro CS)"),
      makeVliItem_("Pansements Américains stériles", "/", "/"),
      makeVliItem_("Paracétamol adulte 1000mg/100ml", "31/3/2026", "x50"),
      makeVliItem_("Paracétamol enfant 500mg/50ml", "30/4/2026 (3)", "x5"),
      makeVliItem_("Paralyoc 250 mg", "28/2/2026", "1 boîte"),
      makeVliItem_("Paralyoc 500mg", "30/6/2027", "10 boîtes"),
      makeVliItem_("Plateau de soin", "/", "x30"),
      makeVliItem_("Poches DASRI jaunes", "/", "Réappro CS"),
      makeVliItem_("Rasoir", "/", "Réappro CS"),
      makeVliItem_("Régulateur de débit", "9/2/2026 (1) / 19/8/2028 (1)", "x2"),
      makeVliItem_("Salbutamol flacon pressurisé", "31/10/2026", "x2"),
      makeVliItem_("Salbutamol unidose enfant 2,5mg/2,5ml", "31/10/2025", "x10"),
      makeVliItem_("Seringue 1cc sous cutanée", "31/10/2028", "x2"),
      makeVliItem_("Seringue 5cc Luer Lock", "28/2/2029", "x15"),
      makeVliItem_("Seringue 10cc Luer", "31/8/2028", "x20"),
      makeVliItem_("Seringue 20cc Luer Lock", "31/7/2028", "x5"),
      makeVliItem_("Seringue 50cc Luer Lock", "1/6/2029", "x2"),
      makeVliItem_("Sonde aspiration 8ch", "31/7/2029", "x1"),
      makeVliItem_("Sonde aspiration 10 ch", "31/12/2027", "x1"),
      makeVliItem_("Solution hydro-alcoolique", "/", "Réappro CS"),
      makeVliItem_("Sparadrap", "/", "/"),
      makeVliItem_("Tensoban® 7cm", "/", "x2"),
      makeVliItem_("Terbutaline unidose adulte 5mg/2ml", "28/2/2027", "x5"),
      makeVliItem_("Tubulures 3 voies", "1/7/2026", "x100"),
      makeVliItem_("Tegaderm*", "25/1/2027", "x100"),
      makeVliItem_("Trinitrine 0,30mg", "31/3/2027", "x1"),
      makeVliItem_("Morphine 10mg/1ml", "31/1/2028", "x20"),
      makeVliItem_("Oramorph 30mg/5ml", "31/5/2027", "x20")
    ]
  }
];

// =============================================
// === VLI 2 — CIS Les Herbiers (images 4/5/6) ===
// =============================================
const VENDEE_VLI2_FORM = [
  {
    section: "POCHETTE PERFUSION (ROUGE)",
    items: [
      makeVliItem_("Cathéter 16 G", "1/3/2028", "x3"),
      makeVliItem_("Cathéter 18 G", "1/8/2028", "x3"),
      makeVliItem_("Cathéter 20 G", "1/1/2029", "x3"),
      makeVliItem_("Cathéter 22 G", "1/10/2027", "x3"),
      makeVliItem_("Cathéter 24 G", "1/1/2027", "x3"),
      makeVliItem_("Rasoir", "/", "x1"),
      makeVliItem_("Champ non stérile", "/", "x1"),
      makeVliItem_("Garrot adulte", "/", "x1"),
      makeVliItem_("Compresses stériles 7,5 x 7,5 cm", "31/8/2029", "x3"),
      makeVliItem_("Chlorhexidine alcoolique 40ml", "31/3/2027", "x1"),
      makeVliItem_("NaCl 0,9 % 100 ml", "1/3/2027", "x2"),
      makeVliItem_("Tégaderm", "25/5/2026", "x2"),
      makeVliItem_("Tubulure 3 voies", "1/7/2026", "x1"),
      makeVliItem_("Régulateur de débit", "19/8/2028", "x1"),
      makeVliItem_("Règlette EVA adulte, enfant", "/", "x1+1"),
      makeVliItem_("Solution hydro-alcoolique", "31/5/2028", "x1"),
      makeVliItem_("Kit de prélèvement sanguin", "30/4/2026", "x1"),
      makeVliItem_("Tulipe", "/", "x1"),
      makeVliItem_("Adaptateur", "/", "x1"),
      makeVliItem_("Tube sec", "/", "x1"),
      makeVliItem_("Tube NFS plaquettes", "/", "x1"),
      makeVliItem_("Tube TP", "/", "x1"),
      makeVliItem_("Tube ionogramme, glycémie", "/", "x1"),
      makeVliItem_("Tube toxique", "/", "x1"),
      makeVliItem_("Poche bilan + étiquettes patient", "/", "x1"),
      makeVliItem_("Tensoban®", "/", "x1")
    ]
  },
  {
    section: "POCHETTE AMPOULIER (JAUNE)",
    items: [
      makeVliItem_("Seringue 5 cc luer lock", "31/5/2027", "x4"),
      makeVliItem_("Seringue 10 cc luer", "31/8/2028", "x2"),
      makeVliItem_("Seringue 10 cc luer lock", "28/2/2029", "x2"),
      makeVliItem_("Seringue 20 cc luer lock (G30% / dilution amiodarone pédiatrique)", "31/1/2027", "x2"),
      makeVliItem_("Seringue sous-cutanée 1 cc (adrénaline pédiatrique)", "31/10/2028", "x2"),
      makeVliItem_("Aiguille IV", "31/8/2029", "x2"),
      makeVliItem_("Aiguille à prélèvement", "28/6/2029", "x2"),
      makeVliItem_("Aiguille IM", "31/5/2027", "x2"),
      makeVliItem_("Aiguille IM obèse", "30/4/2028", "x1"),
      makeVliItem_("Paracétamol® IV 1 g", "31/3/2027", "x1"),
      makeVliItem_("Tubulure 3 voies", "1/1/2027", "x1"),
      makeVliItem_("Clonazepam 1 mg / 1 ml", "31/3/2028", "x4"),
      makeVliItem_("EPPI 1 ml", "28/2/2027", "x4"),
      makeVliItem_("Trinitrine 0,30 mg", "31/3/2027", "x1"),
      makeVliItem_("Acide tranexamique 0,5 g / 5 ml", "31/5/2027", "x4"),
      makeVliItem_("Furosémide 20 mg / 2 ml", "1/9/2026", "x4"),
      makeVliItem_("Paracétamol® IV 500 mg", "31/1/2027", "x1"),
      makeVliItem_("Patch Lidocaïne prilocaïne", "30/10/2026", "x2"),
      makeVliItem_("Glucose 30% 10 ml", "31/7/2026", "x4"),
      makeVliItem_("Diazépam 10 mg / 2 ml", "31/7/2026", "x2"),
      makeVliItem_("Canule rectale", "/", "x1"),
      makeVliItem_("Glucose 5% 20 ml (dilution cordarone pédiatrique)", "28/2/2028", "x2"),
      makeVliItem_("Amiodarone 150 mg / 3 ml", "30/9/2026", "x3"),
      makeVliItem_("Adrénaline 5 mg / 5 ml", "31/7/2026", "x4"),
      makeVliItem_("Adrénaline 1 mg / 1 ml", "30/10/2026", "x2"),
      makeVliItem_("Paracétamol® lyoc 250 mg", "28/4/2028", "x1"),
      makeVliItem_("Paracétamol® lyoc 500 mg", "31/1/2028", "x1"),
      makeVliItem_("EPPI 10 ml", "30/11/2026", "x2")
    ]
  },
  {
    section: "AMPOULIER STUPÉFIANTS — CÔTÉ ORAMORPH",
    items: [
      makeVliItem_("Ampoule Oramorph 30 mg / 5 ml", "30/5/2027", "x4"),
      makeVliItem_("Seringue 5 cc", "28/2/2029", "x2"),
      makeVliItem_("Aiguille à prélèvement", "28/2/2027", "x2"),
      makeVliItem_("Aiguille IV", "28/2/2027", "x2")
    ]
  },
  {
    section: "AMPOULIER STUPÉFIANTS — KIT MORPHINE / NARCAN",
    items: [
      makeVliItem_("Ampoule Morphine 10 mg / 1 ml", "31/10/2026", "x6"),
      makeVliItem_("Ampoule NaCl 0,9% 10 ml", "31/8/2027", "x2"),
      makeVliItem_("Seringue 10 cc", "28/2/2029", "x2"),
      makeVliItem_("Aiguille IV", "28/2/2027", "x2"),
      makeVliItem_("Aiguille à prélèvement", "30/6/2029", "x2"),
      makeVliItem_("Ampoule Naloxone 0,4 mg / 1 ml", "30/4/2027", "x1")
    ]
  },
  {
    section: "POCHETTE PANSEMENTS (VERTE)",
    items: [
      makeVliItem_("Bande 5 cm", "30/6/2030", "x1"),
      makeVliItem_("Bande 10 cm", "30/11/2030", "x1"),
      makeVliItem_("Couverture de survie", "/", "x2"),
      makeVliItem_("Dakin 60 ml", "30/9/2026", "x1"),
      makeVliItem_("Dosette Dacryosérum", "30/11/2026", "x5"),
      makeVliItem_("NaCl 0,9% dosette 45 ml", "1/2/2028", "x2"),
      makeVliItem_("Paire de ciseaux JESCO", "/", "x1"),
      makeVliItem_("Pansement américain stérile", "30/11/2029", "x2"),
      makeVliItem_("Sparadrap", "/", "x1"),
      makeVliItem_("Garrot tourniquet", "/", "x1"),
      makeVliItem_("Bande Tensoban 7 cm", "/", "x1"),
      makeVliItem_("Compresses stériles 7,5 x 7,5 cm", "31/11/2028", "x3")
    ]
  },
  {
    section: "POCHETTE VENTILATION (BLEUE)",
    items: [
      makeVliItem_("Dosette Terbutaline adulte 5 mg / 2 ml", "31/8/2027", "x4"),
      makeVliItem_("Dosette Ipratropium 0,50 mg / 2 ml", "30/5/2028", "x2"),
      makeVliItem_("Dosette Ipratropium 0,25 mg / 1 ml", "31/1/2028", "x2"),
      makeVliItem_("Dosette Salbutamol enfant 2,5 mg / 2,5 ml", "31/1/2027", "x4"),
      makeVliItem_("Dosette NaCl 0,9% 10 ml", "31/8/2027", "x2"),
      makeVliItem_("Masque aérosol adulte", "30/6/2026", "x1"),
      makeVliItem_("Masque aérosol enfant", "30/6/2026", "x1"),
      makeVliItem_("Masque chambre inhalation bébé/enfant/adulte", "/", "x1"),
      makeVliItem_("Chambre inhalation", "/", "x1"),
      makeVliItem_("Salbutamol flacon pressurisé", "31/3/2027", "x1"),
      makeVliItem_("Canule de Guédel (petite/moyenne/grande)", "28/2/2026", "x1+1+1"),
      makeVliItem_("Sonde d'aspiration 8ch & 10ch", "31/8/2029", "x1+1")
    ]
  },
  {
    section: "POCHETTE SOLUTÉS (NOIRE)",
    items: [
      makeVliItem_("NaCl 0,9% 500 ml", "28/2/2027", "x2"),
      makeVliItem_("Tubulure 3 voies", "1/7/2026", "x2"),
      makeVliItem_("NaCl 0,9% 100 ml", "1/3/2027", "x1"),
      makeVliItem_("Glucosé 10% 500 ml", "31/3/2028", "x1"),
      makeVliItem_("Seringue 50 cc luer lock (G10% pédiatrique)", "1/6/2029", "x1")
    ]
  },
  {
    section: "POCHE DESSUS DE SAC",
    items: [
      makeVliItem_("Bandelettes (+ glucomètre + 5 lancettes)", "31/8/2026", "x5"),
      makeVliItem_("Stéthoscope", "/", "x1"),
      makeVliItem_("Stylo lampe", "/", "x1"),
      makeVliItem_("Tensiomètre manuel + brassards (L-M-S)", "/", "x1"),
      makeVliItem_("ThermoScan + embouts", "/", "x1"),
      makeVliItem_("Lampe frontale rechargeable", "/", "x1")
    ]
  },
  {
    section: "CÔTÉ GAUCHE SAC",
    items: [
      makeVliItem_("Paires gants S/M/L (3 poches zippées)", "/", "x4"),
      makeVliItem_("Livrets protocoles", "/", "x1")
    ]
  },
  {
    section: "CÔTÉ DROIT SAC",
    items: [
      makeVliItem_("Rouleau poche poubelle jaune", "/", "x1"),
      makeVliItem_("Boite à DASRI", "/", "x1"),
      makeVliItem_("Kit infectieux (combinaison, masque chir, masque FFP)", "/", "x1")
    ]
  },
  {
    section: "RABAT VENTRAL",
    items: [
      makeVliItem_("Fiches bilan (+ support écriture)", "/", "x10")
    ]
  },
  {
    section: "COMPARTIMENT HAUT INTÉRIEUR SAC",
    items: [
      makeVliItem_("Ampoulier morphinique", "/", "x1")
    ]
  },
  // === POCHETTES VLI 02 (image 5) ===
  {
    section: "RÉSERVE ISP",
    items: [
      makeVliItem_("Paracétamol IV 1g", "1/3/2027", "x1"),
      makeVliItem_("Paracétamol IV 500mg", "1/1/2027", "x1"),
      makeVliItem_("NaCl 0,9% 100ml", "1/3/2027", "x2"),
      makeVliItem_("Tubulures 3 voies", "1/7/2026", "x4"),
      makeVliItem_("Tégadermes", "11/10/2026", "x4"),
      makeVliItem_("Chlorhexidine Alcoolique 2%", "1/3/2027", "x1"),
      makeVliItem_("Garrot", "/", "x1"),
      makeVliItem_("Paquet Compresses", "30/5/2028", "x4"),
      makeVliItem_("Cathéter 18 G", "1/3/2028", "x2"),
      makeVliItem_("Cathéter 20 G", "1/8/2028", "x2"),
      makeVliItem_("Kits de prélèvements", "31/4/2026", "x1"),
      makeVliItem_("Sachets 10 électrodes ECG", "4/8/2026", "x1"),
      makeVliItem_("Masque aérosol Adulte", "30/6/2026", "x1"),
      makeVliItem_("Capteur Sat° Ped", "1/1/2028", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT CYANOKIT",
    items: [
      makeVliItem_("Cyanokit 5 g", "31/6/2028", "x2"),
      makeVliItem_("NaCl 0,9% 250 ml", "1/2/2027", "x1"),
      makeVliItem_("Aiguille à prélèvement", "1/11/2026", "x1"),
      makeVliItem_("Seringue de 50 cc", "1/8/2029", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT BRULSTOP",
    items: [
      makeVliItem_("Compresses imprégnées PETIT", "30/5/2027", "x2"),
      makeVliItem_("Compresses imprégnées MOYEN", "28/6/2027", "x2"),
      makeVliItem_("Compresses imprégnées GRAND", "28/2/2028", "x2")
    ]
  },
  {
    section: "RÉSERVE ISP — HemoCue",
    items: [
      makeVliItem_("Microcuvettes", "3/3/2027", "x1 boîte")
    ]
  },
  {
    section: "RÉSERVE ISP — SSO 1",
    items: [
      makeVliItem_("Glucopulse", "31/1/2027", "x1 boîte"),
      makeVliItem_("Laves œil 250 ml", "31/7/2027", "x2"),
      makeVliItem_("Bande 5 cm", "30/6/2030", "x4"),
      makeVliItem_("Bande 10 cm", "28/2/2027", "x4"),
      makeVliItem_("Pansement américains", "30/6/2028", "x4"),
      makeVliItem_("Sparadrap", "/", "x1"),
      makeVliItem_("Compresses", "31/5/2028", "x10"),
      makeVliItem_("NaCl 45 ml", "28/2/2027", "x4")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT ASPI",
    items: [
      makeVliItem_("Réceptacle aspi mucosité", "9/3/2028", "x1"),
      makeVliItem_("Sonde aspi", "25/12/2026", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — SCHILLER T7",
    items: [
      makeVliItem_("Patch DSA", "29/5/2027", "x1"),
      makeVliItem_("Capteur Sat° péd", "1/9/2025", "x1"),
      makeVliItem_("Poche 10 électrodes", "1/8/2026", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — KIT DAMAGE CONTROL",
    items: [
      makeVliItem_("Pansement compressif d'urgence", "27/6/2029", "x5")
    ]
  },
  {
    section: "RÉSERVE ISP — SAC PS",
    items: [
      makeVliItem_("BAVU UU adulte", "9/5/2027", "x1"),
      makeVliItem_("BAVU UU péd.", "1/6/2028", "x1"),
      makeVliItem_("Masque HC adulte", "30/4/2029", "x1"),
      makeVliItem_("Masque HC péd.", "31/10/2026", "x1"),
      makeVliItem_("Collier cervical adulte+enfant", "/", "x1+1"),
      makeVliItem_("Bouteille O2 B5", "31/5/2029", "x1")
    ]
  },
  {
    section: "RÉSERVE ISP — AUTRES",
    items: [
      makeVliItem_("Spray désinfectant surface", "/", "x1"),
      makeVliItem_("Bouteille eau potable 50 ml", "31/12/2025", "x6"),
      makeVliItem_("SHA (avant véhicule)", "31/8/2025", "x1")
    ]
  },
  // === PHARMACIE VLI 02 (image 6) ===
  {
    section: "PÉREMPTION PHARMACIE",
    items: [
      makeVliItem_("Acide tranexamique 0,5m/5ml", "30/11/2025", "x5"),
      makeVliItem_("Adrénaline 1mg/1ml", "31/12/2025", "x5"),
      makeVliItem_("Adrénaline 5mg/5ml", "31/3/2026", "x25"),
      makeVliItem_("Aiguilles à prélèvement", "1/6/2029", "x100"),
      makeVliItem_("Aiguilles IM", "31/5/2027", "x10"),
      makeVliItem_("Aiguilles IM (obèse)", "31/1/2026", "x10"),
      makeVliItem_("Aiguilles IV", "31/1/2026", "x5"),
      makeVliItem_("Amiodarone 150mg/3ml", "30/9/2026", "x20"),
      makeVliItem_("Bactiseptic", "30/10/2026", "x20"),
      makeVliItem_("Bandelettes glycémie", "/", "Réappro CS"),
      makeVliItem_("Bandes 5 cm et 10cm", "/", "Réappro CS"),
      makeVliItem_("Bon de réapprovisionnement pharmacie", "/", "Commande GLPI"),
      makeVliItem_("Canule rectale", "30/6/2026", "x2"),
      makeVliItem_("Canule de guédel", "/", "/"),
      makeVliItem_("Capteur SpO² pédiatrique", "1/4/2026", "x20"),
      makeVliItem_("Cathéter 16G", "1/3/2028", "x5"),
      makeVliItem_("Cathéter 18G", "31/8/2028", "x50"),
      makeVliItem_("Cathéter 20G", "31/1/2029", "x50"),
      makeVliItem_("Cathéter 22G", "1/7/2028", "x10"),
      makeVliItem_("Cathéter 24G", "1/1/2027", "x5"),
      makeVliItem_("Chambre d'inhalation Vortex*", "/", "x0"),
      makeVliItem_("Champs non stériles", "30/4/2027", "x20"),
      makeVliItem_("Clonazépam 1mg/1ml", "31/3/2028", "x4"),
      makeVliItem_("Compresses stériles", "/", "50 (Réappro CS)"),
      makeVliItem_("Container à aiguilles", "/", "Réappro CS"),
      makeVliItem_("Couverture de survie", "/", "Réappro CS"),
      makeVliItem_("Couvre thermomètre (Tempaset*)", "/", "Réappro CS"),
      makeVliItem_("Dacryosérum", "30/4/2026", "x5"),
      makeVliItem_("Dakin", "/", "Réappro CS"),
      makeVliItem_("Diazépam 10mg/2ml", "31/7/2026", "x6"),
      makeVliItem_("Électrodes DSA T7", "31/10/2027", "x5"),
      makeVliItem_("Électrodes multiparamètres", "4/8/2025 (180) / 6/1/2026 (20)", "x200"),
      makeVliItem_("EPPI 1ml", "/", "x4"),
      makeVliItem_("EPPI 10ml", "31/3/2025", "x5"),
      makeVliItem_("Fiche intervention SSSM", "/", "x200"),
      makeVliItem_("Furosémide 20mg/2ml", "28/2/2026", "x5"),
      makeVliItem_("Garrot adulte", "/", "x10"),
      makeVliItem_("Glucose 10% 500ml", "31/1/2026", "x2"),
      makeVliItem_("Glucose 30% 10ml", "31/1/2026", "x10"),
      makeVliItem_("Glucose 5% 20ml", "31/7/2025", "x1"),
      makeVliItem_("Ipratropium unidose 0,25mg", "28/2/2027", "x20"),
      makeVliItem_("Ipratropium unidose 0,50mg", "31/3/2027", "x10"),
      makeVliItem_("Kit risques infectieux ISP", "/", "x1"),
      makeVliItem_("Lancettes glycémie", "/", "Réappro CS"),
      makeVliItem_("Lidocaïne Prilocaïne patch", "31/10/2026", "x10"),
      makeVliItem_("Masque aérosol adulte", "1/6/2026", "x5"),
      makeVliItem_("Masque aérosol enfant", "1/2/2027", "x5"),
      makeVliItem_("Masque chambre d'inhalation Vortex*", "28/2/2029", "/"),
      makeVliItem_("Masques chirurgicaux", "28/2/2029", "x50"),
      makeVliItem_("NaCl 0,9% 10ml", "31/8/2027", "x50"),
      makeVliItem_("NaCl 0,9% 45ml", "31/8/2027", "x2 (Réappro CS)"),
      makeVliItem_("NaCl 0,9% 100ml", "30/5/2026", "x120"),
      makeVliItem_("NaCl 0,9% 500ml", "30/11/2025", "x10"),
      makeVliItem_("Naloxone 0,40mg/1ml", "30/9/2026", "x1"),
      makeVliItem_("Paire de gants", "/", "1 S, M, L (Réappro CS)"),
      makeVliItem_("Pansements Américains stériles", "/", "/"),
      makeVliItem_("Paracétamol adulte 1000mg/100ml", "31/3/2026", "x50"),
      makeVliItem_("Paracétamol enfant 500mg/50ml", "8/7/2025 (2) / 30/4/2026 (3)", "x5"),
      makeVliItem_("Paralyoc 250 mg", "28/2/2026", "1 boîte"),
      makeVliItem_("Paralyoc 500mg", "30/6/2027", "10 boîtes"),
      makeVliItem_("Plateau de soin", "/", "x30"),
      makeVliItem_("Poches DASRI jaunes", "/", "Réappro CS"),
      makeVliItem_("Rasoir", "/", "Réappro CS"),
      makeVliItem_("Régulateur de débit", "9/2/2026 (1) / 19/8/2028 (1)", "x2"),
      makeVliItem_("Salbutamol flacon pressurisé", "31/10/2026", "x2"),
      makeVliItem_("Salbutamol unidose enfant 2,5mg/2,5ml", "31/10/2025", "x10"),
      makeVliItem_("Seringue 1cc sous cutanée", "31/10/2028", "x2"),
      makeVliItem_("Seringue 5cc Luer Lock", "28/2/2029", "x15"),
      makeVliItem_("Seringue 10cc Luer", "28/2/2029", "x30"),
      makeVliItem_("Seringue 10cc Luer Lock", "1/2/2029", "x30"),
      makeVliItem_("Seringue 20cc Luer Lock", "31/7/2028", "x5"),
      makeVliItem_("Seringue 50cc Luer Lock", "30/6/2026", "x2"),
      makeVliItem_("Sonde aspiration 8ch", "31/12/2027", "x1"),
      makeVliItem_("Sonde aspiration 10 ch", "31/12/2027", "x1"),
      makeVliItem_("Solution hydro-alcoolique", "/", "Réappro CS"),
      makeVliItem_("Sparadrap", "/", "/"),
      makeVliItem_("Tensoban® 7cm", "/", "x2"),
      makeVliItem_("Terbutaline unidose adulte 5mg/2ml", "28/2/2027", "x5"),
      makeVliItem_("Tubulures 3 voies", "31/7/2026", "x100"),
      makeVliItem_("Tegaderm*", "25/1/2027", "x100"),
      makeVliItem_("Trinitrine 0,30mg", "31/3/2027", "x1"),
      makeVliItem_("Morphine 10mg/1ml", "31/5/2027", "x20"),
      makeVliItem_("Oramorph 30mg/5ml", "31/5/2027", "x20")
    ]
  }
];

// Mapping : quel formulaire pour quel sac
const VENDEE_VLI_FORMS = {
  "VLI 1": VENDEE_VLI1_FORM,
  "VLI 2": VENDEE_VLI2_FORM
};

const VLI_BASE_DATES_KEY = "VLI_BASE_DATES_V1";

function ensureVliBaseDates_() {
  let base = {};
  try {
    base = JSON.parse(SCRIPT_PROP.getProperty(VLI_BASE_DATES_KEY) || "{}");
  } catch(e) {
    base = {};
  }

  let changed = false;
  VENDEE_VLI_BAGS.forEach(bagName => {
    if (!base[bagName]) { base[bagName] = {}; changed = true; }
    const form = VENDEE_VLI_FORMS[bagName] || [];
    form.forEach(sec => {
      (sec.items || []).forEach(it => {
        if (base[bagName][it.name] === undefined) {
          base[bagName][it.name] = it.def || "";
          changed = true;
        }
      });
    });
  });

  if (changed) SCRIPT_PROP.setProperty(VLI_BASE_DATES_KEY, JSON.stringify(base));
  return base;
}

function buildVliFormsWithBaseDates_(base) {
  const out = {};
  VENDEE_VLI_BAGS.forEach(bagName => {
    const form = VENDEE_VLI_FORMS[bagName] || [];
    out[bagName] = form.map(sec => ({
      section: sec.section,
      position: sec.position || "",
      items: (sec.items || []).map(it => ({
        name: it.name,
        type: it.type,
        def: (base && base[bagName] && base[bagName][it.name] !== undefined) ? base[bagName][it.name] : (it.def || "")
      }))
    }));
  });
  return out;
}

// Compatibilité - ancien nom (fallback VLI 1)
const VENDEE_VLI_FORM = VENDEE_VLI1_FORM;

function setupVendeeVli_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Config
  const conf = ss.getSheetByName(SHEET_NAMES.CONFIG);
  conf.clearContents();
  conf.appendRow(["Categorie", "Frequence_Jours"]);
  conf.appendRow([VENDEE_VLI_CATEGORY, 30]);

  // Inventaire
  const inv = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  inv.clearContents();
  inv.appendRow(["Catégorie", "Nom", "Dernier_Controle", "Prochain_Controle", "Statut", "Dernier_Verificateur", "Prochain_Item_Nom", "Prochain_Item_Date", "Mail_Orange", "Mail_Red", "Etat", "Localisation", "Ordre"]);
  VENDEE_VLI_BAGS.forEach((bag, idx) => {
    inv.appendRow([VENDEE_VLI_CATEGORY, bag, "", "", "green", "", "", "", "", "", "Actif", "", idx + 1]);
  });

  // Feuilles Contenu_* — supprimer les anciennes
  ss.getSheets().forEach(s => {
    const sn = s.getName();
    if (sn.startsWith("Contenu ") && sn !== "Contenu VLI 1" && sn !== "Contenu VLI 2") {
      ss.deleteSheet(s);
    }
  });

  // Créer une feuille Contenu par VLI avec les DLU spécifiques
  let totalRows = 0;
  VENDEE_VLI_BAGS.forEach(bagName => {
    const sheetName = "Contenu " + bagName;   // "Contenu VLI 1" / "Contenu VLI 2"
    let content = ss.getSheetByName(sheetName);
    if (!content) content = ss.insertSheet(sheetName);
    content.clearContents();
    content.appendRow(["Section", "Item", "Type", "Def", "Position"]);

    const form = VENDEE_VLI_FORMS[bagName] || VENDEE_VLI1_FORM;
    const rows = [];
    form.forEach(sec => {
      (sec.items || []).forEach(it => {
        rows.push([sec.section, it.name, it.type, it.def, sec.position || ""]);
      });
    });

    if (rows.length) {
      content.getRange(2, 1, rows.length, 5).setValues(rows);
    }
    totalRows += rows.length;
  });

  if (typeof loadFormStructures === 'function') loadFormStructures();
  // Ne PAS appeler invalidateCache_ ici pour éviter recursion
  return { success: true, items: totalRows };
}

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.bagParam = e.parameter.bag || null;
  return template.evaluate()
      .setTitle('Vérifications Matériel')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function onOpen() {
  try {
    setup();
    ensureVendeeVli_();
  } catch (e) {
    Logger.log("Erreur onOpen Vendée: " + e);
  }
}

function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

// --- BOOTSTRAP (data + photos + mileages) with short cache ---
function getBootstrapData() {
  // Version simple et robuste: cache court uniquement (pas de snapshot persistant)
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("BOOTSTRAP_V1");
    if (cached) return JSON.parse(cached);
    const payload = rebuildBootstrapSnapshot_();
    try {
      if (payload) cache.put("BOOTSTRAP_V1", JSON.stringify(payload), 300);
    } catch(cacheErr) {
      Logger.log("Cache put error (payload trop gros?): " + cacheErr);
    }
    return payload;
  } catch(e) {
    Logger.log("getBootstrapData error: " + e);
    // Fallback direct sans cache
    return rebuildBootstrapSnapshot_();
  }
}

// Reconstruire les feuilles Contenu en batch (setValues, pas appendRow)
function rebuildContenuSheetsBatch_() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    VENDEE_VLI_BAGS.forEach(function(bagName) {
      var sheetName = "Contenu " + bagName;
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) sheet = ss.insertSheet(sheetName);
      sheet.clearContents();
      var rows = [["Section", "Item", "Type", "Def", "Position"]];
      var form = VENDEE_VLI_FORMS[bagName] || VENDEE_VLI1_FORM;
      form.forEach(function(sec) {
        (sec.items || []).forEach(function(it) {
          rows.push([sec.section, it.name, it.type, it.def, sec.position || ""]);
        });
      });
      sheet.getRange(1, 1, rows.length, 5).setValues(rows);
    });
  } catch(e) {
    Logger.log("rebuildContenuSheetsBatch_ error: " + e);
  }
}

function rebuildBootstrapSnapshot_() {
  const base = getData();
  if (!base || !base.success) return base;
  const payload = {
    success: true,
    data: base.data,
    photoPresence: getPhotoPresenceMap(),
    vliMileages: getAllVliMileages()
  };
  return payload;
}

// --- INITIALISATION ---
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (!ss.getSheetByName(SHEET_NAMES.INVENTORY)) {
    const s = ss.insertSheet(SHEET_NAMES.INVENTORY);
    s.appendRow(["Catégorie", "Nom", "Dernier_Controle", "Prochain_Controle", "Statut", "Dernier_Verificateur", "Prochain_Item_Nom", "Prochain_Item_Date", "Mail_Orange", "Mail_Red", "Etat", "Localisation", "Ordre"]);
  } else {
    const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
    const lastCol = Math.max(1, s.getLastColumn());
    const header = s.getRange(1, 1, 1, lastCol).getValues()[0];
    if (header.length < 12 || header[11] !== "Localisation") s.getRange(1, 12).setValue("Localisation");
    if (header.length < 13 || header[12] !== "Ordre") s.getRange(1, 13).setValue("Ordre");
  }
  
  if (!ss.getSheetByName(SHEET_NAMES.HISTORY)) {
    const s = ss.insertSheet(SHEET_NAMES.HISTORY);
    s.appendRow(["Date", "Nom", "Verificateur", "Details_JSON"]);
  }
  
  if (!ss.getSheetByName(SHEET_NAMES.CONFIG)) {
    const s = ss.insertSheet(SHEET_NAMES.CONFIG);
    s.appendRow(["Categorie", "Frequence_Jours"]);
  }
  
  // Stockage des options globales par défaut
  if (!SCRIPT_PROP.getProperty("GLOBAL_OPTS")) {
    SCRIPT_PROP.setProperty("GLOBAL_OPTS", JSON.stringify({
      enableExpiry: true,
      enableQR: true,
      enableVerifier: true,
      enablePhotos: true
    }));
  }
}

function ensureVendeeVli_() {
  if (!SCRIPT_PROP.getProperty("INIT_VENDEE_VLI_V3")) {
    // Poser le flag AVANT le setup pour éviter une boucle récursive
    // (setupVendeeVli_ -> invalidateCache_ -> getData -> ensureVendeeVli_)
    SCRIPT_PROP.setProperty("INIT_VENDEE_VLI_V3", "1");
    try {
      setupVendeeVli_();
    } catch (e) {
      // En cas d'erreur, retirer le flag pour réessayer au prochain appel
      SCRIPT_PROP.deleteProperty("INIT_VENDEE_VLI_V3");
      Logger.log("Erreur ensureVendeeVli_: " + e);
    }
  }
}

// Reconstruit les feuilles Contenu VLI avec les DLU du code (sans toucher Inventaire/Config)
function refreshVliContentSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  VENDEE_VLI_BAGS.forEach(bagName => {
    const sheetName = "Contenu " + bagName;
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    sheet.clearContents();
    const rows = [["Section", "Item", "Type", "Def", "Position"]];
    const form = VENDEE_VLI_FORMS[bagName] || VENDEE_VLI1_FORM;
    form.forEach(sec => {
      (sec.items || []).forEach(it => {
        rows.push([sec.section, it.name, it.type, it.def, sec.position || ""]);
      });
    });
    if (rows.length > 0) {
      sheet.getRange(1, 1, rows.length, 5).setValues(rows);
    }
  });
  // Recharger FORMS_JSON avec les nouvelles DLU
  if (typeof loadFormStructures === 'function') loadFormStructures();
  Logger.log("V4: Feuilles Contenu VLI reconstruites avec DLU corrigées.");
}

// --- DATA FETCHING (Chargement des données) ---
function getData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setup(); // S'assure que tout est prêt
    ensureVendeeVli_();
    if (!SCRIPT_PROP.getProperty("INIT_V3_CLEANUP")) { cleanupCategories_(ss); SCRIPT_PROP.setProperty("INIT_V3_CLEANUP", "1"); }
    if (!SCRIPT_PROP.getProperty("INIT_V4_REMOVE_DEFAULTS")) { removeAutoDefaultBags_(ss); SCRIPT_PROP.setProperty("INIT_V4_REMOVE_DEFAULTS", "1"); }
    if (!SCRIPT_PROP.getProperty("INIT_V5_ORDER")) { initializeInventoryOrder_(ss); SCRIPT_PROP.setProperty("INIT_V5_ORDER", "1"); }
    // FORMS_JSON est déjà en ScriptProperties. Les VLI sont injectés depuis les constantes + VLI_BASE_DATES.
    // Pas besoin de relire les feuilles Contenu_* à chaque appel (très lent).
    // initializeForms() / loadFormStructures() ne sont appelés qu'au setup initial.
    
    // 1. Config
    const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
    const confData = confSheet.getDataRange().getValues();
    let frequencies = {};
    let categoriesOrder = [];
    
    for (let i = 1; i < confData.length; i++) {
      if(confData[i][0]) {
        frequencies[confData[i][0]] = confData[i][1];
        categoriesOrder.push(confData[i][0]);
      }
    }
    
    // 2. Inventaire
    const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
    const invData = invSheet.getDataRange().getValues();
    let inventory = [];
    let dashboard = {};

    for (let i = 1; i < invData.length; i++) {
      const row = invData[i];
      if (!row[0]) continue;
      
      const item = {
        category: row[0],
        name: row[1],
        lastDate: formatDate(row[2]),
        nextDate: formatDate(row[3]),
        status: row[4],
        lastVerifier: row[5],
        nextItemName: row[6],
        nextItemDate: formatDate(row[7]),
        mailOrange: row[8],
        mailRed: row[9],
        state: row[10],
        location: row[11] || "",
        order: row[12] || ""
      };
      
      inventory.push(item);
      
      if (!dashboard[item.category]) dashboard[item.category] = [];
      dashboard[item.category].push(item);
    }
    
    // 3. Forms (Checklists)
    let forms = {};
    const savedForms = SCRIPT_PROP.getProperty("FORMS_JSON");
    if (savedForms) forms = JSON.parse(savedForms);
    // VLI: source de vérité = constantes + overrides persistés
    const vliBaseDates = ensureVliBaseDates_();
    const vliForms = buildVliFormsWithBaseDates_(vliBaseDates);
    forms["VLI 1"] = vliForms["VLI 1"];
    forms["VLI 2"] = vliForms["VLI 2"];
    
    // 4. Historique
    const histSheet = ss.getSheetByName(SHEET_NAMES.HISTORY);
    const lastRow = histSheet.getLastRow();
    let history = [];
    if (lastRow > 1) {
      const startRow = Math.max(2, lastRow - 500); 
      const histData = histSheet.getRange(startRow, 1, lastRow - startRow + 1, 4).getValues();
      
      for (let i = histData.length - 1; i >= 0; i--) {
        history.push({
          dateStr: formatDate(histData[i][0], true),
          name: histData[i][1],
          verifier: histData[i][2],
          details: histData[i][3]
        });
      }
    }
    
    // 5. Options & Stats
    let options = JSON.parse(SCRIPT_PROP.getProperty("GLOBAL_OPTS") || "{}");
    let mailConfig = JSON.parse(SCRIPT_PROP.getProperty("MAIL_CONF") || "{}");
    
    let stats = { ok:0, orange:0, red:0, expiredItems:0 };
    inventory.forEach(i => {
      if(i.state !== 'HS') {
        if(i.status === 'green') stats.ok++;
        if(i.status === 'orange') stats.orange++;
        if(i.status === 'red') stats.red++;
        if(i.status === 'purple') stats.expiredItems++;
      }
    });

    return {
      success: true,
      data: {
        inventory: inventory,
        dashboard: dashboard,
        categoriesOrder: categoriesOrder,
        frequencies: frequencies,
        forms: forms,
        history: history,
        options: options,
        mailConfig: mailConfig,
        stats: stats
      }
    };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// Fonction pour recalculer les statuts basés sur les dates
function recalculateStatuses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = invSheet.getDataRange().getValues();
  const today = new Date();
  
  for (let i = 1; i < data.length; i++) {
    const nextDate = data[i][3]; // Colonne Prochain_Controle
    if (!nextDate) continue;
    
    let status = "green";
    const nextD = new Date(nextDate);
    const daysLeft = Math.floor((nextD - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) status = "red";
    else if (daysLeft < 30) status = "orange";
    
    invSheet.getRange(i + 1, 5).setValue(status); // Colonne Statut
  }
  
  Logger.log("Statuts recalculés");
}

// --- ACTIONS PRINCIPALES ---

function saveCheck(bagName, formData, nextItemName, nextItemDate, verifierName, verificationTime) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = invSheet.getDataRange().getValues();
  
  let bagRowIndex = -1;
  let category = "";
  let currentFreq = 30;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == bagName) {
      bagRowIndex = i + 1;
      category = data[i][0];
      break;
    }
  }
  
  if (bagRowIndex === -1) return { success: false, error: "Sac non trouvé" };
  
  const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  const confData = confSheet.getDataRange().getValues();
  for(let i=1; i<confData.length; i++) {
    if(confData[i][0] == category) {
      currentFreq = parseInt(confData[i][1]) || 30;
      break;
    }
  }
  
  const now = new Date();
  const next = new Date();
  next.setDate(now.getDate() + currentFreq);
  
  let status = "green";
  let itemAlert = "";
  
  if (nextItemDate) {
    const itemD = new Date(nextItemDate);
    const diffTime = itemD - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 0) {
      status = "purple";
      itemAlert = "OBJET PÉRIMÉ : " + nextItemName;
    }
  }
  
  invSheet.getRange(bagRowIndex, 3).setValue(now);
  invSheet.getRange(bagRowIndex, 4).setValue(next);
  invSheet.getRange(bagRowIndex, 5).setValue(status);
  invSheet.getRange(bagRowIndex, 6).setValue(verifierName);
  invSheet.getRange(bagRowIndex, 7).setValue(nextItemName);
  invSheet.getRange(bagRowIndex, 8).setValue(nextItemDate);
  
  const histSheet = ss.getSheetByName(SHEET_NAMES.HISTORY);
  let detailString = JSON.stringify(formData);
  if(itemAlert) detailString += " || " + itemAlert;
  
  // Ajouter le temps de vérification dans le détail
  const timeInfo = (verificationTime !== undefined && verificationTime !== null && verificationTime !== "") ? ` [⏱️ ${verificationTime}]` : "";
  
  histSheet.appendRow([now, bagName, verifierName, detailString + timeInfo]);

  // === PERSISTANCE DES DLU : VLI_BASE_DATES devient la source de référence ===
  if (category === VENDEE_VLI_CATEGORY && formData) {
    try {
      const base = ensureVliBaseDates_();
      if (!base[bagName]) base[bagName] = {};
      let datesUpdated = false;
      Object.keys(formData).forEach(itemName => {
        const newVal = (formData[itemName] || "").toString().trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(newVal) && base[bagName][itemName] !== newVal) {
          base[bagName][itemName] = newVal;
          datesUpdated = true;
        }
      });
      if (datesUpdated) {
        SCRIPT_PROP.setProperty(VLI_BASE_DATES_KEY, JSON.stringify(base));
        Logger.log("DLU mises à jour pour " + bagName + " (" + Object.keys(formData).length + " items analysés)");
      }
    } catch (dluErr) {
      Logger.log("Erreur persistance DLU: " + dluErr);
    }
  }

  invalidateCache_();
  
  return { success: true };
}

// --- GESTION DES PHOTOS (GOOGLE DRIVE) ---

function getPhotoFolder() {
  const folders = DriveApp.getFoldersByName("APP_PHOTOS_VERIF");
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder("APP_PHOTOS_VERIF");
  }
}

function saveBagPhoto(category, bagName, section, base64Data) {
  try {
    const folder = getPhotoFolder();
    const photoKey = makePhotoKey_(category, bagName, section);
    const sanitized = sanitizeBagName_(photoKey);
    const timestamp = new Date().getTime();
    const fileName = "PHOTO_" + sanitized + "_" + timestamp + ".jpg";
    
    Logger.log("Enregistrement photo pour: " + photoKey + " -> " + fileName);

    const existing = getBagPhotos(category, bagName, section);
    const action = existing && existing.length > 0 ? "modify" : "add";
    
    // Création de la nouvelle photo avec timestamp
    const data = base64Data.split(",")[1]; 
    const blob = Utilities.newBlob(Utilities.base64Decode(data), "image/jpeg", fileName);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Stocker métadonnées dans la description
    const desc = "DESC:Photo de vérification | CAT:" + category + " | BAG:" + bagName + " | SEC:" + section + " | KEY:" + photoKey;
    file.setDescription(desc);
    
    logPhotoEvent(action, bagName, file.getId(), fileName);

    updatePhotoPresence_(photoKey, true);

    invalidateCache_();

    Logger.log("Photo sauvée avec succès: " + file.getId());
    return { success: true, fileId: file.getId(), fileName: fileName, timestamp: timestamp, url: file.getUrl() };
  } catch (e) {
    Logger.log("ERREUR sauvegarde photo: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function getBagPhotos(category, bagName, section) {
  try {
    const folder = getPhotoFolder();
    const photoKey = makePhotoKey_(category, bagName, section);
    const sanitized = sanitizeBagName_(photoKey);
    const prefix = "PHOTO_" + sanitized + "_";
    const photos = [];
    
    // Chercher tous les fichiers et les filtrer par prefix
    const allFiles = folder.getFiles();
    while (allFiles.hasNext()) {
      const file = allFiles.next();
      if (file.getName().startsWith(prefix)) {
        const blob = file.getBlob();
        const base64 = "data:image/jpeg;base64," + Utilities.base64Encode(blob.getBytes());
        const desc = file.getDescription() || "";
        const descMatch = desc.match(/DESC:([^|]*)/);
        const description = descMatch ? descMatch[1].trim() : "";
        
        const timestamp = parseInt(file.getName().split("_").pop().replace(".jpg", "")) || 0;
        photos.push({
          fileId: file.getId(),
          fileName: file.getName(),
          timestamp: timestamp,
          base64: base64,
          description: description,
          dateStr: timestamp > 0 ? new Date(timestamp).toLocaleString() : "Sans date"
        });
      }
    }
    
    // Trier par timestamp décroissant (photos récentes en premier)
    photos.sort((a, b) => b.timestamp - a.timestamp);
    Logger.log("getBagPhotos(" + photoKey + "): trouvé " + photos.length + " photos");
    return photos;
  } catch (e) {
    Logger.log("ERREUR getBagPhotos: " + e.toString());
    return [];
  }
}

function getBagPhoto(category, bagName, section) {
  // Compatibilité - retourne la photo la plus récente
  const photos = getBagPhotos(category, bagName, section);
  return photos.length > 0 ? photos[0].base64 : null;
}

function getBagLatestPhotoMeta(category, bagName, section) {
  try {
    const photos = getBagPhotos(category, bagName, section);
    if (photos.length > 0) {
      return {
        hasPhoto: true,
        base64: photos[0].base64,
        fileId: photos[0].fileId,
        timestamp: photos[0].timestamp || null
      };
    }
    return { hasPhoto: false };
  } catch (e) {
    Logger.log("ERREUR getBagLatestPhotoMeta: " + e.toString());
    return { hasPhoto: false, error: e.toString() };
  }
}

function deletePhotoFile(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const desc = file.getDescription() || "";
    const catMatch = desc.match(/CAT:([^|]*)/);
    const bagMatch = desc.match(/BAG:([^|]*)/);
    const secMatch = desc.match(/SEC:([^|]*)/);
    const category = catMatch ? catMatch[1].trim() : "";
    const bagName = bagMatch ? bagMatch[1].trim() : "Unknown";
    const section = secMatch ? secMatch[1].trim() : "Unknown";
    
    file.setTrashed(true);
    logPhotoEvent("delete", bagName, fileId, file.getName());

    if (category && bagName && section) {
      const photoKey = makePhotoKey_(category, bagName, section);
      updatePhotoPresence_(photoKey, false);
    } else {
      rebuildPhotoPresenceMap_();
    }

    invalidateCache_();
    
    Logger.log("Photo supprimée: " + fileId);
    return { success: true };
  } catch (e) {
    Logger.log("ERREUR suppression photo: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function logPhotoEvent(action, bagName, fileId, fileName) {
  try {
    const prop = PropertiesService.getScriptProperties();
    const histStr = prop.getProperty("PHOTO_HISTORY") || "[]";
    let history = JSON.parse(histStr);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
    const invData = invSheet.getDataRange().getValues();
    let bagCategory = "";
    for (let i = 1; i < invData.length; i++) {
      if (invData[i][1] === bagName) {
        bagCategory = invData[i][0];
        break;
      }
    }
    
    history.push({
      action: action,
      bagName: bagName,
      category: bagCategory,
      fileId: fileId,
      fileName: fileName,
      timestamp: new Date().getTime(),
      dateStr: new Date().toLocaleString()
    });
    
    prop.setProperty("PHOTO_HISTORY", JSON.stringify(history));
  } catch (e) {
    Logger.log("ERREUR logPhotoEvent: " + e.toString());
  }
}

function getPhotoHistory() {
  try {
    const prop = PropertiesService.getScriptProperties();
    const histStr = prop.getProperty("PHOTO_HISTORY") || "[]";
    let history = JSON.parse(histStr);
    
    // Charger les photos pour celles encore existantes
    const folder = getPhotoFolder();
    const existingFiles = {};
    const allFiles = folder.getFiles();
    while (allFiles.hasNext()) {
      const f = allFiles.next();
      existingFiles[f.getId()] = f;
    }
    
    history.forEach(h => {
      if (existingFiles[h.fileId] && (h.action === "add" || h.action === "modify")) {
        const f = existingFiles[h.fileId];
        const blob = f.getBlob();
        h.base64 = "data:image/jpeg;base64," + Utilities.base64Encode(blob.getBytes());
      }
    });
    
    history.sort((a, b) => b.timestamp - a.timestamp);
    return history;
  } catch (e) {
    Logger.log("ERREUR getPhotoHistory: " + e.toString());
    return [];
  }
}

function getPhotoPresenceMap() {
  try {
    const prop = SCRIPT_PROP.getProperty(PHOTO_PRESENCE_KEY);
    if (prop) return JSON.parse(prop);
  } catch (e) {
    Logger.log("ERREUR getPhotoPresenceMap: " + e.toString());
  }
  return rebuildPhotoPresenceMap_();
}

function rebuildPhotoPresenceMap_() {
  const map = {};
  try {
    const folder = getPhotoFolder();
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      const name = f.getName() || "";
      const match = name.match(/^PHOTO_(.+)_\d+\.jpg$/);
      if (match && match[1]) map[match[1]] = true;
    }
    SCRIPT_PROP.setProperty(PHOTO_PRESENCE_KEY, JSON.stringify(map));
  } catch (e) {
    Logger.log("ERREUR rebuildPhotoPresenceMap_: " + e.toString());
  }
  return map;
}

function updatePhotoPresence_(photoKey, hasPhoto) {
  try {
    const map = getPhotoPresenceMap() || {};
    const sanitized = sanitizeBagName_(photoKey);
    if (hasPhoto) map[sanitized] = true; else delete map[sanitized];
    SCRIPT_PROP.setProperty(PHOTO_PRESENCE_KEY, JSON.stringify(map));
  } catch (e) {
    Logger.log("ERREUR updatePhotoPresence_: " + e.toString());
  }
}

function makePhotoKey_(category, bagName, section) {
  return (category || "") + "||" + (bagName || "") + "||" + (section || "");
}

function sanitizeBagName_(str) {
  return (str || "").replace(/[^a-zA-Z0-9]/g, "_");
}

// Fonction de test pour créer le dossier et tester une photo
function testPhotoSystem() {
  try {
    const folder = getPhotoFolder();
    Logger.log("Dossier créé/trouvé: " + folder.getName() + " (ID: " + folder.getId() + ")");
    Logger.log("URL du dossier: " + folder.getUrl());
    
    // Test de création d'une photo simple
    const testData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // 1x1 pixel rouge
    const blob = Utilities.newBlob(Utilities.base64Decode(testData), "image/png", "TEST.png");
    const testFile = folder.createFile(blob);
    testFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    Logger.log("Fichier test créé: " + testFile.getName());
    Logger.log("URL test: " + testFile.getUrl());
    
    return {
      success: true,
      folderId: folder.getId(),
      folderUrl: folder.getUrl(),
      testFileUrl: testFile.getUrl()
    };
  } catch (e) {
    Logger.log("ERREUR testPhotoSystem: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

// --- FONCTIONS ADMIN ---

function getNextOrder_(sheet, cat) {
  const data = sheet.getDataRange().getValues();
  let max = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === cat) {
      const v = parseInt(data[i][12], 10);
      if (!isNaN(v) && v > max) max = v;
    }
  }
  return max + 1;
}

function initializeInventoryOrder_(ss) {
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  const counters = {};
  for (let i = 1; i < data.length; i++) {
    const cat = String(data[i][0]).trim();
    if (!cat) continue;
    if (!counters[cat]) counters[cat] = 1;
    const v = parseInt(data[i][12], 10);
    if (isNaN(v) || v <= 0) {
      s.getRange(i + 1, 13).setValue(counters[cat]);
    }
    counters[cat]++;
  }
}

function addBag(cat, name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const nextOrder = getNextOrder_(s, cat);
  s.appendRow([cat, name, "", "", "green", "", "", "", "", "", "Actif", "", nextOrder]);
  invalidateCache_();
}

function deleteBag(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(data[i][1] == name) {
      s.deleteRow(i+1);
      break;
    }
  }
  invalidateCache_();
}

function updateBagStatus(name, state) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(data[i][1] == name) {
      s.getRange(i+1, 11).setValue(state);
      break;
    }
  }
  invalidateCache_();
}

function createNewCategory(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.CONFIG);
  s.appendRow([name, 30]);
  invalidateCache_();
}

function renameBag(oldName, newName) {
  if(!oldName || !newName) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let bagCategory = "";
  
  // Renommer dans l'inventaire
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const invData = invSheet.getDataRange().getValues();
  for(let i = 1; i < invData.length; i++) {
    if(invData[i][1] === oldName) {
      bagCategory = invData[i][0];
      invSheet.getRange(i + 1, 2).setValue(newName);
    }
  }
  
  // Renommer dans l'historique
  const histSheet = ss.getSheetByName(SHEET_NAMES.HISTORY);
  const histData = histSheet.getDataRange().getValues();
  for(let i = 1; i < histData.length; i++) {
    if(histData[i][1] === oldName) {
      histSheet.getRange(i + 1, 2).setValue(newName);
    }
  }

  // Renommer les photos liées (standard + impact)
  renameBagPhotos_(oldName, newName, bagCategory);
  invalidateCache_();
}

function renameBagPhotos_(oldName, newName, bagCategory) {
  try {
    const folder = getPhotoFolder();
    const files = folder.getFiles();
    const sanitizedOld = sanitizeBagName_(oldName);
    const sanitizedNew = sanitizeBagName_(newName);
    while (files.hasNext()) {
      const file = files.next();
      const name = file.getName();
      const desc = file.getDescription() || "";
      // IMPACT photos
      if (name.startsWith("IMPACT_" + sanitizedOld + "_")) {
        const newNameFile = name.replace("IMPACT_" + sanitizedOld + "_", "IMPACT_" + sanitizedNew + "_");
        const newDesc = desc.replace(/BAG:([^|]*)/, "BAG:" + newName);
        file.setName(newNameFile);
        file.setDescription(newDesc);
        continue;
      }
      // Standard photos
      if (desc.indexOf("BAG:" + oldName) !== -1 || name.indexOf("PHOTO_" + sanitizedOld) === 0) {
        const catMatch = desc.match(/CAT:([^|]*)/);
        const secMatch = desc.match(/SEC:([^|]*)/);
        const cat = catMatch ? catMatch[1].trim() : bagCategory;
        const sec = secMatch ? secMatch[1].trim() : "";
        if (!cat || !sec) continue;
        const newKey = makePhotoKey_(cat, newName, sec);
        const sanitizedKey = sanitizeBagName_(newKey);
        const timestamp = name.split("_").pop().replace(".jpg", "");
        const newFileName = "PHOTO_" + sanitizedKey + "_" + timestamp + ".jpg";
        const newDesc = desc
          .replace(/BAG:([^|]*)/, "BAG:" + newName)
          .replace(/KEY:([^|]*)/, "KEY:" + newKey);
        file.setName(newFileName);
        file.setDescription(newDesc);
      }
    }
    rebuildPhotoPresenceMap_();
  } catch (e) {
    Logger.log("ERREUR renameBagPhotos_: " + e.toString());
  }
}

function renameCategory(oldCat, newCat) {
  if(!oldCat || !newCat) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Renommer dans la config
  const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  const confData = confSheet.getDataRange().getValues();
  for(let i = 1; i < confData.length; i++) {
    if(confData[i][0] === oldCat) {
      confSheet.getRange(i + 1, 1).setValue(newCat);
    }
  }
  
  // Renommer dans l'inventaire
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const invData = invSheet.getDataRange().getValues();
  for(let i = 1; i < invData.length; i++) {
    if(invData[i][0] === oldCat) {
      invSheet.getRange(i + 1, 1).setValue(newCat);
    }
  }
  
  // Renommer dans les formulaires
  const forms = SCRIPT_PROP.getProperty("FORMS_JSON");
  if(forms) {
    const formsObj = JSON.parse(forms);
    if(formsObj[oldCat]) {
      formsObj[newCat] = formsObj[oldCat];
      delete formsObj[oldCat];
      SCRIPT_PROP.setProperty("FORMS_JSON", JSON.stringify(formsObj));
    }
  }
  invalidateCache_();
}

function deleteCategory(categoryName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Supprimer de la config
  const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  const confData = confSheet.getDataRange().getValues();
  for(let i = confData.length - 1; i >= 1; i--) {
    if(confData[i][0] === categoryName) {
      confSheet.deleteRow(i + 1);
      break;
    }
  }
  
  // 2. Supprimer tous les items de cette catégorie dans l'inventaire
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const invData = invSheet.getDataRange().getValues();
  for(let i = invData.length - 1; i >= 1; i--) {
    if(invData[i][0] === categoryName) {
      invSheet.deleteRow(i + 1);
    }
  }
  
  // 3. Supprimer les formulaires de cette catégorie
  const forms = SCRIPT_PROP.getProperty("FORMS_JSON");
  if(forms) {
    const formsObj = JSON.parse(forms);
    delete formsObj[categoryName];
    SCRIPT_PROP.setProperty("FORMS_JSON", JSON.stringify(formsObj));
  }

  invalidateCache_();
  
  return { success: true };
}

function deleteHistoryEntry(historyIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const histSheet = ss.getSheetByName(SHEET_NAMES.HISTORY);
  const lastRow = histSheet.getLastRow();
  
  // L'historique est affiché en ordre inversé (plus récent en premier)
  // Donc l'index 0 = dernière ligne, index 1 = avant-dernière, etc.
  const rowToDelete = lastRow - historyIndex;
  
  if(rowToDelete > 1 && rowToDelete <= lastRow) {
    histSheet.deleteRow(rowToDelete);
    invalidateCache_();
    return { success: true };
  }
  
  return { success: false, error: "Ligne introuvable" };
}

function updateCategoriesConfig(confArray) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.CONFIG);
  s.clearContents();
  s.appendRow(["Categorie", "Frequence_Jours"]);
  confArray.forEach(c => {
    s.appendRow([c.name, c.freq]);
  });
  invalidateCache_();
}

function updateCategoryContent(catName, dataJson) {
  let forms = {};
  const saved = SCRIPT_PROP.getProperty("FORMS_JSON");
  if(saved) forms = JSON.parse(saved);
  
  let groups = {};
  dataJson.forEach(row => {
    if(!groups[row.section]) {
      groups[row.section] = { section: row.section, position: row.position, items: [] };
    }
    if(row.position) groups[row.section].position = row.position;
    
    if(row.item) {
      groups[row.section].items.push({
        name: row.item,
        type: row.type,
        def: row.def
      });
    }
  });
  
  let structured = [];
  for (let key in groups) {
    structured.push(groups[key]);
  }
  
  forms[catName] = structured;
  SCRIPT_PROP.setProperty("FORMS_JSON", JSON.stringify(forms));
  invalidateCache_();
}

function updateBagMails(bag, type, val) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  const col = type === 'orange' ? 9 : 10;
  
  for(let i=1; i<data.length; i++) {
    if(data[i][1] == bag) {
      s.getRange(i+1, col).setValue(val);
      break;
    }
  }
  invalidateCache_();
}

function updateVliLocation(bag, location) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == bag) {
      s.getRange(i + 1, 12).setValue(location || "");
      break;
    }
  }
  invalidateCache_();
}

function updateVliLocationsBatch(list) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  const map = {};
  (list || []).forEach(it => { if (it && it.name) map[it.name] = it.location || ""; });
  for (let i = 1; i < data.length; i++) {
    const name = data[i][1];
    if (map.hasOwnProperty(name)) {
      s.getRange(i + 1, 12).setValue(map[name]);
    }
  }
  invalidateCache_();
  return { success: true };
}

function updateBagOrders(list) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const data = s.getDataRange().getValues();
  const map = {};
  (list || []).forEach(it => { if (it && it.name) map[it.name] = parseInt(it.order, 10) || ""; });
  for (let i = 1; i < data.length; i++) {
    const name = data[i][1];
    if (map.hasOwnProperty(name)) {
      s.getRange(i + 1, 13).setValue(map[name]);
    }
  }
  invalidateCache_();
  return { success: true };
}

function saveGlobalOptions(opts) {
  SCRIPT_PROP.setProperty("GLOBAL_OPTS", JSON.stringify(opts));
  invalidateCache_();
}

function saveMailConfig(conf) {
  SCRIPT_PROP.setProperty("MAIL_CONF", JSON.stringify(conf));
  invalidateCache_();
}

function formatDate(dateObj, withTime) {
  if (!dateObj || dateObj === "") return "";
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  
  let day = ("0" + d.getDate()).slice(-2);
  let month = ("0" + (d.getMonth() + 1)).slice(-2);
  let year = d.getFullYear();
  
  let res = `${day}/${month}/${year}`;
  if(withTime) {
    let h = ("0" + d.getHours()).slice(-2);
    let m = ("0" + d.getMinutes()).slice(-2);
    res += ` ${h}:${m}`;
  }
  return res;
}

// --- TRIGGER (AUTOMATISATION) ---
function installTrigger(hour) {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkDailyAlerts') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  ScriptApp.newTrigger('checkDailyAlerts')
      .timeBased()
      .everyDays(1)
      .atHour(parseInt(hour))
      .create();
      
  return "Automatisation activée à " + hour + "h00 tous les jours.";
}

function checkDailyAlerts() {
  const data = getData();
  if(!data.success) return;
  
  const inv = data.data.inventory;
  const conf = data.data.mailConfig;
  
  inv.forEach(item => {
    if(item.state === 'HS') return;
    
    let sendMail = false;
    let subject = "";
    let body = "";
    let recipient = "";
    
    if(item.status === 'red' || item.status === 'purple') {
      if(item.mailRed) {
        recipient = item.mailRed;
        subject = conf.redSub || "ALERTE ROUGE";
        body = conf.redBody || "Matériel périmé.";
        sendMail = true;
      }
    }
    else if(item.status === 'orange') {
      if(item.mailOrange) {
        recipient = item.mailOrange;
        subject = conf.orangeSub || "ALERTE ORANGE";
        body = conf.orangeBody || "Matériel bientot périmé.";
        sendMail = true;
      }
    }
    
    if(sendMail && recipient) {
      body = body.replace(/{nom}/g, item.name)
                 .replace(/{categorie}/g, item.category)
                 .replace(/{date}/g, item.lastDate)
                 .replace(/{echeance}/g, item.nextDate);
      
      subject = subject.replace(/{nom}/g, item.name);
      
      try {
        MailApp.sendEmail(recipient, subject, body);
      } catch(e) {
        console.log("Erreur envoi mail: " + e);
      }
    }
  });
}

// ===================================================================
// === VLI IMPACT PHOTOS SYSTEM ===
// ===================================================================

function saveVliImpact(bagName, base64Data, comment) {
  try {
    const folder = getPhotoFolder();
    const timestamp = new Date().getTime();
    const sanitized = sanitizeBagName_(bagName);
    const fileName = "IMPACT_" + sanitized + "_" + timestamp + ".jpg";
    const data = base64Data.split(",")[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(data), "image/jpeg", fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    file.setDescription("IMPACT|BAG:" + bagName + "|COMMENT:" + (comment || ""));
    invalidateCache_();
    return { success: true, fileId: file.getId() };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getVliImpacts(bagName) {
  try {
    const folder = getPhotoFolder();
    const sanitized = sanitizeBagName_(bagName);
    const prefix = "IMPACT_" + sanitized + "_";
    const impacts = [];
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith(prefix)) {
        const desc = file.getDescription() || "";
        const commentMatch = desc.match(/COMMENT:(.*)/);
        const comment = commentMatch ? commentMatch[1].trim() : "";
        const blob = file.getBlob();
        const base64 = "data:image/jpeg;base64," + Utilities.base64Encode(blob.getBytes());
        const timestamp = parseInt(file.getName().split("_").pop().replace(".jpg", "")) || 0;
        impacts.push({
          fileId: file.getId(),
          base64: base64,
          comment: comment,
          timestamp: timestamp,
          dateStr: timestamp > 0 ? new Date(timestamp).toLocaleString('fr-FR') : "Sans date"
        });
      }
    }
    impacts.sort((a, b) => b.timestamp - a.timestamp);
    return impacts;
  } catch (e) {
    Logger.log("ERREUR getVliImpacts: " + e.toString());
    return [];
  }
}

function deleteVliImpact(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    invalidateCache_();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function updateVliImpactComment(fileId, newComment) {
  try {
    const file = DriveApp.getFileById(fileId);
    let desc = file.getDescription() || "";
    desc = desc.replace(/COMMENT:.*/, "COMMENT:" + newComment);
    file.setDescription(desc);
    invalidateCache_();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ===================================================================
// === VLI MILEAGE SYSTEM ===
// ===================================================================

function saveVliMileage(bagName, km, dateStr) {
  const key = "VLI_KM_" + sanitizeBagName_(bagName);
  const data = { km: km, date: dateStr, timestamp: new Date().getTime() };
  SCRIPT_PROP.setProperty(key, JSON.stringify(data));
  invalidateCache_();
  return { success: true };
}

function invalidateCache_() {
  try {
    CacheService.getScriptCache().remove("BOOTSTRAP_V1");
    // NE PAS appeler rebuildBootstrapSnapshot_() ici !
    // Ca créait une boucle infinie: invalidateCache_ -> rebuild -> getData -> ensureVendeeVli_ -> setupVendeeVli_ -> invalidateCache_ -> ...
    // Le cache sera reconstruit automatiquement au prochain appel de getBootstrapData()
  } catch (e) {
    Logger.log("Cache invalidate error: " + e.toString());
  }
}

function getAllVliMileages() {
  const props = SCRIPT_PROP.getProperties();
  const result = {};
  for (let key in props) {
    if (key.startsWith("VLI_KM_")) {
      try {
        result[key.replace("VLI_KM_", "")] = JSON.parse(props[key]);
      } catch(e) {}
    }
  }
  return result;
}

// ===================================================================
// === DEFAULT CONTENT INITIALIZATION ===
// ===================================================================

function initializeDefaultContent() {
  let forms = {};
  const saved = SCRIPT_PROP.getProperty("FORMS_JSON");
  if (saved) { try { forms = JSON.parse(saved); } catch(e) { forms = {}; } }

  forms["SAC ISP"] = getSacISPContent_();

  forms["SAC RESERVE"] = getSacReserveContent_();
  if (!forms["SAC IADE"] || forms["SAC IADE"].length === 0) {
    forms["SAC IADE"] = [{ section: "Contenu général", position: "", items: [{ name: "À définir", type: "case", def: "true" }] }];
  }

  SCRIPT_PROP.setProperty("FORMS_JSON", JSON.stringify(forms));

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (confSheet) {
    const confData = confSheet.getDataRange().getValues();
    const existingCats = confData.slice(1).map(r => String(r[0]).trim());
    ["VLI", "SAC ISP", "SAC RESERVE", "SAC IADE"].forEach(cat => {
      if (!existingCats.includes(cat)) {
        confSheet.appendRow([cat, 30]);
      }
    });
  }
  return "Contenu initialisé! SAC ISP: " + forms["SAC ISP"].length + " sections, SAC RESERVE: " + forms["SAC RESERVE"].length + " sections";
}

function cleanupCategories_(ss) {
  // === STANDARD CATEGORY NAMES ===
  const STANDARD = { "VLI": "VLI", "SAC ISP": "SAC ISP", "Sac ISP": "SAC ISP", "sac isp": "SAC ISP",
    "SAC RESERVE": "SAC RESERVE", "Sac RESERVE": "SAC RESERVE", "SAC IADE": "SAC IADE", "Sac IADE": "SAC IADE", "Sac Iade": "SAC IADE", "sac iade": "SAC IADE" };
  function norm(n) { const t = String(n).trim(); return STANDARD[t] || t.toUpperCase(); }
  
  // 1. DEDUPLICATE CONFIG - garder une seule ligne par catégorie normalisée
  const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  const confData = confSheet.getDataRange().getValues();
  const seen = {}; const rowsToDelete = [];
  for (let i = 1; i < confData.length; i++) {
    const raw = String(confData[i][0]).trim();
    if (!raw) continue;
    const std = norm(raw);
    if (seen[std]) { rowsToDelete.push(i + 1); } // doublon
    else { seen[std] = true; if (raw !== std) confSheet.getRange(i + 1, 1).setValue(std); }
  }
  for (let i = rowsToDelete.length - 1; i >= 0; i--) confSheet.deleteRow(rowsToDelete[i]);
  // Ajouter SAC RESERVE si absent
  const finalConf = confSheet.getDataRange().getValues();
  const finalCats = finalConf.slice(1).map(r => String(r[0]).trim());
  if (!finalCats.includes("SAC RESERVE")) confSheet.appendRow(["SAC RESERVE", 30]);
  
  // 2. MIGRATE FORMS_JSON keys to standard names + inject missing content
  let forms = {};
  const saved = SCRIPT_PROP.getProperty("FORMS_JSON");
  if (saved) { try { forms = JSON.parse(saved); } catch(e) { forms = {}; } }
  const newForms = {};
  for (let key in forms) { newForms[norm(key)] = forms[key]; }
  if (!newForms["SAC ISP"] || newForms["SAC ISP"].length === 0) newForms["SAC ISP"] = getSacISPContent_();
  if (!newForms["SAC RESERVE"] || newForms["SAC RESERVE"].length === 0) newForms["SAC RESERVE"] = getSacReserveContent_();
  SCRIPT_PROP.setProperty("FORMS_JSON", JSON.stringify(newForms));
  
  // 3. NORMALIZE Inventaire categories (no auto-add items)
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const invData = invSheet.getDataRange().getValues();
  for (let i = 1; i < invData.length; i++) {
    const raw = String(invData[i][0]).trim();
    if (raw && norm(raw) !== raw) invSheet.getRange(i + 1, 1).setValue(norm(raw));
  }
}

function removeAutoDefaultBags_(ss) {
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const invData = invSheet.getDataRange().getValues();
  const autoNames = new Set(["Sac ISP 1", "Sac IADE 1", "Sac Réserve 1", "Sac Réserve 2"]);
  const rowsToDelete = [];
  for (let i = 1; i < invData.length; i++) {
    const name = String(invData[i][1] || "").trim();
    if (!name || autoNames.has(name)) rowsToDelete.push(i + 1);
  }
  for (let i = rowsToDelete.length - 1; i >= 0; i--) invSheet.deleteRow(rowsToDelete[i]);
}

function removeAutoReserveBags() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName(SHEET_NAMES.INVENTORY);
  const invData = invSheet.getDataRange().getValues();
  const targets = new Set(["Sac Réserve 1", "Sac Réserve 2"]);
  const rowsToDelete = [];
  for (let i = 1; i < invData.length; i++) {
    const cat = String(invData[i][0]).trim();
    const name = String(invData[i][1]).trim();
    if (cat === "SAC RESERVE" && targets.has(name)) rowsToDelete.push(i + 1);
  }
  for (let i = rowsToDelete.length - 1; i >= 0; i--) invSheet.deleteRow(rowsToDelete[i]);
  return "Auto Sac Réserve supprimés";
}

function runCleanupNow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  cleanupCategories_(ss);
  return "Cleanup OK";
}

function getSacISPContent_() {
  return [
    { section: "Dessus", position: "Dessus du sac", items: [
      { name: "Ampoulier (1)", type: "case", def: "true" },
      { name: "Numéro valise ampoulier", type: "texte", def: "" },
      { name: "Numéro Pharmsap", type: "texte", def: "" },
      { name: "Fiche de commande (1)", type: "case", def: "true" }
    ]},
    { section: "Poche latérale droite — Diagnostic", position: "Latéral droit", items: [
      { name: "Stéthoscope (1)", type: "case", def: "true" }
    ]},
    { section: "Poche latérale droite — Sondage gastrique", position: "Latéral droit", items: [
      { name: "Sonde gastrique n°14 (1)", type: "case", def: "true" },
      { name: "Sonde gastrique n°18 (1)", type: "case", def: "true" },
      { name: "Seringue à gavage 60ml embout conique (1)", type: "case", def: "true" },
      { name: "Poche à urine (1)", type: "case", def: "true" }
    ]},
    { section: "Poche latérale gauche — Hémorragie", position: "Latéral gauche", items: [
      { name: "Garrot hémorragie (2)", type: "nombre", def: "2" },
      { name: "Pansement compressif (2)", type: "nombre", def: "2" }
    ]},
    { section: "Solutés", position: "Poche principale", items: [
      { name: "NaCl 0.9% 500ml (1)", type: "case", def: "true" },
      { name: "Ringer Lactate 500ml (1)", type: "case", def: "true" },
      { name: "Glucose 5% 500ml (1)", type: "case", def: "true" },
      { name: "Kit Perfalgan (1)", type: "case", def: "true" },
      { name: "Kit NaCl 100ml (1)", type: "case", def: "true" },
      { name: "Kétoprofène 100ml (1)", type: "case", def: "true" },
      { name: "Glucose 10 250ml (1)", type: "case", def: "true" },
      { name: "Penthrox (1)", type: "case", def: "true" }
    ]},
    { section: "Pochette jaune — Perfusion", position: "Poche principale", items: [
      { name: "Kit perfusion (1)", type: "case", def: "true" },
      { name: "Dosette Bétadine alcoolique (1)", type: "case", def: "true" },
      { name: "Sparadrap (1)", type: "case", def: "true" },
      { name: "Garrot (1)", type: "case", def: "true" },
      { name: "Ciseau GESCO (1)", type: "case", def: "true" },
      { name: "Sachet compresses stériles (1)", type: "case", def: "true" },
      { name: "Bouchons à perfusion (2)", type: "nombre", def: "2" },
      { name: "Seringues 10ml (2)", type: "nombre", def: "2" },
      { name: "Trocards (2)", type: "nombre", def: "2" },
      { name: "Valves anti-retour (4)", type: "nombre", def: "4" }
    ]},
    { section: "Pochette rouge courte — Perfusion", position: "Poche principale", items: [
      { name: "Kit perfusion (1)", type: "case", def: "true" },
      { name: "Perfuseur (1)", type: "case", def: "true" },
      { name: "Opsite (1)", type: "case", def: "true" },
      { name: "Compresses stériles (2)", type: "nombre", def: "2" }
    ]},
    { section: "Pochette rouge longue — Intubation", position: "Poche principale", items: [
      { name: "Tube laryngé adulte taille 4 (1)", type: "case", def: "true" },
      { name: "Seringue étalonnée adulte (1)", type: "case", def: "true" },
      { name: "Cale dents adulte (1)", type: "case", def: "true" },
      { name: "Tube laryngé enfant taille 2 (1)", type: "case", def: "true" },
      { name: "Seringue étalonnée enfant (1)", type: "case", def: "true" },
      { name: "Cale dents enfant (1)", type: "case", def: "true" },
      { name: "Manche laryngoscope (1)", type: "case", def: "true" },
      { name: "Lame laryngoscope UU n°3 (1)", type: "case", def: "true" },
      { name: "Piles de rechange (2)", type: "nombre", def: "2" },
      { name: "Pince de Magyll (1)", type: "case", def: "true" }
    ]},
    { section: "Pochette verte — Ventilation", position: "Poche principale", items: [
      { name: "Kit aérosol adulte (1)", type: "case", def: "true" },
      { name: "Kit aérosol enfant (1)", type: "case", def: "true" }
    ]},
    { section: "Pochette violette — Hygiène", position: "Poche principale", items: [
      { name: "Médinette (1)", type: "case", def: "true" },
      { name: "Gants UU (10)", type: "nombre", def: "10" },
      { name: "Sacs poubelle (2)", type: "nombre", def: "2" },
      { name: "Gel SHA (1)", type: "case", def: "true" }
    ]}
  ];
}

function getSacReserveContent_() {
  return [
    { section: "Solutés", position: "Poche principale", items: [
      { name: "Kit Perfusion (4)", type: "nombre", def: "4" },
      { name: "NaCl 0.9% 500ml (4)", type: "nombre", def: "4" },
      { name: "Kit Perfalgan (4)", type: "nombre", def: "4" },
      { name: "Kit NaCl 100ml (4)", type: "nombre", def: "4" },
      { name: "Kétoprofène 100ml (2)", type: "nombre", def: "2" },
      { name: "Glucose 10% 250ml (2)", type: "nombre", def: "2" },
      { name: "Ringer Lactate 500ml (1)", type: "case", def: "true" },
      { name: "Glucose 5% 500ml (1)", type: "case", def: "true" },
      { name: "Penthrox (1)", type: "case", def: "true" }
    ]},
    { section: "Pochette rouge longue — Intubation", position: "Poche principale", items: [
      { name: "Tube laryngé adulte taille 4 (1)", type: "case", def: "true" },
      { name: "Seringue étalonnée (1)", type: "case", def: "true" },
      { name: "Cale dents (1)", type: "case", def: "true" },
      { name: "Lame laryngoscope UU n°3 (1)", type: "case", def: "true" }
    ]},
    { section: "Poche latérale droite", position: "Latéral droit", items: [
      { name: "Perfuseur 3 voies (1)", type: "case", def: "true" },
      { name: "Bouchons (2)", type: "nombre", def: "2" },
      { name: "Seringues 10ml (2)", type: "nombre", def: "2" },
      { name: "Trocards (2)", type: "nombre", def: "2" },
      { name: "Valves anti-retour (2)", type: "nombre", def: "2" },
      { name: "Opsite (1)", type: "case", def: "true" },
      { name: "DASRI Médinette (1)", type: "case", def: "true" }
    ]},
    { section: "Poche latérale gauche — Aérosols", position: "Latéral gauche", items: [
      { name: "Kit aérosol adulte (2)", type: "nombre", def: "2" },
      { name: "Kit aérosol enfant (1)", type: "case", def: "true" }
    ]}
  ];
}

// =============================================
// === TRAÇABILITÉ INTERVENTIONS VLI ===
// =============================================
const INTERVENTIONS_SHEET = "Interventions_VLI";

function ensureInterventionsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(INTERVENTIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(INTERVENTIONS_SHEET);
    sheet.appendRow(["Date", "ISP", "CIS", "Commune", "N_Inter", "VLI", "Horodatage"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveVliIntervention(data) {
  try {
    if (!data || !data.date || !data.isp || !data.cis || !data.commune || !data.numInter || !data.vli) {
      return { success: false, error: "Tous les champs sont obligatoires." };
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INTERVENTIONS_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(INTERVENTIONS_SHEET);
      sheet.appendRow(["Date", "ISP", "CIS", "Commune", "N_Inter", "VLI", "Horodatage"]);
      sheet.setFrozenRows(1);
    }
    var horodatage = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    sheet.appendRow([data.date, data.isp, data.cis, data.commune, data.numInter, data.vli, horodatage]);
    return { success: true };
  } catch (e) {
    Logger.log("Erreur saveVliIntervention: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function getVliInterventions() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INTERVENTIONS_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return [];
    const tz = Session.getScriptTimeZone();
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    return data.map((r, i) => ({
      rowIndex: i + 2,
      date: r[0] instanceof Date ? Utilities.formatDate(r[0], tz, "dd/MM/yyyy")
           : r[0] ? Utilities.formatDate(new Date(r[0]), tz, "dd/MM/yyyy")
           : "",
      isp: String(r[1] || ""),
      cis: String(r[2] || ""),
      commune: String(r[3] || ""),
      numInter: String(r[4] || ""),
      vli: String(r[5] || ""),
      horodatage: r[6] instanceof Date ? Utilities.formatDate(r[6], tz, "dd/MM/yyyy HH:mm:ss")
                : String(r[6] || "")
    })).reverse();
  } catch (e) {
    Logger.log("Erreur getVliInterventions: " + e);
    return [];
  }
}

function deleteVliIntervention(rowIndex) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INTERVENTIONS_SHEET);
    if (!sheet) return { success: false, error: "Feuille introuvable." };
    if (rowIndex < 2 || rowIndex > sheet.getLastRow()) return { success: false, error: "Ligne invalide." };
    sheet.deleteRow(rowIndex);
    return { success: true };
  } catch (e) {
    Logger.log("Erreur deleteVliIntervention: " + e);
    return { success: false, error: e.toString() };
  }
}
