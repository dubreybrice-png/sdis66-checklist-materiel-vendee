// Charger les formulaires depuis les feuilles Contenu_*
function loadFormStructures() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let formsData = {};
  
  sheets.forEach(sheet => {
    const name = sheet.getName();
    
    // Chercher les feuilles qui commencent par "Contenu "
    if (name.startsWith("Contenu ")) {
      const catName = name.replace("Contenu ", "").trim();
      const data = sheet.getDataRange().getValues();
      let sections = [];
      
      for (let i = 1; i < data.length; i++) {
        if (!data[i][0]) continue;
        
        const section = data[i][0] ? data[i][0].toString().trim() : "";
        const item = data[i][1] ? data[i][1].toString().trim() : "";
        const type = data[i][2] ? data[i][2].toString().toLowerCase().trim() : "texte";
        // Gérer les dates : Google Sheets convertit "2028-03-01" en objet Date
        let def = "";
        if (data[i][3] instanceof Date) {
          def = Utilities.formatDate(data[i][3], Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else if (data[i][3]) {
          def = data[i][3].toString().trim();
        }
        const position = data[i][4] ? data[i][4].toString().trim() : "";
        
        if (!section || !item) continue;
        
        let sec = sections.find(s => s.section === section);
        if (!sec) {
          sec = { section: section, position: position || "", items: [] };
          sections.push(sec);
        }
        
        sec.items.push({ name: item, type: type, def: def });
      }
      
      if (sections.length > 0) {
        formsData[catName] = sections;
        Logger.log("Chargé: " + catName + " (" + sections.length + " sections)");
      }
    }
  });
  
  // Sauvegarder
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty("FORMS_JSON", JSON.stringify(formsData));
  // Invalider le snapshot bootstrap pour forcer la reconstruction avec les nouvelles dates
  prop.deleteProperty("BOOTSTRAP_SNAPSHOT_V1");
  try { CacheService.getScriptCache().remove("BOOTSTRAP_V1"); } catch(e) {}
  
  Logger.log("Formulaires chargés: " + Object.keys(formsData).join(", "));
  return formsData;
}

// Appeler au démarrage pour charger les formulaires
function initializeForms() {
  const prop = PropertiesService.getScriptProperties();
  // V5: forcer le rechargement pour corriger le format des dates
  if (!prop.getProperty("FORMS_V5_DATE_FIX")) {
    loadFormStructures();
    prop.setProperty("FORMS_V5_DATE_FIX", "1");
    return;
  }
  if (!prop.getProperty("FORMS_JSON")) {
    loadFormStructures();
  }
}
