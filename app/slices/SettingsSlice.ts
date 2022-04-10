import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ParserType from '../parser/ParserType';
import ConditionalComment from '../model/ConditionalComment';
import InitializationMode from '../model/InitializationMode';
import { Theme } from '../model/Theme';

export interface GeneralSettings {
  theme: Theme;
  autosave: boolean;
}

export interface BackupSettings {
  enabled: boolean;
}

export interface SchemaSettings {
  initMode: InitializationMode;
}

export interface CorrectionSettings {
  taskCorrectText: string;
  taskIncorrectText: string;
}

export interface MediaViewerSettings {
  showFileName: boolean;
  cycleFiles: boolean;
}

export interface ExportSettings {
  outputFormat: ParserType;
  valueTypeOverrideEnabled: boolean;
  valueTypeOverride: string;
  conditionalCommentEnabled: boolean;
  conditionalComments: ConditionalComment[];
}

export interface SettingsState {
  general: GeneralSettings;
  backup: BackupSettings;
  schema: SchemaSettings;
  correction: CorrectionSettings;
  mediaViewer: MediaViewerSettings;
  export: ExportSettings;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    general: {
      autosave: true,
      theme: Theme.SYSTEM,
    },
    backup: {
      enabled: true,
    },
    schema: {
      initMode: InitializationMode.MANUAL,
    },
    correction: {
      taskCorrectText: 'korrekt',
      taskIncorrectText: 'fehlt',
    },
    mediaViewer: {
      showFileName: true,
      cycleFiles: false,
    },
    export: {
      outputFormat: ParserType.Uni2Work,
      valueTypeOverrideEnabled: true,
      valueTypeOverride: 'Punkte',
      conditionalCommentEnabled: true,
      conditionalComments: [
        { text: 'Gut!', minPercentage: 0.5 },
        { text: 'Sehr Gut!', minPercentage: 0.75 },
        { text: 'Perfekt!', minPercentage: 1 },
      ],
    },
  } as SettingsState,
  reducers: {
    settingsSetGeneral(state, action: PayloadAction<GeneralSettings>) {
      state.general = action.payload;
    },
    settingsSetSchema(state, action: PayloadAction<SchemaSettings>) {
      state.schema = action.payload;
    },
    settingsSetCorrection(state, action: PayloadAction<CorrectionSettings>) {
      state.correction = action.payload;
    },
    settingsSetBackup(state, action: PayloadAction<BackupSettings>) {
      state.backup = action.payload;
    },
    settingsSetMediaViewer(state, action: PayloadAction<MediaViewerSettings>) {
      state.mediaViewer = action.payload;
    },
    settingsSetExport(state, action: PayloadAction<ExportSettings>) {
      state.export = action.payload;
    },
    settingsRemoveConditionalComment(state, action: PayloadAction<number>) {
      state.export.conditionalComments.splice(action.payload, 1);
    },
    settingsAddConditionalComment(
      state,
      action: PayloadAction<ConditionalComment>
    ) {
      state.export.conditionalComments.push(action.payload);
    },
    settingsUpdateConditionalCommentText(
      state,
      action: PayloadAction<{ index: number; text: string }>
    ) {
      state.export.conditionalComments[action.payload.index].text =
        action.payload.text;
    },
    settingsUpdateConditionalCommentValue(
      state,
      action: PayloadAction<number[]>
    ) {
      if (action.payload.length === state.export.conditionalComments.length) {
        action.payload.forEach((v, i) => {
          state.export.conditionalComments[i].minPercentage = v;
        });
      }
    },
  },
});
export const selectSettingsGeneral = (state): GeneralSettings =>
  state.settings.general;
export const selectSettingsBackup = (state): BackupSettings =>
  state.settings.backup;
export const selectSettingsSchema = (state): SchemaSettings =>
  state.settings.schema;
export const selectSettingsCorrection = (state): CorrectionSettings =>
  state.settings.correction;
export const selectSettingsMediaViewer = (state): MediaViewerSettings =>
  state.settings.mediaViewer;
export const selectSettingsExport = (state): ExportSettings =>
  state.settings.export;
export const selectSettings = (state) => state.settings;
export const {
  settingsSetGeneral,
  settingsSetBackup,
  settingsSetSchema,
  settingsSetCorrection,
  settingsSetMediaViewer,
  settingsSetExport,
  settingsAddConditionalComment,
  settingsRemoveConditionalComment,
  settingsUpdateConditionalCommentText,
  settingsUpdateConditionalCommentValue,
} = settingsSlice.actions;
export default settingsSlice.reducer;
