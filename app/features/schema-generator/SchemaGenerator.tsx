/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent, useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import * as YAML from 'yaml';
import AddIcon from '@material-ui/icons/Add';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';

import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import { clipboard } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import {
  schemaClearSelectedSheet,
  schemaSetSelectedSheet,
  selectSchemaSelectedSheetId,
  selectSchemaTasks,
  selectSchemaComments,
  selectSchemaRatings,
  selectSchemaEntities,
  schemaSetEntities,
  selectSchemaClipboard,
  schemaAddSimpleTask,
} from '../../model/SchemaSlice';
import { selectAllSheets } from '../../model/SheetSlice';
import CommentEntity from '../../model/CommentEntity';
import RatingEntity from '../../model/RatingEntity';
import SheetEntity from '../../model/SheetEntity';
import {
  getMaxValueForTasks,
  getTotalValueOfRatings,
} from '../../utils/Formatter';
import { RatingsSchema, TasksSchema } from '../../model/NormalizationSchema';
import TaskEntity from '../../model/TaskEntity';
import { getTopLevelTasks, hasTasksWithZeroMax } from '../../utils/TaskUtil';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import SchemaTaskList from './SchemaTaskList';
import {
  selectSettingsAutosave,
  selectSettingsTheme,
} from '../../model/SettingsSlice';
import { shouldUseDarkColors } from '../../model/Theme';
import { useModal } from '../../modals/ModalProvider';
import ConfirmationDialog from '../../dialogs/ConfirmationDialog';
import OverwriteSchemaDialog, {
  onInitializeSheet,
} from '../../dialogs/OverwriteSchemaDialog';
import CheckClipboardEffect from '../../effects/CheckClipboardEffect';

export default function SchemaGenerator() {
  const dispatch = useDispatch();
  const showModal = useModal();
  const autosave = useSelector(selectSettingsAutosave);
  const theme = useSelector(selectSettingsTheme);
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const tasksEntity: TaskEntity[] = useSelector(selectSchemaTasks);
  const ratingsEntity: RatingEntity[] = useSelector(selectSchemaRatings);
  const commentsEntity: CommentEntity[] = useSelector(selectSchemaComments);
  const clipboardOld = useSelector(selectSchemaClipboard);
  const entities = useSelector(selectSchemaEntities);
  const selectedSheet: SheetEntity | undefined = sheets.find(
    (s) => s.id === selectedSheetId
  );
  const tasks: Task[] = denormalize(
    tasksEntity.map((t) => t.id),
    TasksSchema,
    entities
  );
  const ratings: Rating[] = denormalize(
    ratingsEntity.map((t) => t.id),
    RatingsSchema,
    entities
  );

  const [type, setType] = useState('points');
  const maxValueTasks: number = tasks
    ? getMaxValueForTasks(getTopLevelTasks(tasks))
    : 0;
  const maxValue: number = selectedSheet?.maxValue || maxValueTasks;
  const [skipCheck, setSkipCheck] = useState<boolean>(false);

  function onSelectSheet(event) {
    const sheetId = event.target.value;
    if (event.target.value !== 'custom') {
      dispatch(schemaSetSelectedSheet(sheetId));
    } else {
      dispatch(schemaClearSelectedSheet());
    }
  }

  function onTypeChange(event: ChangeEvent<{ value: unknown }>) {
    setType(event.target.value as string);
  }

  function onAssignSchema() {
    onInitializeSheet(
      dispatch,
      showModal,
      autosave,
      selectedSheet,
      tasks,
      tasksEntity,
      ratingsEntity,
      commentsEntity
    );
  }

  function onOverwriteSchema() {
    showModal(
      ConfirmationDialog,
      OverwriteSchemaDialog(
        showModal,
        autosave,
        selectedSheet,
        tasks,
        tasksEntity,
        ratingsEntity,
        commentsEntity
      )
    );
  }

  function onCopyToClipboard() {
    setSkipCheck(true);
    clipboard.writeText(YAML.stringify(entities));
  }

  function onChange(newValue: string) {
    if (newValue !== null) {
      try {
        const newEntities = YAML.parse(newValue);
        if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
          dispatch(schemaSetEntities(newEntities));
        }
      } catch (error) {}
    }
  }

  useEffect(
    CheckClipboardEffect(
      dispatch,
      showModal,
      clipboard,
      sheets,
      clipboardOld,
      skipCheck,
      setSkipCheck,
      entities
    ),
    [clipboardOld, skipCheck, entities]
  );

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      spacing={4}
      style={{ height: 'calc(100% - 45px)', marginTop: '16px' }}
    >
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item style={{ margin: '0px 16px' }}>
          <Typography variant="h3">Schema Generator</Typography>
        </Grid>
      </Grid>
      <Grid
        item
        container
        wrap="nowrap"
        style={{ flex: '1 1 0%', height: '0px' }}
      >
        <Grid
          item
          container
          direction="column"
          xs={8}
          style={{
            flex: '1 1 0%',
            marginRight: '16px',
          }}
        >
          <Grid
            item
            style={{
              marginBottom: '8px',
            }}
          >
            <Paper
              elevation={3}
              style={{
                padding: '16px',
              }}
            >
              <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Grid
                  item
                  container
                  justify="space-between"
                  // wrap="nowrap"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    <FormControl size="small" variant="outlined">
                      <InputLabel id="sheet-select-label">
                        Schema for
                      </InputLabel>
                      <Select
                        labelId="sheet-select-label"
                        label="Schema for"
                        value={selectedSheetId || 'custom schema'}
                        onChange={onSelectSheet}
                      >
                        <MenuItem value="custom schema">Custom schema</MenuItem>
                        {sheets.map((s) => {
                          return (
                            <MenuItem key={s.id} value={s.id}>
                              {s.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <TextField
                      variant="outlined"
                      type="number"
                      label="Value"
                      size="small"
                      style={{ width: '6em' }}
                      InputProps={{
                        readOnly: true,
                      }}
                      inputProps={{
                        min: 0,
                        step: 0.5,
                      }}
                      value={getTotalValueOfRatings(ratings)}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      variant="outlined"
                      type="number"
                      label="Max"
                      size="small"
                      style={{ width: '6em' }}
                      InputProps={{
                        readOnly: true,
                      }}
                      inputProps={{
                        min: 0,
                        step: 0.5,
                      }}
                      value={maxValue}
                      error={
                        (selectedSheet &&
                          (maxValue !== selectedSheet?.maxValue ||
                            hasTasksWithZeroMax(tasksEntity) ||
                            maxValue <= 0)) ||
                        (!selectedSheet &&
                          (hasTasksWithZeroMax(tasksEntity) || maxValue <= 0))
                      }
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      variant="outlined"
                      label="Type"
                      size="small"
                      value={selectedSheet?.valueType || type}
                      onChange={onTypeChange}
                      InputProps={{
                        readOnly: selectedSheet === undefined,
                      }}
                      style={{ width: '110px' }}
                    />
                  </Grid>
                  {selectedSheet && (
                    <Grid item>
                      <Button
                        onClick={
                          selectedSheet &&
                          selectedSheet.tasks &&
                          selectedSheet.tasks.length > 0
                            ? onOverwriteSchema
                            : onAssignSchema
                        }
                        disabled={
                          maxValueTasks !== selectedSheet?.maxValue ||
                          hasTasksWithZeroMax(tasksEntity) ||
                          maxValueTasks <= 0
                        }
                      >
                        {selectedSheet &&
                        selectedSheet.tasks &&
                        selectedSheet.tasks.length > 0
                          ? 'Overwrite'
                          : 'Assign'}
                      </Button>
                    </Grid>
                  )}
                  <Grid item>
                    <Tooltip title="Copy to clipboard">
                      <span>
                        <IconButton
                          onClick={onCopyToClipboard}
                          disabled={
                            hasTasksWithZeroMax(tasksEntity) ||
                            maxValueTasks <= 0
                          }
                          size="small"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
                {selectedSheet &&
                  selectedSheet?.maxValue - maxValueTasks !== 0 && (
                    <Grid
                      item
                      container
                      xs={12}
                      justify="center"
                      alignItems="center"
                      style={{
                        paddingBottom: hasTasksWithZeroMax(tasksEntity)
                          ? '0px'
                          : '8px',
                      }}
                    >
                      <Grid item>
                        <Typography color="error">
                          {`${Math.abs(
                            selectedSheet?.maxValue - maxValueTasks
                          )} ${selectedSheet?.valueType || type} ${
                            selectedSheet?.maxValue - maxValueTasks < 0
                              ? 'too much'
                              : 'remaining'
                          }`}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                {hasTasksWithZeroMax(tasksEntity) && (
                  <Grid
                    item
                    container
                    xs={12}
                    justify="center"
                    alignItems="center"
                    style={{
                      paddingTop:
                        selectedSheet &&
                        selectedSheet?.maxValue - maxValueTasks !== 0
                          ? '0px'
                          : '8px',
                    }}
                  >
                    <Grid item>
                      <Typography color="error">
                        {`Some of the tasks have zero max ${
                          selectedSheet?.valueType || type
                        }`}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
          <Grid item style={{ flex: '1 1 0%' }}>
            <Paper
              elevation={3}
              style={{
                flex: '1 1 0%',
                height: '0px',
                minHeight: 'calc(100%)',
                overflow: 'auto',
                // padding: '16px',
              }}
            >
              <SchemaTaskList
                type={selectedSheet ? selectedSheet.valueType : type}
                tasks={getTopLevelTasks(tasks)}
                ratings={ratings}
                depth={0}
              />
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item>
                  <Button
                    variant="contained"
                    size="small"
                    style={{ margin: '5px 0 10px 0' }}
                    onClick={() => dispatch(schemaAddSimpleTask())}
                  >
                    Add Task
                    <AddIcon style={{ margin: '0px 0px 2px 5px' }} />
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={4} style={{ flex: '1 1 0%', marginRight: '16px' }}>
          <Paper
            elevation={3}
            style={{
              flex: '1 1 0%',
              height: '0px',
              minHeight: 'calc(100%)',
              overflow: 'auto',
            }}
          >
            <AceEditor
              mode="yaml"
              theme={shouldUseDarkColors(theme) ? 'twilight' : 'textmate'}
              width="100%"
              height="100%"
              maxLines={Infinity}
              value={entities ? YAML.stringify(entities) : ''}
              onChange={onChange}
              name="editor"
              editorProps={{ $blockScrolling: true }}
              style={{ flex: '1 1 0%', minHeight: '100%' }}
              showPrintMargin={false}
            />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
}
