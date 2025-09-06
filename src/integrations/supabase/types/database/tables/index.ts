import { AuthTables } from './auth';
import { DocumentTables } from './documents';
import { LeadTables } from './leads';
import { MessageTables } from './messages';
import { PipelineTables } from './pipelines';
import { SettingTables } from './settings';
import { TaskTables } from './tasks';

export interface Tables extends 
  AuthTables,
  DocumentTables,
  LeadTables,
  MessageTables,
  PipelineTables,
  SettingTables,
  TaskTables {}

export * from './auth';
export * from './documents';
export * from './leads';
export * from './messages';
export * from './pipelines';
export * from './settings';
export * from './tasks';