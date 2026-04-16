// 📊 PL4TO - Benchmarks Québec (legacy shim)
// @deprecated — Utilisez canadaBenchmarks.js (getCanadaBenchmarks(province))
// Ce fichier ne contient plus de données ; il ré-exporte l'API legacy
// à partir du nouveau module canadaBenchmarks.js qui supporte toutes les provinces.

const {
  getCanadaBenchmarks,
  getQuebecBenchmarks,
  QUEBEC_BASELINE,
  PLATO_TO_BENCHMARK
} = require('./canadaBenchmarks');

// Alias rétrocompatibles pour les anciens consommateurs
const QUEBEC_BENCHMARKS = QUEBEC_BASELINE;

module.exports = {
  getQuebecBenchmarks,
  getCanadaBenchmarks,
  QUEBEC_BENCHMARKS,
  PLATO_TO_BENCHMARK
};
