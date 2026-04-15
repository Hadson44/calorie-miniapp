(function () {
  const WATER_IMAGE = "./assets/images/water-glass.svg";

  function patchCatalog(list) {
    if (!Array.isArray(list)) return list;
    return list.map((item) => {
      if (!item || item.id !== "water") return item;
      return { ...item, image: WATER_IMAGE };
    });
  }

  if (Array.isArray(window.CALORIE_FOOD_CATALOG)) {
    window.CALORIE_FOOD_CATALOG = patchCatalog(window.CALORIE_FOOD_CATALOG);
  }

  if (Array.isArray(window.FOOD_DB)) {
    window.FOOD_DB = patchCatalog(window.FOOD_DB);
  }
})();
