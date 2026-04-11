import { getValidationReport } from "@/lib/trainData";

if (process.env.NODE_ENV === "production") {
  console.log("[validateData] Skipped in production.");
  process.exit(0);
}

const report = getValidationReport();

console.log("\nRailverse Train Data Validation\n");
console.log(`Total trains       : ${report.totalTrains}`);
console.log(`Total schedules    : ${report.totalSchedules}`);
console.log(`Total stations     : ${report.totalStations}`);
console.log(`Missing train refs : ${report.missingTrainRefs}`);
console.log(`Missing station refs: ${report.missingStationRefs}`);
