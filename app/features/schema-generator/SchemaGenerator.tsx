/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import * as YAML from 'yaml';
import AddIcon from '@material-ui/icons/Add';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import { clipboard } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import {
  selectSchemaSelectedSheetId,
  selectSchemaTasks,
  selectSchemaRatings,
  selectSchemaEntities,
  schemaSetEntities,
  selectSchemaClipboard,
  schemaAddSimpleTask,
} from '../../model/SchemaSlice';
import { selectAllSheets } from '../../model/SheetSlice';
import RatingEntity from '../../model/RatingEntity';
import SheetEntity from '../../model/SheetEntity';
import { getMaxValueForTasks } from '../../utils/Formatter';
import { RatingsSchema, TasksSchema } from '../../model/NormalizationSchema';
import TaskEntity from '../../model/TaskEntity';
import { getTopLevelTasks } from '../../utils/TaskUtil';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import SchemaTaskList from './SchemaTaskList';
import { selectSettingsGeneral } from '../../model/SettingsSlice';
import { shouldUseDarkColors } from '../../model/Theme';
import { useModal } from '../../modals/ModalProvider';
import CheckClipboardEffect from '../../effects/CheckClipboardEffect';
import SchemaGeneratorToolbar from './SchemaGeneratorToolbar';

export default function SchemaGenerator() {
  const dispatch = useDispatch();
  const showModal = useModal();
  const { theme } = useSelector(selectSettingsGeneral);
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const tasksEntity: TaskEntity[] = useSelector(selectSchemaTasks);
  const ratingsEntity: RatingEntity[] = useSelector(selectSchemaRatings);
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
  const [advancedView, setAdvancedView] = useState<boolean>(false);
  const maxValueTasks: number = tasks
    ? getMaxValueForTasks(getTopLevelTasks(tasks))
    : 0;
  const maxValue: number = selectedSheet?.maxValue || maxValueTasks;
  const [skipCheck, setSkipCheck] = useState<boolean>(false);

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
          xs={advancedView ? 8 : 12}
          style={{
            flex: '1 1 0%',
            marginRight: '16px',
          }}
        >
          <Grid
            item
            style={{
              marginBottom: '12px',
            }}
          >
            <SchemaGeneratorToolbar
              sheets={sheets}
              selectedSheetId={selectedSheetId}
              ratings={ratings}
              maxValue={maxValue}
              selectedSheet={selectedSheet}
              tasksEntity={tasksEntity}
              tasks={tasks}
              ratingsEntity={ratingsEntity}
              maxValueTasks={maxValueTasks}
              type={type}
              setType={setType}
              setSkipCheck={setSkipCheck}
            />
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
        {advancedView && (
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
        )}
      </Grid>
    </Grid>
  );
}
