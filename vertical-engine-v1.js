/* Hous-Q Vertical Housing Engine v1.0
   Purpose: preliminary automatic floor estimation for multistorey housing.
   National reference data: PLANMalaysia GP001-A, Table 11 & Table 12.
   Important: plinth and gross-up factors below are Hous-Q preliminary modelling assumptions,
   not national statutory limits. Final height remains subject to PBT / Local Plan controls.
*/

const HOUSQ_VERTICAL_PARAMS = {
  'Rumah Bandar': {
    vertical: true,
    minFloorAreaSqm: 83.6,
    plinthRatio: 0.25,
    grossUpFactor: 1.15,
    source: 'GP001-A Jadual 11 & 12'
  },
  'Pangsapuri Kos Rendah': {
    vertical: true,
    minFloorAreaSqm: 65.0,
    plinthRatio: 0.35,
    grossUpFactor: 1.25,
    source: 'GP001-A Jadual 11 & 12'
  },
  'Pangsapuri Kos Sederhana': {
    vertical: true,
    minFloorAreaSqm: 79.0,
    plinthRatio: 0.35,
    grossUpFactor: 1.25,
    source: 'GP001-A Jadual 11 & 12'
  },
  'Kondominium / Pangsapuri Mewah': {
    vertical: true,
    minFloorAreaSqm: 92.9,
    plinthRatio: 0.35,
    grossUpFactor: 1.25,
    source: 'GP001-A Jadual 11 & 12'
  }
};

const SQM_PER_ACRE = 4046.8564224;

function housqEstimateFloors(type, housingAreaAcres, units) {
  const p = HOUSQ_VERTICAL_PARAMS[type];
  if (!p || !p.vertical || housingAreaAcres <= 0 || units <= 0) {
    return { floors: null, label: '—', source: null };
  }

  const siteSqm = housingAreaAcres * SQM_PER_ACRE;
  const assumedFootprintSqm = siteSqm * p.plinthRatio;
  const estimatedGrossResidentialFloorAreaSqm = units * p.minFloorAreaSqm * p.grossUpFactor;
  const floors = Math.max(1, Math.ceil(estimatedGrossResidentialFloorAreaSqm / assumedFootprintSqm));

  return {
    floors,
    label: `${floors} tingkat`,
    source: p.source,
    assumptions: {
      minFloorAreaSqm: p.minFloorAreaSqm,
      plinthRatio: p.plinthRatio,
      grossUpFactor: p.grossUpFactor
    }
  };
}

if (typeof window !== 'undefined') {
  window.HOUSQ_VERTICAL_PARAMS = HOUSQ_VERTICAL_PARAMS;
  window.housqEstimateFloors = housqEstimateFloors;
}
