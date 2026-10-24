/**
 * F1 Data API
 *
 * This module exports the F1DataSource interface and a pre-configured instance.
 * The implementation (OpenF1) is hidden from consumers.
 */

export type { F1DataSource, SessionParams } from './types'
export type {
  Driver,
  DriverNumber,
  Location,
  Session,
  SessionKey,
} from '../types'

import { createOpenF1Adapter } from './openf1Adapter'

const API_URL: string =
  (import.meta.env.VITE_OPENF1_API_URL as string | undefined) ??
  'https://api.openf1.org/v1'

/**
 * Pre-configured F1 data source.
 * Consumers use this without knowing the underlying implementation.
 */
export const f1Data = createOpenF1Adapter(API_URL)
