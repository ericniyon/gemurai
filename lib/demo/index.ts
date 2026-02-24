/**
 * YDEN HarvestPlus Demo Mode
 * Provides sample data exploration without affecting real database
 */

export { DemoModeProvider, useDemoMode, useDemoAwareData } from "./DemoModeContext"
export {
  SAMPLE_FARMERS,
  SAMPLE_COLLECTIONS,
  SAMPLE_SEASON_PLANS,
  SAMPLE_INPUT_USAGE,
  SAMPLE_MCC_STATS,
  generateDemoId,
  isDemoId,
} from "./sample-data"

export type {
  SampleFarmer,
  SampleCollection,
  SampleSeasonPlan,
  SampleInputUsage,
  SampleMCCStats,
} from "./sample-data"
