/* eslint-disable @typescript-eslint/no-inferrable-types */

import { APP_NAME } from '@src/main'
import { Severity } from './log.interface'

export interface LogMessage {
  message: string
  severity: Severity
  app_name?: string
  meta?: Record<string, unknown>
  uid?: string // code van 5 willekeurige cijfers
  timestamp?: Date
}

export const CreateLogMessage = (
  message: string,
  context: string,
  severity: Severity = Severity.info,
  timestamp = new Date(),
) =>
  ({
    message,
    severity,
    app_name: `${APP_NAME}/${context}`,
    timestamp,
  } as LogMessage)
